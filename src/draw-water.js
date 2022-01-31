
const { SimplexNoise } = require("simplex-noise");
const normals = require("normals");
const createPlane = require("primitive-plane");
const regl = require("./regl");



const plane = createPlane(4, 4, 50, 50); // args; size of x, size of y, number of subdivisionos in x, number of subdivisions in y
const norms = normals.vertexNormals(plane.cells, plane.positions, 0.000000001); // third arg is epsilon value, used for calculating the normals. the bigger the geometry the larger this number needs to be

const drawWaterMesh = regl({
    // primitive: "lines", // to show the wireframe
    attributes: {
        position: regl.buffer(plane.positions), // buffer like a bond, you put your money/data in and then you cant get it out accept in specific conditions which makes it more cost effective
        normal: regl.buffer(norms)// norms is an array of arrays, if you pass an array to regl it automatically creates a buffer for you, a buffer is more efficient way of storing an array so when passing arrays around good to add buffer ourselves
    },
    elements: regl.elements(plane.cells),
    // elements: wireframe(plane.cells),
    cull: {  enable: true }, // cull enable true means dont draw the underside of the triangles. so this is an optimisation
    depth: { enable: true, mask: true }, // depth enable true means take depth into consideration, mask true makes sure that what you draw gets added to the depth to be considered
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
        attribute vec3 normal;
        varying vec3 v_normal;
        ${require("./noise.js")} // gonna use noise to make water bumpy


        void main(){
            v_normal = normal;
            v_position = position;
            float water_height = snoise(position.xy * 5.0) * 0.001;
            vec3 water_height_vec = vec3(0.0, 0.0, water_height);
            gl_Position = projection_matrix * view_matrix * vec4(position + water_height_vec , 1.0);
        }
    `,
    frag: `
        precision mediump float;
        varying vec3 v_normal;
        varying vec3 v_position;

        ${require("./noise.js")} // gonna use noise to make water bumpy
        ${require("./fog.js")} // we still need the fog, need to apply fog to everything.

        const float FOG_DENSITY = 0.5;

        void main(){
            float fogDistance = gl_FragCoord.z / gl_FragCoord.w;
            float fogAmount = fogFactorExp2(fogDistance, FOG_DENSITY);
            const vec3 fogColor = vec3(1.0); // white

            vec3 light_direction = vec3(0.0, 0.0, 1.0); // we need the light direction to know how bright the surface should be coloured.
            float light_brightness = max(0.0, dot(light_direction, v_normal)); // we input light direction and the vertext normal and use the dot product to work out how bright the color should be
            // if the surface is facing the light directly it should be really bright

            // albedo is the name for the color of hte surface wtihout any light on it
            vec3 albedo = vec3(0.0, 0.0, 1.0);
            vec3 water_color = vec3(albedo * light_brightness);

            gl_FragColor = vec4(mix(water_color, fogColor, fogAmount), 1.0);

        }

    `,


});


exports.drawWaterMesh = drawWaterMesh;