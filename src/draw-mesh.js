
const { SimplexNoise } = require("simplex-noise");
const normals = require("normals");
const createPlane = require("primitive-plane");

exports.TerrainTile = class TerrainTile {
    constructor(regl, tile_x, tile_y){
        const plane = createPlane(1, 1, 50, 50); // args; size of x, size of y, number of subdivisionos in x, number of subdivisions in y
        const seed = "hello"; // means the noise will always produce the same results
        const simplex = new SimplexNoise(seed);

        plane.positions.forEach(p=> {
            const frequency = 0.4;
            const height = 0.2;

            p[0] += tile_x;
            p[1] += tile_y;
            function getNoise(x, y, freq, height){
                return simplex.noise2D(x * freq, y * freq) * height;
            }
            p[2] += getNoise(p[0], p[1], frequency, height);
            p[2] += getNoise(p[0], p[1], frequency * 2.5, height / 2);
            p[2] += getNoise(p[0], p[1], frequency * 8, height / 6);
            p[2] += getNoise(p[0], p[1], frequency * 16, height / 24);

        });

        const norms = normals.vertexNormals(plane.cells, plane.positions, 0.000000001);
        this.drawMesh = regl({
        // primitive: "lines", // to show the wireframe
            attributes: {
                position: plane.positions,
                normal: norms
            },
            elements: plane.cells,
            // elements: wireframe(plane.cells),
            cull: {  enable: true }, // cull enable true means dont draw the underside of the triangles. so this is an optimisation
            depth: { enable: true, mask: true }, // depth enable true means take depth into consideration, mask true makes sure that what you draw gets added to the depth to be considered
            uniforms: {
                projection_matrix: regl.prop("projection_matrix"),
                view_matrix: regl.prop("view_matrix"),
                grass_texture: regl.prop("grass")
            },
            vert: `
            precision mediump float;
            uniform mat4 projection_matrix;
            uniform mat4 view_matrix;
            attribute vec3 position;
            varying vec3 v_position;
            attribute vec3 normal;
            varying vec3 v_normal;

            void main(){
                v_normal = normal;
                v_position = position;
                gl_Position = projection_matrix * view_matrix * vec4(position, 1.0);
            }
        `,
            frag: `
            precision mediump float;
            varying vec3 v_normal;
            varying vec3 v_position;
            uniform sampler2D grass_texture;
            ${require("./noise.js")} // this imports the 2d noise from the file
            ${require("./fog.js")}

            vec2 rotate(vec2 v, float a) { // we got this from glsl rotate2d (for rotating any vec2)
                float s = sin(a);
                float c = cos(a);
                mat2 m = mat2(c, -s, s, c);
                return m * v;
            }

            const float FOG_DENSITY = 0.5;

            void main(){
                float fogDistance = gl_FragCoord.z / gl_FragCoord.w;
                float fogAmount = fogFactorExp2(fogDistance, FOG_DENSITY);
                const vec3 fogColor = vec3(1.0); // white

                vec3 light_direction = vec3(0.0, 0.0, 1.0); // we need the light direction to know how bright the surface should be coloured.
                float light_brightness = max(0.0, dot(light_direction, v_normal)); // we input light direction and the vertext normal and use the dot product to work out how bright the color should be
                // if the surface is facing the light directly it should be really bright

                // we times v_position.xy by 10 to make the tiling more obvious (so we can see the effects of fixing it)
                vec3 grass_one = texture2D(grass_texture, v_position.xy * 10.0).rgb;
                vec3 grass_two = texture2D(grass_texture, rotate(v_position.xy * 10.0, 1.0)).rgb;
                float blend_factor = snoise(v_position.xy * 5.0) * 0.5 + 0.5;

                // albedo is the name for the color of hte surface wtihout any light on it
                vec3 albedo = mix(grass_one, grass_two, blend_factor);
                vec3 terrain_color = vec3(albedo * light_brightness);

                gl_FragColor = vec4(mix(terrain_color, fogColor, fogAmount), 1.0);

            }

        `,


        });

    }

};

