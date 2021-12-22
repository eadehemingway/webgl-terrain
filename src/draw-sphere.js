
const icosphere = require("icosphere");
const regl = require("./regl");

class Sphere{

    constructor(x, y, r){



    }


};

const sphere_mesh = icosphere(3);

Sphere.drawSphere = regl({
    attributes: {
        position: sphere_mesh.positions, // for a sphere normals equivalent to poistions

    },
    elements: sphere_mesh.cells,
    uniforms: {
        projection_matrix: regl.prop("projection_matrix"),
        view_matrix: regl.prop("view_matrix"),
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

    void main () {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

    }
    `

});

exports.Sphere = Sphere;