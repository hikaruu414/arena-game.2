/*==========================================================
    Arena Battle 3D
    tower.js FINAL

    Sistem:
    - Tower 3D fantasy
    - Target minion
    - Target hero
    - Crystal tower
    - Attack system
    - Destroy system
==========================================================*/


"use strict";



const Towers=[];



const TOWER_CONFIG={

    hp:1200,

    damage:30,

    range:8,

    cooldown:1.2

};







/*==========================================================
    CREATE TOWER
==========================================================*/


function createTower(team,x,z){



    const tower =
    new THREE.Group();





    const color = team==="player" ? 0x3d8bff : 0xff4d4d;

    const dark = team==="player" ? 0x2a5fc0 : 0xb82e2e;

    // ALAS
    tower.add(makePart(
        new THREE.CylinderGeometry(1.6,1.8,0.4,14),
        0x8d8fa3, 0, 0.2, 0
    ));

    // BADAN BAWAH
    tower.add(makePart(
        new THREE.CylinderGeometry(1.1,1.35,1.8,14),
        0xb7b9cc, 0, 1.3, 0
    ));

    // PITA WARNA TIM
    tower.add(makePart(
        new THREE.CylinderGeometry(1.16,1.16,0.3,14),
        color, 0, 2.3, 0, { outline:1.06 }
    ));

    // BADAN ATAS
    tower.add(makePart(
        new THREE.CylinderGeometry(0.95,1.1,1.0,14),
        0xc9cbdd, 0, 2.95, 0
    ));

    // PUNCAK
    tower.add(makePart(
        new THREE.CylinderGeometry(1.3,1.0,0.45,14),
        dark, 0, 3.65, 0
    ));

    // KRISTAL (melayang dan berputar)
    const crystal = makePart(
        new THREE.OctahedronGeometry(0.5),
        color, 0, 4.55, 0,
        { material:{ emissive:color, emissiveIntensity:0.7 } }
    );

    tower.add(crystal);

    registerAnimated(crystal,"spin",1.6);
    registerAnimated(crystal,"bob",2,0.15);

    // CINCIN DI TANAH
    const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.95,2.4,36),
        new THREE.MeshBasicMaterial({
            color:color,
            transparent:true,
            opacity:0.65,
            side:THREE.DoubleSide
        })
    );
    ring.rotation.x = -Math.PI/2;
    ring.position.y = 0.06;
    tower.add(ring);

    tower.userData.barHeight = 5.7;

    tower.position.set(

        x,

        0,

        z

    );



    scene.add(tower);





    const data={


        kind:"tower",


        mesh:tower,


        team,


        hp:TOWER_CONFIG.hp,


        maxHp:TOWER_CONFIG.hp,


        damage:TOWER_CONFIG.damage,


        timer:0,


        alive:true


    };



    Towers.push(data);



    return data;


}








/*==========================================================
    SPAWN TOWER
==========================================================*/


function createTowerLine(){



    if(Towers.length>0)

        return;




    createTower(

        "player",

        -10,

        0

    );




    createTower(

        "enemy",

        10,

        0

    );


}









/*==========================================================
    FIND TARGET
==========================================================*/


function towerTarget(tower){



    let targets=[];





    // PRIORITAS MINION

    if(typeof Minions!=="undefined"){



        for(const m of Minions){



            if(

                m.alive &&

                m.team!==tower.team

            ){


                targets.push(m);


            }


        }


    }







    // HERO

    if(tower.team==="player"){



        if(

            typeof Enemy!=="undefined"

            &&

            Enemy.mesh

            &&

            Enemy.hp>0

        )

            targets.push(Enemy);



    }

    else{



        if(

            typeof Player!=="undefined"

            &&

            Player.hp>0

        )

            targets.push(Player);



    }







    let target=null;


    let distance=999;





    for(const e of targets){



        if(!e.mesh)

            continue;




        const d=

        tower.mesh.position.distanceTo(

            e.mesh.position

        );



        if(d<distance){



            distance=d;

            target=e;



        }



    }





    return target;


}









/*==========================================================
    UPDATE TOWER
==========================================================*/


function updateTowers(dt){



    for(const tower of Towers){



        if(!tower.alive)

            continue;





        tower.timer-=dt;




        if(tower.timer>0)

            continue;





        const target=

        towerTarget(tower);





        if(!target)

            continue;





        const d=

        tower.mesh.position.distanceTo(

            target.mesh.position

        );





        if(d<=TOWER_CONFIG.range){



            tower.timer=

            TOWER_CONFIG.cooldown;



            damageTowerTarget(

                target,

                tower.damage

            );



        }


    }


}









/*==========================================================
    DAMAGE TARGET
    (hero, player, dan minion) lewat damageEntity()
==========================================================*/


function damageTowerTarget(target,damage){

    damageEntity(target,damage);

}



/*==========================================================
    DAMAGE TOWER
    Dipakai minion dan player. Tower hancur = mesh dihapus
    dan base timnya tidak lagi terlindungi.
==========================================================*/


function hurtTower(tower,damage){

    if(!tower || !tower.alive)

        return;


    tower.hp-=damage;


    if(tower.hp<=0){

        tower.hp=0;

        tower.alive=false;

        scene.remove(tower.mesh);

        if(typeof updateBaseShield==="function")

            updateBaseShield();

        if(typeof addMessage==="function")

            addMessage(

                tower.team==="enemy"

                ?

                "Tower Musuh Hancur!"

                :

                "Tower Kita Hancur!"

            );

    }

}



function damageTower(team,damage){

    hurtTower(

        Towers.find(

            t=>

            t.team===team && t.alive

        ),

        damage

    );

}
