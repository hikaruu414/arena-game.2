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





    // BADAN MENARA

    const base =
    new THREE.Mesh(

        new THREE.CylinderGeometry(

            1,

            1.4,

            2.5,

            10

        ),

        new THREE.MeshStandardMaterial({

            color:

            team==="player"

            ?

            0x0066ff

            :

            0xaa0000,

            metalness:0.5

        })

    );



    base.position.y=1.25;



    tower.add(base);







    // ATAP

    const roof =
    new THREE.Mesh(

        new THREE.ConeGeometry(

            1.2,

            1,

            10

        ),

        new THREE.MeshStandardMaterial({

            color:0x222222

        })

    );



    roof.position.y=3;



    tower.add(roof);








    // KRISTAL

    const crystal =
    new THREE.Mesh(

        new THREE.OctahedronGeometry(

            0.35

        ),

        new THREE.MeshStandardMaterial({

            color:

            team==="player"

            ?

            0x00ffff

            :

            0xff3333,


            emissive:

            team==="player"

            ?

            0x0033ff

            :

            0xff0000

        })

    );



    crystal.position.y=3.7;



    tower.add(crystal);






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
==========================================================*/


function damageTowerTarget(target,damage){



    // PLAYER

    if(target===Player){


        Player.hp-=damage;


        updateUI();


        return;


    }





    // ENEMY HERO

    if(target===Enemy){


        damageEnemy(damage);


        return;


    }






    // MINION

    if(target.hp!==undefined){



        target.hp-=damage;



        if(target.hp<=0){



            target.hp=0;

            target.alive=false;



            scene.remove(

                target.mesh

            );


        }


    }



}









/*==========================================================
    DAMAGE TOWER
==========================================================*/


function damageTower(team,damage){



    const tower=

    Towers.find(

        t=>

        t.team===team

    );



    if(!tower)

        return;




    tower.hp-=damage;





    if(tower.hp<=0){



        tower.hp=0;


        tower.alive=false;



        scene.remove(

            tower.mesh

        );



    }



}