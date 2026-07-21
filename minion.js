/*==========================================================
    Arena Battle 3D
    minion.js FINAL

    Sistem:
    - Kurcaci 3D
    - Spawn wave
    - Auto lane
    - Attack
    - Death system
==========================================================*/


"use strict";



const Minions=[];



const MINION_CONFIG={


    hp:100,

    speed:1.2,

    damage:8,

    attackRange:1.8,

    attackCooldown:1



};







/*==========================================================
    CREATE DWARF MINION
==========================================================*/


function createMinion(team,x,z){



    const dwarf =
    new THREE.Group();





    // BODY

    const body =
    new THREE.Mesh(

        new THREE.CylinderGeometry(

            0.35,

            0.5,

            0.8,

            8

        ),

        new THREE.MeshStandardMaterial({

            color:

            team==="player"

            ?

            0x0088ff

            :

            0xff6600

        })

    );



    body.position.y=0.8;


    dwarf.add(body);







    // HEAD

    const head =
    new THREE.Mesh(

        new THREE.SphereGeometry(

            0.45,

            16,

            16

        ),

        new THREE.MeshStandardMaterial({

            color:0xffc49b

        })

    );



    head.position.y=1.5;



    dwarf.add(head);








    // BEARD

    const beard =
    new THREE.Mesh(

        new THREE.ConeGeometry(

            0.25,

            0.45,

            8

        ),

        new THREE.MeshStandardMaterial({

            color:0xffffff

        })

    );



    beard.rotation.x=Math.PI;



    beard.position.set(

        0,

        1.25,

        -0.35

    );



    dwarf.add(beard);







    // LEGS

    for(let i=-1;i<=1;i+=2){



        const leg =
        new THREE.Mesh(

            new THREE.BoxGeometry(

                0.15,

                0.4,

                0.15

            ),

            new THREE.MeshStandardMaterial({

                color:0x222222

            })

        );



        leg.position.set(

            i*0.15,

            0.25,

            0

        );



        dwarf.add(leg);


    }








    // AXE

    const axe =
    new THREE.Mesh(

        new THREE.BoxGeometry(

            0.12,

            0.8,

            0.35

        ),

        new THREE.MeshStandardMaterial({

            color:0xaaaaaa,

            metalness:0.8

        })

    );



    axe.position.set(

        0.45,

        0.9,

        0

    );



    dwarf.add(axe);







    dwarf.position.set(

        x,

        0,

        z

    );




    scene.add(dwarf);





    const minion={


        mesh:dwarf,


        team:team,


        hp:MINION_CONFIG.hp,


        maxHp:MINION_CONFIG.hp,


        speed:MINION_CONFIG.speed,


        damage:MINION_CONFIG.damage,


        timer:0,


        alive:true


    };



    Minions.push(minion);



    return minion;


}








/*==========================================================
    SPAWN WAVE
==========================================================*/


function spawnWave(){



    for(let i=0;i<3;i++){



        createMinion(

            "player",

            -8-i,

            i*2-2

        );




        createMinion(

            "enemy",

            8+i,

            i*2-2

        );


    }



}








/*==========================================================
    TARGET
==========================================================*/


function getMinionTarget(m){



    if(m.team==="player"){



        if(

            typeof Enemy!=="undefined" &&

            Enemy.mesh &&

            Enemy.hp>0

        )

            return Enemy.mesh;





        if(

            typeof Towers!=="undefined"

        ){


            const tower=

            Towers.find(

                t=>

                t.team==="enemy"

                &&

                t.hp>0

            );


            if(tower)

                return tower.mesh;


        }







        if(typeof Bases!=="undefined"){


            const base=

            Bases.find(

                b=>

                b.team==="enemy"

                &&

                b.hp>0

            );


            if(base)

                return base.mesh;


        }


    }

    else{



        if(

            typeof Player!=="undefined"

            &&

            Player.mesh

            &&

            Player.hp>0

        )

            return Player.mesh;







        if(typeof Towers!=="undefined"){


            const tower=

            Towers.find(

                t=>

                t.team==="player"

                &&

                t.hp>0

            );



            if(tower)

                return tower.mesh;


        }




        if(typeof Bases!=="undefined"){



            const base=

            Bases.find(

                b=>

                b.team==="player"

                &&

                b.hp>0

            );



            if(base)

                return base.mesh;


        }


    }





    return null;


}









/*==========================================================
    UPDATE MINION
==========================================================*/


function updateMinions(dt){



    for(const m of Minions){



        if(!m.alive)

            continue;





        if(m.hp<=0){



            m.alive=false;



            scene.remove(

                m.mesh

            );



            continue;


        }







        const target=

        getMinionTarget(m);




        if(!target)

            continue;





        const dx=

        target.position.x -

        m.mesh.position.x;




        const dz=

        target.position.z -

        m.mesh.position.z;




        const distance=

        Math.sqrt(

            dx*dx+

            dz*dz

        );







        if(distance >

        MINION_CONFIG.attackRange){



            m.mesh.position.x +=

            dx/distance *

            m.speed *

            dt;




            m.mesh.position.z +=

            dz/distance *

            m.speed *

            dt;



        }

        else{



            m.timer-=dt;



            if(m.timer<=0){



                m.timer=

                MINION_CONFIG.attackCooldown;



                damageTarget(

                    target,

                    m.damage

                );


            }


        }



    }


}








/*==========================================================
    DAMAGE
==========================================================*/


function damageTarget(target,damage){



    if(!target)

        return;





    if(

        typeof Enemy!=="undefined"

        &&

        target===Enemy.mesh

    ){


        damageEnemy(damage);

        return;


    }







    if(

        typeof Player!=="undefined"

        &&

        target===Player.mesh

    ){


        Player.hp-=damage;


        updateUI();


        return;


    }







    if(typeof Towers!=="undefined"){



        const tower=

        Towers.find(

            t=>

            t.mesh===target

        );



        if(tower){


            tower.hp-=damage;


            return;


        }


    }







    if(typeof Bases!=="undefined"){



        const base=

        Bases.find(

            b=>

            b.mesh===target

        );



        if(base){


            base.hp-=damage;


            if(base.hp<=0){


                if(base.team==="enemy")

                    winGame();

                else

                    loseGame();


            }


        }


    }



}