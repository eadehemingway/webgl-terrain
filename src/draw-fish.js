const boids = require("boids");
console.log("boids:", boids);
// const icosphere = require("icosphere");

const flock = boids({
    boids: 50,              // The amount of boids to use
    speedLimit: 0,          // Max steps to take per tick
    accelerationLimit: 1,   // Max acceleration per tick
    separationDistance: 60, // Radius at which boids avoid others
    alignmentDistance: 180, // Radius at which boids align with others
    choesionDistance: 180,  // Radius at which boids approach others
    separationForce: 0.15,  // Speed to avoid at
    alignmentForce: 0.25,   // Speed to align with other boids
    choesionForce: 0.1,     // Speed to move towards other boids
    attractors: []
});

// const sphere_mesh = icosphere(3);
// const drawSphere = regl({
//     attributes: {
//         position: sphere_mesh.positions, // for a sphere normals equivalent to poistions

//     },
//     elements: sphere_mesh.cells,
//     uniforms: {
//         projection_matrix: regl.prop("projection_matrix"),
//         view_matrix: regl.prop("view_matrix"),
//         // model_matrix: regl.prop("model_matrix") // dont need model matrix for fish...without the model matrix eveythin is at 0,0,0
//     },
//     vert: `
//     precision mediump float;
//     uniform mat4 projection_matrix;
//     uniform mat4 view_matrix;
//     attribute vec3 position;
//     varying vec3 v_position;

//     void main(){
//         v_position = position;
//         gl_Position = projection_matrix * view_matrix * vec4(position, 1.0);
//     }

//     `,
//     frag: `
//         precision mediump float;

//         void main () {
//             gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

//         }
//     `

// });


// const drawFish = regl({
//     attributes: {
//         position: regl.buffer(plane.positions), // buffer like a bond, you put your money/data in and then you cant get it out accept in specific conditions which makes it more cost effective
//         normal: regl.buffer(norms)// norms is an array of arrays, if you pass an array to regl it automatically creates a buffer for you, a buffer is more efficient way of storing an array so when passing arrays around good to add buffer ourselves
//     },
//     elements: regl.elements(plane.cells),
//     // elements: wireframe(plane.cells),
//     cull: {  enable: true }, // cull enable true means dont draw the underside of the triangles. so this is an optimisation
//     depth: { enable: true, mask: true }, // depth enable true means take depth into consideration, mask true makes sure that what you draw gets added to the depth to be considered
//     uniforms: {
//         projection_matrix: regl.prop("projection_matrix"),
//         view_matrix: regl.prop("view_matrix"),
//         time_elapsed: regl.context("time")
//     },
//     vert: `
//         precision mediump float;
//         uniform mat4 projection_matrix;
//         uniform mat4 view_matrix;
//         uniform float time_elapsed;
//         attribute vec3 position;
//         varying vec3 v_position;
//         attribute vec3 normal;
//         varying vec3 v_normal;
//         ${require("./3d-noise.js")} // gonna use 3d noise for animated bumpy water


//         void main(){
//             v_normal = normal;
//             v_position = position;
//             float water_height = snoise(vec3(position.xy * 5.0, time_elapsed)) * 0.01;
//             vec3 water_height_vec = vec3(0.0, 0.0, water_height);
//             gl_Position = projection_matrix * view_matrix * vec4(position + water_height_vec , 1.0);
//         }
//     `,
//     frag: `
//         precision mediump float;
//         varying vec3 v_normal;
//         varying vec3 v_position;

//         ${require("./noise.js")} // gonna use noise to make water bumpy
//         ${require("./fog.js")} // we still need the fog, need to apply fog to everything.

//         const float FOG_DENSITY = 0.5;

//         void main(){
//             float fogDistance = gl_FragCoord.z / gl_FragCoord.w;
//             float fogAmount = fogFactorExp2(fogDistance, FOG_DENSITY);
//             const vec3 fogColor = vec3(1.0); // white

//             vec3 light_direction = vec3(0.0, 0.0, 1.0); // we need the light direction to know how bright the surface should be coloured.
//             float light_brightness = max(0.0, dot(light_direction, v_normal)); // we input light direction and the vertext normal and use the dot product to work out how bright the color should be
//             // if the surface is facing the light directly it should be really bright

//             // albedo is the name for the color of hte surface wtihout any light on it
//             vec3 albedo = vec3(0.0, 0.0, 1.0);
//             vec3 water_color = vec3(albedo * light_brightness);

//             gl_FragColor = vec4(mix(water_color, fogColor, fogAmount), 0.4);

//         }

// `
// });


module.exports = {
    flock
};
// module.exports.drawSphere = drawSphere;