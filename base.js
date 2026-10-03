/*==========================================================
    Arena Battle 3D
    base.js FIXED

    Sistem:
    - Base tiap tim
    - Base kebal selama tower timnya masih hidup
    - Base hancur = game selesai
==========================================================*/

"use strict";

const Bases = [];

const BASE_CONFIG = {
    hp: 2000,
    size: 2.5
};

// true setelah menang / kalah (dipakai ui.js dan main.js)
let gameOver = false;

/*==========================================================
    CREATE BASE
==========================================================*/

function createBase(team, x, z) {

    const color = team === "player" ? 0x3d8bff : 0xff4d4d;

    const group = new THREE.Group();

    // ALAS
    group.add(makePart(
        new THREE.CylinderGeometry(1.6, 1.9, 0.6, 10),
        0x8d8fa3, 0, 0.3, 0
    ));

    group.add(makePart(
        new THREE.CylinderGeometry(1.2, 1.4, 0.4, 10),
        0xb7b9cc, 0, 0.8, 0
    ));

    // KRISTAL UTAMA
    const crystal = makePart(
        new THREE.OctahedronGeometry(0.95),
        color, 0, 2.4, 0,
        { material: { emissive: color, emissiveIntensity: 0.7 } }
    );

    crystal.scale.y = 1.5;

    group.add(crystal);

    registerAnimated(crystal, "spin", 0.9);
    registerAnimated(crystal, "bob", 1.6, 0.18);

    // KRISTAL KECIL MENGORBIT
    const orbit = new THREE.Group();

    orbit.position.y = 1.9;

    for (let i = 0; i < 3; i++) {

        const a = i / 3 * Math.PI * 2;

        orbit.add(makePart(
            new THREE.OctahedronGeometry(0.22),
            0xffffff, Math.cos(a) * 1.5, 0, Math.sin(a) * 1.5,
            { material: { emissive: color, emissiveIntensity: 0.5 } }
        ));

    }

    group.add(orbit);

    registerAnimated(orbit, "spin", 1.2);

    // PERISAI (terlihat selama tower masih hidup)
    const shield = new THREE.Mesh(
        new THREE.SphereGeometry(2.4, 24, 18),
        new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2,
            depthWrite: false
        })
    );

    shield.position.y = 1.6;

    group.add(shield);

    // CINCIN DI TANAH
    const ring = new THREE.Mesh(
        new THREE.RingGeometry(2.1, 2.6, 36),
        new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        })
    );

    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    group.add(ring);

    // BENDERA TIM (berkibar)
    group.add(makePart(
        new THREE.CylinderGeometry(0.05, 0.06, 3.0, 8),
        0xf2f2f2, 2.0, 1.5, 1.5, { outline: 1.3 }
    ));

    group.add(makePart(
        new THREE.SphereGeometry(0.1, 8, 8),
        0xffc83d, 2.0, 3.05, 1.5, { outline: 1.2 }
    ));

    const flagPivot = new THREE.Group();

    flagPivot.position.set(2.0, 2.6, 1.5);

    flagPivot.add(makePart(
        new THREE.BoxGeometry(0.9, 0.5, 0.04),
        color, 0.45, 0, 0, { outline: 1.1 }
    ));

    group.add(flagPivot);

    registerAnimated(flagPivot, "wave", 2.5, 0.4);

    group.userData.barHeight = 4.6;

    group.position.set(x, 0, z);

    scene.add(group);

    const base = {
        kind: "base",
        mesh: group,
        shield: shield,
        team,
        hp: BASE_CONFIG.hp,
        maxHp: BASE_CONFIG.hp,
        protected: true
    };

    Bases.push(base);
}

/*==========================================================
    SPAWN BASE
==========================================================*/

function createBases() {

    if (Bases.length > 0) return;

    createBase("player", -13, 0);
    createBase("enemy", 13, 0);

    // Area penyembuh di samping base (jauh dari lane)
    createHealPad("player", -12.5, 5.5);
    createHealPad("enemy", 12.5, -5.5);
}

/*==========================================================
    HEAL PAD (area penyembuh)
    Hero yang berdiri di lingkaran hijau dekat base timnya
    memulihkan HP tiap detik.
==========================================================*/

const HealPads = [];

const HEAL_PAD_CONFIG = {
    radius: 2.8,
    healPerSecond: 60
};

function createHealPad(team, x, z) {

    const group = new THREE.Group();

    // Lantai bercahaya
    const disc = new THREE.Mesh(
        new THREE.CircleGeometry(HEAL_PAD_CONFIG.radius, 40),
        new THREE.MeshBasicMaterial({
            color: 0x7dff9a,
            transparent: true,
            opacity: 0.35,
            depthWrite: false
        })
    );

    disc.rotation.x = -Math.PI / 2;
    disc.position.y = 0.05;
    group.add(disc);

    // Cincin tepi
    const ring = new THREE.Mesh(
        new THREE.RingGeometry(HEAL_PAD_CONFIG.radius - 0.22, HEAL_PAD_CONFIG.radius, 40),
        new THREE.MeshBasicMaterial({
            color: 0x4cd964,
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide
        })
    );

    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.06;
    group.add(ring);

    // Alas kecil di tengah
    group.add(makePart(
        new THREE.CylinderGeometry(0.5, 0.7, 0.5, 12),
        0xb7b9cc, 0, 0.25, 0
    ));

    // Tanda plus hijau yang melayang dan berputar
    const plus = new THREE.Group();

    plus.position.y = 1.5;

    const glow = { material: { emissive: 0x2fbf55, emissiveIntensity: 0.8 } };

    plus.add(makePart(
        new THREE.BoxGeometry(0.9, 0.28, 0.28),
        0x7dff9a, 0, 0, 0, glow
    ));

    plus.add(makePart(
        new THREE.BoxGeometry(0.28, 0.9, 0.28),
        0x7dff9a, 0, 0, 0, glow
    ));

    group.add(plus);

    registerAnimated(plus, "spin", 1.4);
    registerAnimated(plus, "bob", 2, 0.12);

    group.position.set(x, 0, z);

    scene.add(group);

    HealPads.push({
        team: team,
        mesh: group,
        disc: disc,
        radius: HEAL_PAD_CONFIG.radius,
        timer: 0,
        accumulated: 0
    });

}

// Pulihkan satu hero kalau ada di dalam pad timnya
function healHeroOnPad(hero, isAlive, team, dt) {

    hero.healing = false;

    const pad = HealPads.find(p => p.team === team);

    if (!pad || !hero.mesh || !isAlive) return;

    if (hero.hp >= hero.maxHp) return;

    if (flatDistance(hero.mesh.position, pad.mesh.position) > pad.radius) return;

    hero.healing = true;

    const amount = Math.min(
        hero.maxHp - hero.hp,
        HEAL_PAD_CONFIG.healPerSecond * dt
    );

    hero.hp += amount;

    pad.accumulated += amount;
    pad.timer += dt;

    // Tiap setengah detik: angka "+HP" dan cincin kecil
    if (pad.timer >= 0.5) {

        if (typeof showDamageNumber === "function") {

            showDamageNumber(
                hero.mesh.position,
                "+" + Math.round(pad.accumulated),
                "heal"
            );

        }

        spawnRingEffect(hero.mesh.position, 0x7dff9a, 1.6, 0.5);

        pad.timer = 0;
        pad.accumulated = 0;

    }

}

function updateHealPads(dt) {

    if (gameOver) return;

    // Lantai berdenyut pelan
    for (const pad of HealPads) {

        pad.disc.material.opacity =
            0.3 + Math.sin(sceneTime * 3) * 0.08;

    }

    healHeroOnPad(Player, Player.hp > 0, "player", dt);

    healHeroOnPad(Enemy, Enemy.alive, "enemy", dt);

}

/*==========================================================
    UPDATE BASE SHIELD
    Base dilindungi selama tower timnya masih hidup.
==========================================================*/

function updateBaseShield() {

    for (const base of Bases) {

        const tower = Towers.find(
            t => t.team === base.team
        );

        base.protected = tower
            ? (tower.alive && tower.hp > 0)
            : false;

        if (base.shield) {
            base.shield.visible = base.protected;
        }
    }
}

/*==========================================================
    DAMAGE BASE
==========================================================*/

function damageBase(team, damage) {

    if (gameOver) return;

    const base = Bases.find(
        b => b.team === team
    );

    if (!base || base.hp <= 0) return;

    updateBaseShield();

    // Base tidak bisa diserang jika tower masih hidup
    if (base.protected) return;

    base.hp = Math.max(0, base.hp - damage);

    if (base.hp <= 0) {

        if (team === "enemy") {
            winGame();
        } else {
            loseGame();
        }
    }
}

/*==========================================================
    GET BASE
==========================================================*/

function getBase(team) {

    return Bases.find(
        b => b.team === team
    );
}

/*
    winGame() dan loseGame() didefinisikan di ui.js
*/
