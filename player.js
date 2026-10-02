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

    const skin = 0xffd7b5;
    const hairColor = 0x1c2250;

    // BODY (armor biru)
    hikaru.add(makePart(
        new THREE.CylinderGeometry(0.42,0.55,0.95,16),
        0x2f6fe4, 0, 0.98, 0
    ));

    // BELT
    hikaru.add(makePart(
        new THREE.CylinderGeometry(0.56,0.56,0.14,16),
        0xffc83d, 0, 0.62, 0, { outline:1.1 }
    ));

    // EMBLEM DADA
    hikaru.add(makePart(
        new THREE.OctahedronGeometry(0.13),
        0xffc83d, 0, 1.12, -0.46, { outline:1.2 }
    ));

    // CAPE
    hikaru.add(makePart(
        new THREE.BoxGeometry(0.95,1.1,0.07),
        0xe84545, 0, 1.08, 0.45
    ));

    // HEAD (besar, gaya chibi)
    hikaru.add(makePart(
        new THREE.SphereGeometry(0.62,24,20),
        skin, 0, 2.0, 0
    ));

    // HAIR
    const hair = makePart(
        new THREE.SphereGeometry(0.66,20,16),
        hairColor, 0, 2.12, 0.08
    );
    hair.scale.set(1,0.8,1);
    hikaru.add(hair);

    // HAIR SPIKES
    [[-0.32,2.72,-0.1,0.45],[0,2.84,-0.15,0],[0.32,2.72,-0.1,-0.45]]
    .forEach(p=>{

        const spike = makePart(
            new THREE.ConeGeometry(0.2,0.55,8),
            hairColor, p[0], p[1], p[2]
        );
        spike.rotation.z = p[3];
        hikaru.add(spike);

    });

    // EYES (besar dan berkilau)
    for(let i=-1;i<=1;i+=2){

        hikaru.add(makePart(
            new THREE.SphereGeometry(0.15,12,10),
            0xffffff, i*0.24, 2.0, -0.5,
            { outline:1.12, shadow:false }
        ));

        hikaru.add(makePart(
            new THREE.SphereGeometry(0.09,10,8),
            0x1e90ff, i*0.24, 1.99, -0.6,
            { outline:false, shadow:false,
              material:{ emissive:0x0a4aff, emissiveIntensity:0.6 } }
        ));

        hikaru.add(makePart(
            new THREE.SphereGeometry(0.03,6,6),
            0xffffff, i*0.24+0.03, 2.03, -0.68,
            { outline:false, shadow:false }
        ));

        // PIPI
        hikaru.add(makePart(
            new THREE.SphereGeometry(0.08,8,6),
            0xff9aa8, i*0.38, 1.82, -0.45,
            { outline:false, shadow:false }
        ));

    }

    // MULUT
    const mouth = makePart(
        new THREE.SphereGeometry(0.04,6,6),
        0x6b2f2f, 0, 1.78, -0.6,
        { outline:false, shadow:false }
    );
    mouth.scale.set(2.2,0.8,1);
    hikaru.add(mouth);

    // SHOULDER
    for(let i=-1;i<=1;i+=2){

        hikaru.add(makePart(
            new THREE.SphereGeometry(0.22,12,10),
            0xcfe6ff, i*0.62, 1.4, 0
        ));

    }

    // SWORD
    const sword = makePart(
        new THREE.BoxGeometry(0.12,1.2,0.14),
        0xf2f6ff, 0.85, 1.2, -0.15,
        { outline:1.35, material:{ emissive:0x335577, emissiveIntensity:0.4 } }
    );

    sword.name = "Sword";
    sword.rotation.z = -0.5;

    sword.add(makePart(
        new THREE.BoxGeometry(0.42,0.1,0.18),
        0xffc83d, 0, -0.52, 0, { outline:1.2 }
    ));

    hikaru.add(sword);

    // LEGS (boots)
    for(let i=-1;i<=1;i+=2){

        hikaru.add(makePart(
            new THREE.BoxGeometry(0.28,0.5,0.32),
            0x3b2f4a, i*0.2, 0.25, 0
        ));

    }

    // BAYANGAN BULAT DI TANAH
    const blob = new THREE.Mesh(
        new THREE.CircleGeometry(0.8,20),
        new THREE.MeshBasicMaterial({
            color:0x000000, transparent:true, opacity:0.25
        })
    );
    blob.rotation.x = -Math.PI/2;
    blob.position.y = 0.05;
    hikaru.add(blob);

    hikaru.userData.barHeight = 3.4;

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

    if(e.code==="KeyQ"){
        castSlash();
    }

    if(e.code==="KeyE"){
        castHeal();
    }

});

window.addEventListener("keyup",e=>{

    keys[e.key.toLowerCase()] = false;

});

/*==========================================================
    MOBILE INPUT (joystick analog)
    x / z bernilai -1 sampai 1
==========================================================*/

const mobileInput = {
    x: 0,
    z: 0
};

function resetMobileInput() {

    mobileInput.x = 0;
    mobileInput.z = 0;

    const knob = document.getElementById("joyKnob");

    if (knob) {
        knob.style.transform = "translate(-50%, -50%)";
    }

}

(function setupJoystick() {

    const stick = document.getElementById("joystick");
    const knob = document.getElementById("joyKnob");

    if (!stick || !knob) return;

    let activeId = null;

    function move(event) {

        const rect = stick.getBoundingClientRect();

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        let dx = event.clientX - cx;
        let dy = event.clientY - cy;

        const max = rect.width * 0.36;
        const len = Math.hypot(dx, dy);

        if (len > max) {
            dx = dx / len * max;
            dy = dy / len * max;
        }

        knob.style.transform =
            "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px))";

        // Zona mati kecil di tengah
        if (len / max < 0.15) {
            mobileInput.x = 0;
            mobileInput.z = 0;
            return;
        }

        mobileInput.x = dx / max;
        mobileInput.z = dy / max;

    }

    stick.addEventListener("pointerdown", event => {

        event.preventDefault();

        activeId = event.pointerId;

        if (stick.setPointerCapture) {
            stick.setPointerCapture(event.pointerId);
        }

        stick.classList.add("active");

        move(event);

    });

    stick.addEventListener("pointermove", event => {

        if (event.pointerId !== activeId) return;

        event.preventDefault();

        move(event);

    });

    const release = event => {

        if (event.pointerId !== activeId) return;

        activeId = null;

        stick.classList.remove("active");

        resetMobileInput();

    };

    stick.addEventListener("pointerup", release);
    stick.addEventListener("pointercancel", release);
    stick.addEventListener("lostpointercapture", release);

    stick.addEventListener("contextmenu", event => {
        event.preventDefault();
    });

})();

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

    /*================ MOBILE (joystick) ================*/

    x += mobileInput.x;
    z += mobileInput.z;

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

        // Joystick setengah dorong = jalan pelan
        const power = Math.min(length, 1);

        x /= length;
        z /= length;

        Player.mesh.position.x +=
            x * Player.speed * power * dt;

        Player.mesh.position.z +=
            z * Player.speed * power * dt;

        // Depan karakter = arah -z, jadi tambah PI
        Player.mesh.rotation.y =
            Math.atan2(x, z) + Math.PI;

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

    /*================ SKILL COOLDOWN ================*/

    for (const key in Skills) {

        if (Skills[key].timer > 0) {

            Skills[key].timer = Math.max(
                0,
                Skills[key].timer - dt
            );

        }

    }

    // Putaran badan saat Tebasan Putar
    if (Player.spinTime > 0) {

        Player.mesh.rotation.y +=
            (Math.PI * 2 / 0.35) * dt;

        Player.spinTime -= dt;

    }

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
    Menyerang semua musuh dalam jangkauan:
    hero musuh, minion musuh, tower, dan base
    (base hanya terkena kalau tower musuh sudah hancur).
==========================================================*/

function playerAttack(){

    if(!Player.mesh || gameOver || typeof paused !== "undefined" && paused) return;

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

    const pos = Player.mesh.position;
    const range = Player.attackRange;

    // Hero musuh
    if(Enemy.mesh && Enemy.alive){

        if(flatDistance(pos, Enemy.mesh.position) <= range){

            damageEntity(Enemy, Player.attackDamage);

        }

    }

    // Minion musuh
    // (salin array: minion yang mati bisa dibersihkan saat loop)
    for(const m of Minions.slice()){

        if(!m.alive || m.team !== "enemy") continue;

        if(flatDistance(pos, m.mesh.position) <= range){

            damageEntity(m, Player.attackDamage);

        }

    }

    // Bangunan punya ukuran, jangkauannya sedikit lebih jauh
    const buildingRange = range + 1.2;

    const tower = Towers.find(
        t => t.team === "enemy" && t.alive
    );

    if(tower && flatDistance(pos, tower.mesh.position) <= buildingRange){

        damageEntity(tower, Player.attackDamage);

    }

    const base = Bases.find(
        b => b.team === "enemy" && b.hp > 0
    );

    if(base && flatDistance(pos, base.mesh.position) <= buildingRange){

        damageEntity(base, Player.attackDamage);

    }

}

/*==========================================================
    SKILL
    Skill 1 (Q): Tebasan Putar - damage area di sekitar Hikaru
    Skill 2 (E): Penyembuh - memulihkan HP
==========================================================*/

const Skills = {

    slash: { cd: 6, timer: 0, damage: 80, radius: 4 },

    heal: { cd: 15, timer: 0, amount: 120 }

};

function canCast(skill) {

    if (!Player.mesh || gameOver) return false;

    if (typeof paused !== "undefined" && paused) return false;

    return skill.timer <= 0;

}

function castSlash() {

    const skill = Skills.slash;

    if (!canCast(skill)) return;

    skill.timer = skill.cd;

    Player.spinTime = 0.35;

    const pos = Player.mesh.position;

    spawnRingEffect(pos, 0xffc83d, skill.radius, 0.4);

    // Hero musuh
    if (Enemy.mesh && Enemy.alive &&
        flatDistance(pos, Enemy.mesh.position) <= skill.radius) {

        damageEntity(Enemy, skill.damage);

    }

    // Minion musuh
    for (const m of Minions.slice()) {

        if (!m.alive || m.team !== "enemy") continue;

        if (flatDistance(pos, m.mesh.position) <= skill.radius) {

            damageEntity(m, skill.damage);

        }

    }

    // Bangunan (jangkauan lebih jauh karena ukurannya besar)
    const tower = Towers.find(t => t.team === "enemy" && t.alive);

    if (tower &&
        flatDistance(pos, tower.mesh.position) <= skill.radius + 1.2) {

        damageEntity(tower, skill.damage);

    }

    const base = Bases.find(b => b.team === "enemy" && b.hp > 0);

    if (base &&
        flatDistance(pos, base.mesh.position) <= skill.radius + 1.2) {

        damageEntity(base, skill.damage);

    }

}

function castHeal() {

    const skill = Skills.heal;

    if (!canCast(skill)) return;

    if (Player.hp >= Player.maxHp) return;

    skill.timer = skill.cd;

    Player.hp = Math.min(Player.maxHp, Player.hp + skill.amount);

    spawnRingEffect(Player.mesh.position, 0x4cd964, 2.2, 0.5);

    if (typeof showDamageNumber === "function") {

        showDamageNumber(
            Player.mesh.position,
            "+" + skill.amount,
            "heal"
        );

    }

}

/*==========================================================
    ATTACK BUTTON
==========================================================*/

function bindButton(id, action){

    const button = document.getElementById(id);

    if(!button) return;

    button.addEventListener("pointerdown", event => {

        event.preventDefault();

        action();

    });

    button.addEventListener("contextmenu", event => {
        event.preventDefault();
    });

}

bindButton("attack", playerAttack);
bindButton("skillSlash", castSlash);
bindButton("skillHeal", castHeal);

/*==========================================================
    MOUSE ATTACK
==========================================================*/

window.addEventListener("mousedown",e=>{

    // Klik pada tombol layar bukan serangan mouse
    if(e.target.closest && e.target.closest("#mobileControls, #hudTopRight")) return;

    if(e.button===0){

        playerAttack();

    }

});
