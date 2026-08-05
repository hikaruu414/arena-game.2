/*==========================================================
    Arena Battle 3D
    player.js FINAL HIKARU
    PART 1
==========================================================*/

"use strict";

const Player = {
    name: "Hikaru",
    mesh: null,
    hp: 500,
    maxHp: 500,
    speed: 5,
    attackDamage: 40,
    attackRange: 3,
    attackCooldown: 0.5,
    attackTimer: 0
};

/*==========================================================
    CREATE PLAYER
==========================================================*/

function createPlayer(){

    if(Player.mesh) return;

    const hikaru = new THREE.Group();

    // BODY
    const armor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55,0.7,1.3,12),
        new THREE.MeshStandardMaterial({
            color:0x1565c0,
            metalness:0.7,
            roughness:0.3
        })
    );
    armor.position.y = 1.2;
    hikaru.add(armor);

    // HEAD
    const face = new THREE.Mesh(
        new THREE.SphereGeometry(0.38,20,20),
        new THREE.MeshStandardMaterial({
            color:0xffc49b
        })
    );
    face.position.y = 2.2;
    hikaru.add(face);

    // HAIR
    const hair = new THREE.Mesh(
        new THREE.SphereGeometry(0.4,16,16),
        new THREE.MeshStandardMaterial({
            color:0x111111
        })
    );
    hair.scale.y = 0.5;
    hair.position.y = 2.5;
    hikaru.add(hair);

    // SHOULDER
    const shoulder = new THREE.Mesh(
        new THREE.BoxGeometry(1.4,0.25,0.5),
        new THREE.MeshStandardMaterial({
            color:0x90caf9,
            metalness:1
        })
    );
    shoulder.position.y = 1.7;
    hikaru.add(shoulder);

    // SWORD
    const sword = new THREE.Mesh(
        new THREE.BoxGeometry(0.12,1.5,0.15),
        new THREE.MeshStandardMaterial({
            color:0xffffff,
            metalness:1
        })
    );

    sword.name = "Sword";
    sword.position.set(0.8,1.3,0);
    sword.rotation.z = -0.5;
    hikaru.add(sword);

    // LEGS
    for(let i=-1;i<=1;i+=2){

        const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.25,0.7,0.3),
            new THREE.MeshStandardMaterial({
                color:0x222222
            })
        );

        leg.position.set(i*0.2,0.35,0);

        hikaru.add(leg);
    }

    // EYES
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color:0x00ffff,
        emissive:0x0066ff
    });

    const eye1 = new THREE.Mesh(
        new THREE.SphereGeometry(0.04,8,8),
        eyeMaterial
    );

    const eye2 = eye1.clone();

    eye1.position.set(-0.12,2.22,-0.34);
    eye2.position.set(0.12,2.22,-0.34);

    hikaru.add(eye1);
    hikaru.add(eye2);

    // SHADOW
    hikaru.traverse(obj=>{
        if(obj.isMesh){
            obj.castShadow = true;
            obj.receiveShadow = true;
        }
    });

    hikaru.name = "Hikaru";
    hikaru.position.set(0,0,5);

    Player.mesh = hikaru;

    scene.add(hikaru);
}

/*==========================================================
    INPUT
==========================================================*/

const keys = {};

window.addEventListener("keydown",e=>{

    keys[e.key.toLowerCase()] = true;

    if(e.code==="Space"){
        playerAttack();
    }

});

window.addEventListener("keyup",e=>{

    keys[e.key.toLowerCase()] = false;

});

/*==========================================================
    MOBILE INPUT
==========================================================*/

const mobileInput = {
    up: false,
    down: false,
    left: false,
    right: false
};

function resetMobileInput() {

    mobileInput.up = false;
    mobileInput.down = false;
    mobileInput.left = false;
    mobileInput.right = false;

    document
        .querySelectorAll(".moveButton")
        .forEach(button => {
            button.classList.remove("pressed");
        });

}

function buttonControl(id, key) {

    const button = document.getElementById(id);

    if (!button) return;

    button.addEventListener("pointerdown", event => {

        event.preventDefault();

        mobileInput[key] = true;

        button.classList.add("pressed");

        if (button.setPointerCapture) {
            button.setPointerCapture(event.pointerId);
        }

    });

    const releaseButton = event => {

        event.preventDefault();

        mobileInput[key] = false;

        button.classList.remove("pressed");

    };

    button.addEventListener("pointerup", releaseButton);
    button.addEventListener("pointercancel", releaseButton);
    button.addEventListener("lostpointercapture", releaseButton);

    button.addEventListener("contextmenu", event => {
        event.preventDefault();
    });

}

buttonControl("up", "up");
buttonControl("down", "down");
buttonControl("left", "left");
buttonControl("right", "right");

window.addEventListener("blur", resetMobileInput);
/*==========================================================
    Arena Battle 3D
    player.js FINAL HIKARU
    PART 2
==========================================================*/

/*==========================================================
    UPDATE PLAYER
==========================================================*/

function updatePlayer(dt) {

    if (!Player.mesh) return;

    let x = 0;
    let z = 0;

    /*================ KEYBOARD ================*/

    if (keys["w"] || keys["arrowup"]) {
        z -= 1;
    }

    if (keys["s"] || keys["arrowdown"]) {
        z += 1;
    }

    if (keys["a"] || keys["arrowleft"]) {
        x -= 1;
    }

    if (keys["d"] || keys["arrowright"]) {
        x += 1;
    }

    /*================ MOBILE ================*/

    if (mobileInput.up) {
        z -= 1;
    }

    if (mobileInput.down) {
        z += 1;
    }

    if (mobileInput.left) {
        x -= 1;
    }

    if (mobileInput.right) {
        x += 1;
    }

    /*================ MOVEMENT ================*/

    const length = Math.hypot(x, z);

    const legs = Player.mesh.children.filter(part => {

        return (
            part.isMesh &&
            part.geometry instanceof THREE.BoxGeometry &&
            part.position.y < 1
        );

    });

    if (length > 0) {

        x /= length;
        z /= length;

        Player.mesh.position.x +=
            x * Player.speed * dt;

        Player.mesh.position.z +=
            z * Player.speed * dt;

        Player.mesh.rotation.y =
            Math.atan2(x, z);

        /* Animasi kaki */

        const walk =
            Math.sin(performance.now() * 0.012) * 0.45;

        legs.forEach(leg => {

            leg.rotation.x =
                leg.position.x < 0
                    ? walk
                    : -walk;

        });

    } else {

        /* Kembalikan kaki ke posisi awal */

        legs.forEach(leg => {

            leg.rotation.x +=
                (0 - leg.rotation.x) * 0.2;

        });

    }

    /*================ ARENA LIMIT ================*/

    Player.mesh.position.x =
        THREE.MathUtils.clamp(
            Player.mesh.position.x,
            -14,
            14
        );

    Player.mesh.position.z =
        THREE.MathUtils.clamp(
            Player.mesh.position.z,
            -14,
            14
        );

    /*================ ATTACK COOLDOWN ================*/

    if (Player.attackTimer > 0) {

        Player.attackTimer =
            Math.max(
                0,
                Player.attackTimer - dt
            );

    }

    /*================ PLAYER DEATH ================*/

    if (Player.hp <= 0) {

        Player.hp = 0;

        if (typeof updateUI === "function") {
            updateUI();
        }

        if (typeof loseGame === "function") {
            loseGame();
        }

    }

}

/*==========================================================
    PLAYER ATTACK
==========================================================*/

function playerAttack(){

    if(!Player.mesh) return;

    if(Player.attackTimer > 0) return;

    Player.attackTimer = Player.attackCooldown;

    // Animasi pedang
    const sword = Player.mesh.getObjectByName("Sword");

    if(sword){

        sword.rotation.z = -1.5;

        setTimeout(()=>{

            if(Player.mesh){

                sword.rotation.z = -0.5;

            }

        },120);

    }

    // Musuh belum ada
    if(!Enemy || !Enemy.mesh || !Enemy.alive) return;

    const distance = Player.mesh.position.distanceTo(
        Enemy.mesh.position
    );

    function playerAttack(){

    if(Player.attackTimer > 0) return;

    Player.attackTimer = Player.attackCooldown;

    // Letakkan animasi di sini

    const sword = Player.mesh.getObjectByName("Sword");

    if(sword){
        sword.rotation.z = -1.5;

        setTimeout(()=>{
            if(Player.mesh){
                sword.rotation.z = -0.5;
            }
        },120);
    }

    // Baru cek musuh
    if(!Enemy.mesh) return;

    const distance = Player.mesh.position.distanceTo(
        Enemy.mesh.position
    );

    if(distance <= Player.attackRange){
        damageEnemy(Player.attackDamage);
    }
}

    if(distance <= Player.attackRange){

        damageEnemy(Player.attackDamage);

    }

}

/*==========================================================
    ATTACK BUTTON
==========================================================*/

const attackButton = document.getElementById("attack");

if(attackButton){

    attackButton.addEventListener(
        "pointerdown",
        playerAttack
    );

}

/*==========================================================
    MOUSE ATTACK
==========================================================*/

window.addEventListener("mousedown",e=>{

    if(e.button===0){

        playerAttack();

    }

});
