
const icosphere = require("icosphere");
const regl = require("./regl");
const { mat4 } = require("gl-matrix");
const { world } = require("./oimo");


class Sphere{

    constructor(x, y, r){
        this.model_matrix = mat4.create();

        var body = world.add({
            type:"sphere", // type of shape : sphere, box, cylinder
            size:[1,1,1], // size of shape
            pos:[0,0,0], // start position in degree
            rot:[0,0,90], // start rotation in degree
            move:true, // dynamic or statique
            density: 1,
            friction: 0.2,
            restitution: 0.2,
            belongsTo: 1, // The bits of the collision groups to which the shape belongs.
            collidesWith: 0xffffffff // The bits of the collision groups with which the shape collides.
        });

        this.body = body;

    }
    // step will only exist on the instance not on the class
    step (){
        const position = this.body.getPosition();
        mat4.identity(this.model_matrix); // takes matrix and resets its transformation  to its original identity
        mat4.scale(this.model_matrix, this.model_matrix, [0.05, 0.05, 0.05]);
        mat4.translate(this.model_matrix, this.model_matrix, [position.x, position.y, position.z]);
    }

};

const sphere_mesh = icosphere(3); // only need to do this once (no matter how many spheeres you create)

// drawSphere will only exist on the class not on the instance
Sphere.drawSphere = regl({
    attributes: {
        position: sphere_mesh.positions, // for a sphere normals equivalent to poistions

    },
    elements: sphere_mesh.cells,
    uniforms: {
        projection_matrix: regl.prop("projection_matrix"),
        view_matrix: regl.prop("view_matrix"),
        model_matrix: regl.prop("model_matrix")
    },
    vert: `
    precision mediump float;
    uniform mat4 projection_matrix;
    uniform mat4 view_matrix;
    uniform mat4 model_matrix;
    attribute vec3 position;
    varying vec3 v_position;

    void main(){
        v_position = position;
        gl_Position = projection_matrix * view_matrix * model_matrix * vec4(position, 1.0);
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