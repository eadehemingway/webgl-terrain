
const { mat4 } = require("gl-matrix");
const wireframe = require("gl-wireframe");
const { TerrainTile } = require("./draw-mesh");
const regl = require("./regl");


// projection is the translation step between 3d and 2d. the projection is like the .range() method in a d3 scale. The space we have to deal with when converting 3d to 2d
const projection_matrix = mat4.create(); // dont need to understand the maths for this but basically returns 16 numbers that has all the info in it for any tranformation sequence
const view_matrix = mat4.create(); // for positioning the camera


const terrain_tiles = {};

for (var x = -1; x <= 1; x ++){
    for (var y = -1; y <= 1; y ++){
        let key = `${x}, ${y}`;
        terrain_tiles[key] = new TerrainTile(x, y);
    }
}


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

        const t = Date.now() / 10000;
        const distance = 2;
        const eye_x = Math.cos(t) * distance;
        const eye_y = Math.sin(t) * distance;
        const eye = [eye_x, eye_y, 0.4];
        // position camera --------
        // the camera starts off being in hte middle of the projection so it cant see anyhting until it has a little distance
        mat4.lookAt(view_matrix, eye, [0, 0, 0], [0, 0, 1]); // this positions the camera at this position. lookAt(out, eye, center, up)


        for(var key in terrain_tiles){
            const tile = terrain_tiles[key];
            TerrainTile.drawMesh({ grass, projection_matrix, view_matrix , norms:tile.norms, plane: tile.plane });
        }
    }

    regl.frame(render);

};