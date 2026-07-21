/*==========================================================
    Arena Battle 3D
    ui.js FINAL FIXED

    Sistem:
    - HUD HP
    - Health bar animasi
    - Damage text
    - Victory / Defeat
==========================================================*/


"use strict";



let playerBar=null;

let enemyBar=null;







/*==========================================================
    UPDATE HUD
==========================================================*/


function updateUI(){



    const playerHP=

    document.getElementById(

        "playerHP"

    );



    if(

        playerHP &&

        typeof Player!=="undefined"

    ){


        playerHP.innerHTML=

        Math.floor(

            Player.hp

        );

    }







    const enemyHP=

    document.getElementById(

        "enemyHealth"

    );



    if(

        enemyHP &&

        typeof Enemy!=="undefined"

    ){


        enemyHP.innerHTML=

        Math.floor(

            Enemy.hp

        );


    }







    if(playerBar && Player){



        updateHealthBar(

            playerBar,

            Player.hp,

            Player.maxHp

        );


    }







    if(enemyBar && Enemy){



        updateHealthBar(

            enemyBar,

            Enemy.hp,

            Enemy.maxHp

        );


    }





}









/*==========================================================
    CREATE 3D HEALTH BAR
==========================================================*/


function createHealthBar(object,color){



    const canvas=

    document.createElement(

        "canvas"

    );



    canvas.width=256;

    canvas.height=32;



    const ctx=

    canvas.getContext(

        "2d"

    );



    ctx.fillStyle=color;


    ctx.fillRect(

        0,

        0,

        256,

        32

    );





    const texture=

    new THREE.CanvasTexture(

        canvas

    );



    const material=

    new THREE.SpriteMaterial({

        map:texture

    });




    const sprite=

    new THREE.Sprite(

        material

    );



    sprite.scale.set(

        2,

        0.25,

        1

    );



    sprite.position.y=3;



    object.add(

        sprite

    );



    return sprite;


}








/*==========================================================
    HEALTH BAR ANIMATION
==========================================================*/


function updateHealthBar(bar,current,max){



    if(!bar)

        return;



    const percent=

    Math.max(

        0,

        current/max

    );



    bar.scale.x +=

    (

        percent -

        bar.scale.x

    )

    *

    0.15;



}









/*==========================================================
    DAMAGE TEXT
==========================================================*/


function showDamage(text){



    const div=

    document.createElement(

        "div"

    );



    div.innerHTML=text;



    div.style.position="absolute";


    div.style.left="50%";


    div.style.top="35%";


    div.style.transform=

    "translate(-50%,-50%)";



    div.style.color="yellow";


    div.style.fontSize="28px";


    div.style.fontWeight="bold";


    div.style.zIndex="100";



    document.body.appendChild(div);





    let y=0;



    const anim=setInterval(()=>{



        y-=2;


        div.style.top=

        `calc(35% + ${y}px)`;



        div.style.opacity=

        1+y/100;



        if(y<-100){


            clearInterval(anim);


            div.remove();


        }


    },20);



}









/*==========================================================
    RESULT SCREEN
==========================================================*/


function showResult(text,type){



    let screen=

    document.getElementById(

        "resultScreen"

    );



    let title=

    document.getElementById(

        "resultText"

    );





    if(!screen){



        screen=

        document.createElement(

            "div"

        );



        screen.id=

        "resultScreen";



        screen.style.position=

        "absolute";



        screen.style.top="50%";


        screen.style.left="50%";


        screen.style.transform=

        "translate(-50%,-50%)";



        screen.style.fontSize="50px";


        screen.style.fontWeight="bold";


        screen.style.zIndex="200";



        document.body.appendChild(

            screen

        );



    }





    if(!title){



        title=

        document.createElement(

            "div"

        );


        title.id="resultText";


        screen.appendChild(title);


    }







    title.innerHTML=text;



    title.style.color=

    type==="win"

    ?

    "cyan"

    :

    "red";



    screen.style.display="block";





}









/*==========================================================
    WIN LOSE
==========================================================*/


function winGame(){



    showResult(

        "🏆 HIKARU MENANG!",

        "win"

    );



    paused=true;


}






function loseGame(){



    showResult(

        "💀 KALAH!",

        "lose"

    );



    paused=true;


}









/*==========================================================
    START UI
==========================================================*/


function initUI(){



    if(Player.mesh){


        playerBar=

        createHealthBar(

            Player.mesh,

            "cyan"

        );


    }



    if(Enemy.mesh){


        enemyBar=

        createHealthBar(

            Enemy.mesh,

            "red"

        );


    }



    updateUI();


}