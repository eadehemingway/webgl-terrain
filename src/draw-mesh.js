
const { SimplexNoise } = require("simplex-noise");
const normals = require("normals");
const createPlane = require("primitive-plane");
const wireframe = require("gl-wireframe");
const regl = require("./regl");

const mesh_resolution = 50;

const seed = "hello"; // means the noise will always produce the same results
const simplex = new SimplexNoise(seed);

function getHeight(x, y){
    const frequency = 0.4;
    const amplitude = 0.2;
    let height = 0;
    height += getNoise(x, y, frequency, amplitude);
    height += getNoise(x, y, frequency * 2.5, amplitude / 2);
    height += getNoise(x, y, frequency * 8, amplitude / 6);
    height += getNoise(x, y, frequency * 16, amplitude / 24);
    return height;
}

function getNoise(x, y, freq, height){
    return simplex.noise2D(x * freq, y * freq) * height;
}
class TerrainTile {

    constructor(tile_x, tile_y){
        // if we create a plane with height 1 and width 1, it will put 0 in the center of the tile so the tile will go from -0.5 to +0.5
        const plane = createPlane(2, 2, mesh_resolution, mesh_resolution); // args; size of x, size of y, number of subdivisionos in x, number of subdivisions in y
        plane.positions.forEach(p=> {
            p[0] += tile_x;
            p[1] += tile_y;
            p[2] += getHeight(p[0], p[1]);

        });
        const norms = normals.vertexNormals(plane.cells, plane.positions, 0.000000001);
        this.norms = regl.buffer(norms); // norms is an array of arrays, if you pass an array to regl it automatically creates a buffer for you, a buffer is more efficient way of storing an array so when passing arrays around good to add buffer ourselves
        this.plane = plane;
        this.plane.positions = regl.buffer(this.plane.positions);
        this.plane.cells = regl.elements(wireframe(this.plane.cells));


        // create terrain in physics world
        // the height_field_array will be an array of arrays, where each sub array is a row of squares in teh grid
        // we first iterate over y to get colums and then iterate over x to get rows
        const height_field_array = []; // this will be an array of z values because z is our up
        // we have 9 tiles and each tile has 50 rows and 50 columns (2500 cells)
        for(let y_index = 0; y_index <= mesh_resolution; y_index++){
            let row = [];
            for(let x_index = 0; x_index <= mesh_resolution; x_index++){

                const cell_x = x_index/(mesh_resolution) - 0.5;
                const cell_y = y_index/(mesh_resolution) - 0.5;
                const height = getHeight(tile_x + cell_x, tile_y + cell_y);
                row.push(height);
            }
            height_field_array.push(row);
        }






    }




};

TerrainTile.drawMesh = regl({
    primitive: "lines", // to show the wireframe
    attributes: {
        position: regl.prop("plane.positions"),
        normal: regl.prop("norms")
    },
    elements: regl.prop("plane.cells"),
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

        const float FOG_DENSITY = 0.0;

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


exports.TerrainTile = TerrainTile;