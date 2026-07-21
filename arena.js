/*==========================================================
    Arena Battle 3D
    arena.js STABLE

    Sistem:
    - Scene 3D
    - Kamera
    - Lighting
    - Arena
    - Border
    - Optimasi Mobile
==========================================================*/


"use strict";



/*==========================================================
    SCENE
==========================================================*/


const scene = new THREE.Scene();


scene.background =
new THREE.Color(

    0x202735

);



/*==========================================================
    CAMERA
==========================================================*/


const camera =
new THREE.PerspectiveCamera(

    60,

    window.innerWidth /
    window.innerHeight,

    0.1,

    1000

);



camera.position.set(

    0,

    8,

    10

);



camera.lookAt(

    0,

    0,

    0

);





/*==========================================================
    RENDERER
==========================================================*/


const renderer =
new THREE.WebGLRenderer({

    antialias:true,

    powerPreference:"high-performance"

});



renderer.setSize(

    window.innerWidth,

    window.innerHeight

);



renderer.setPixelRatio(

    Math.min(

        window.devicePixelRatio,

        2

    )

);



renderer.shadowMap.enabled=true;


document.body.appendChild(

    renderer.domElement

);





/*==========================================================
    LIGHT SYSTEM
==========================================================*/


const ambientLight =
new THREE.AmbientLight(

    0xffffff,

    0.5

);



scene.add(

    ambientLight

);




const sunLight =
new THREE.DirectionalLight(

    0xffffff,

    1

);



sunLight.position.set(

    5,

    10,

    5

);



sunLight.castShadow=true;



scene.add(

    sunLight

);





/*==========================================================
    FLOOR
==========================================================*/


const floorGeometry =
new THREE.PlaneGeometry(

    30,

    30

);



const floorMaterial =
new THREE.MeshStandardMaterial({

    color:0x286030

});



const floor =
new THREE.Mesh(

    floorGeometry,

    floorMaterial

);



floor.rotation.x =
-Math.PI/2;



floor.receiveShadow=true;



scene.add(

    floor

);





/*==========================================================
    ARENA WALL
==========================================================*/


const borderMaterial =
new THREE.MeshStandardMaterial({

    color:0x444444

});



function createWall(

    x,

    z,

    sx,

    sz

){


    const geometry =
    new THREE.BoxGeometry(

        sx,

        1,

        sz

    );



    const wall =
    new THREE.Mesh(

        geometry,

        borderMaterial

    );



    wall.position.set(

        x,

        0.5,

        z

    );



    wall.castShadow=true;



    scene.add(

        wall

    );


}



createWall(

    0,

    -15,

    30,

    0.5

);



createWall(

    0,

    15,

    30,

    0.5

);



createWall(

    -15,

    0,

    0.5,

    30

);



createWall(

    15,

    0,

    0.5,

    30

);





/*==========================================================
    DECORATION
==========================================================*/


function createTree(x,z){



    const trunk =
    new THREE.Mesh(

        new THREE.CylinderGeometry(

            0.2,

            0.3,

            1

        ),

        new THREE.MeshStandardMaterial({

            color:0x704214

        })

    );



    trunk.position.set(

        x,

        0.5,

        z

    );



    scene.add(trunk);



    const leaf =
    new THREE.Mesh(

        new THREE.SphereGeometry(

            0.7,

            8,

            8

        ),

        new THREE.MeshStandardMaterial({

            color:0x0b6623

        })

    );



    leaf.position.set(

        x,

        1.3,

        z

    );



    scene.add(leaf);


}



createTree(-8,-8);

createTree(8,-8);

createTree(-8,8);

createTree(8,8);





/*==========================================================
    OBJECT STORAGE
==========================================================*/


const worldObjects=[];



function addWorldObject(obj){


    worldObjects.push(obj);


    scene.add(obj);


}





/*==========================================================
    RESIZE
==========================================================*/


window.addEventListener(

"resize",

()=>{


    camera.aspect =

    window.innerWidth /

    window.innerHeight;



    camera.updateProjectionMatrix();



    renderer.setSize(

        window.innerWidth,

        window.innerHeight

    );


}

);





/*==========================================================
    RENDER
==========================================================*/


function renderScene(){


    renderer.render(

        scene,

        camera

    );


}