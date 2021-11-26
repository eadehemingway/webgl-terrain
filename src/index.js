const REGL = require("regl");
const { mat4 } = require("gl-matrix");


const regl = REGL({});

// projection is the translation step between 3d and 2d. the projection is like the .range() method in a d3 scale. The space we have to deal with when converting 3d to 2d
const projection_matrix = mat4.create(); // dont need to understand the maths for this but basically returns 16 numbers that has all the info in it for any tranformation sequence
const view_matrix = mat4.create(); // for positioning the camera


const drawPoints = regl({
    // primitive: "lines", // to show the wireframe
    attributes: {
        position: []
    },
    // elements: wireframe(plane.cells),
    elements: [],
    cull: {  enable:false },
    depth: { enable: false, mask: false },
    uniforms: {
        projection_matrix: ()=> projection_matrix,
        view_matrix: ()=> view_matrix,
    },
    vert: `
        precision mediump float;
        uniform mat4 projection_matrix;
        uniform mat4 view_matrix;
        attribute vec3 position;
        varying vec3 v_position;


        void main(){
            v_position = position;
            gl_Position = projection_matrix * view_matrix * vec4(position, 1.0);
        }
    `,
    frag: `
        precision mediump float;


        void main(){

            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

        }

    `,


});




function render(){
    const green = [0.2, 0.5, 0.4, 1.0]; // arbitrary background
    regl.clear({ color: green });

    // calculating the perspective projection ----------
    const ratio = window.innerWidth/ window.innerHeight;
    const field_of_view = Math.PI/4; // 8th of a circle in radians

    mat4.perspective(projection_matrix, field_of_view, ratio, 0.01, 100.0); // adds concept of perspective (objcts getting bigger as they get closer)


    // position camera --------
    // the camera starts off being in hte middle of the projection so it cant see anyhting until it has a little distance
    mat4.lookAt(view_matrix, [1, 1, 1], [0, 0, 0], [0, 0, 1]); // this positions the camera at this position

    drawPoints();
}

regl.frame(render);
