
const icosphere = require("icosphere");
const regl = require("./regl");
const { mat4 } = require("gl-matrix");
const { cannon_world, CANNON } = require("./cannon");

class Sphere{

    constructor(x, y, r){
        this.radius = r;
        this.model_matrix = mat4.create();
        this.body = new CANNON.Body({
            mass: 5, // kg
            position: new CANNON.Vec3(x, y, 1), // m
            shape: new CANNON.Sphere(this.radius),
        });
        cannon_world.addBody(this.body);

    }
    // step will only exist on the instance not on the class
    step (){
        if (this.body.position.z < -10) {
            this.body.position.set(
                Math.random() - 0.5,
                Math.random() - 0.5,
                0.95 + Math.random() * 0.1
            );
            this.body.velocity.setZero();
        }

        mat4.identity(this.model_matrix); // takes matrix and resets its transformation  to its original identity
        mat4.fromRotationTranslationScale(this.model_matrix, [this.body.quaternion.x, this.body.quaternion.y, this.body.quaternion.z, this.body.quaternion.w], [this.body.position.x, this.body.position.y, this.body.position.z], [this.radius, this.radius, this.radius]);
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