const REGL = require("regl");
const { mat4 } = require("gl-matrix");
const createPlane = require("primitive-plane");
const wireframe = require("gl-wireframe");
const { SimplexNoise } = require("simplex-noise");
const normals = require("normals");

const plane = createPlane(1, 1, 50, 50); // args; size of x, size of y, number of subdivisionos in x, number of subdivisions in y
const regl = REGL({});

// projection is the translation step between 3d and 2d. the projection is like the .range() method in a d3 scale. The space we have to deal with when converting 3d to 2d
const projection_matrix = mat4.create(); // dont need to understand the maths for this but basically returns 16 numbers that has all the info in it for any tranformation sequence
const view_matrix = mat4.create(); // for positioning the camera

const seed = "hello"; // means the noise will always produce the same results
const simplex = new SimplexNoise(seed);

plane.positions.forEach(p=> {
    const frequency = 0.4;
    const height = 0.2;

    function getNoise(x, y, freq, height){
        return simplex.noise2D(x * freq, y * freq) * height;
    }
    p[2] += getNoise(p[0], p[1], frequency, height);
    p[2] += getNoise(p[0], p[1], frequency * 2.5, height / 2);
    p[2] += getNoise(p[0], p[1], frequency * 8, height / 6);
    p[2] += getNoise(p[0], p[1], frequency * 16, height / 24);

});

const norms = normals.vertexNormals(plane.cells, plane.positions, 0.000000001);

const drawPoints = regl({
    // primitive: "lines", // to show the wireframe
    attributes: {
        position: plane.positions,
        normal: norms
    },
    elements: plane.cells,
    // elements: wireframe(plane.cells),
    cull: {  enable:false },
    depth: { enable: false, mask: false },
    uniforms: {
        projection_matrix: ()=> projection_matrix,
        view_matrix: ()=> view_matrix,
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

        void main(){

            vec3 light_direction = vec3(0.0, 0.0, 1.0); // we need the light direction to know how bright the surface should be coloured.
            float light_brightness = max(0.0, dot(light_direction, v_normal)); // we input light direction and the vertext normal and use the dot product to work out how bright the color should be
            // if the surface is facing the light directly it should be really bright

            // albedo is the name for the color of hte surface wtihout any light on it
            vec3 albedo = texture2D(grass_texture, v_position.xy).rgb;
            gl_FragColor = vec4(albedo * light_brightness, 1.0);

        }

    `,


});


const img = document.createElement("img");
img.src = "./grass.jpg";
img.onload = ()=> {

    const grass = regl.texture({ data: img, wrap: "repeat" });

    function render(){
        const green = [0.2, 0.5, 0.4, 1.0]; // arbitrary background
        regl.clear({ color: green });

        // calculating the perspective projection ----------
        const ratio = window.innerWidth/ window.innerHeight;
        const field_of_view = Math.PI/4; // 8th of a circle in radians

        mat4.perspective(projection_matrix, field_of_view, ratio, 0.01, 100.0); // adds concept of perspective (objcts getting bigger as they get closer)


        // position camera --------
        // the camera starts off being in hte middle of the projection so it cant see anyhting until it has a little distance
        mat4.lookAt(view_matrix, [1, 1, 1], [0, 0, 0], [0, 0, 1]); // this positions the camera at this position. lookAt(out, eye, center, up)

        drawPoints({ grass });
    }

    regl.frame(render);

};