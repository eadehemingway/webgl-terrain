
const { Sphere } = require("./draw-sphere");
const { mat4 } = require("gl-matrix");

const { TerrainTile } = require("./draw-mesh");
const regl = require("./regl");
const { cannon_world, CANNON } = require("./cannon");


cannon_world.gravity.set( 0,  0, -1);

// projection is the translation step between 3d and 2d. the projection is like the .range() method in a d3 scale. The space we have to deal with when converting 3d to 2d
const projection_matrix = mat4.create(); // dont need to understand the maths for this but basically returns 16 numbers that has all the info in it for any tranformation sequence
const view_matrix = mat4.create(); // for positioning the camera



const terrain_tiles = {};
// const sphere = new Sphere(0, 0, 0.5);
const sphere_array = [];
for (var i = 0; i < 100; i ++){
    const sphere = new Sphere(Math.random()* 25 - 12.5, Math.random()* 25 - 12.5, 0.2);
    sphere_array.push(sphere);
}

for (var x = 0; x < 1; x ++){
    for (var y = 0; y < 1; y ++){
        let key = `${x}, ${y}`;
        terrain_tiles[key] = new TerrainTile(x, y);
    }
}
// for (var x = -1; x <= 1; x ++){
//     for (var y = -1; y <= 1; y ++){
//         let key = `${x}, ${y}`;
//         terrain_tiles[key] = new TerrainTile(x, y);
//     }
// }

// Current position of the mouse on the screen, from 0-1
const mouseCoord = [0.5, 0.5];

window.addEventListener("mousemove", (e) => {
    mouseCoord[0] = e.x / window.innerWidth;
    mouseCoord[1] = e.y / window.innerHeight;
}, false);


const img = document.createElement("img");
img.src = "./grass.jpg";
img.onload = ()=> {

    const grass = regl.texture({ data: img, wrap: "repeat" });

    function render(){
        const green = [0.2, 0.5, 0.4, 1.0]; // arbitrary background
        regl.clear({ color: [1, 1, 1, 1] });

        // calculating the perspective projection ----------
        const ratio = window.innerWidth/ window.innerHeight;
        const field_of_view = Math.PI/4; // 8th of a circle in radians

        mat4.perspective(projection_matrix, field_of_view, ratio, 0.01, 100.0); // adds concept of perspective (objcts getting bigger as they get closer)

        const angle = mouseCoord[0] * Math.PI * 2;
        const distance = 1 + mouseCoord[1];
        const eye_x = Math.cos(angle) * distance;
        const eye_y = Math.sin(angle) * distance;
        const eye_z = 3 - mouseCoord[1] * 3;
        const eye = [eye_x, eye_y, eye_z];
        // position camera --------
        // the camera starts off being in hte middle of the projection so it cant see anyhting until it has a little distance
        mat4.lookAt(view_matrix, eye, [0, 0, 0], [0, 0, 1]); // this positions the camera at this position. lookAt(out, eye, center, up)


        for(var key in terrain_tiles){
            const tile = terrain_tiles[key];
            TerrainTile.drawMesh({ grass, projection_matrix, view_matrix , norms:tile.norms, plane: tile.plane });
        }
        for (var i = 0; i < 100; i ++){
            sphere_array[i].step();
            Sphere.drawSphere({ projection_matrix, view_matrix, model_matrix: sphere_array[i].model_matrix });
        }
        // sphere.step();
        // Sphere.drawSphere({ projection_matrix, view_matrix, model_matrix: sphere.model_matrix });
        cannon_world.step(1/60, 1/60, 3); // giving it values that will make it update in time with our frame rate

    }

    regl.frame(render);

};