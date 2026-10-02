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
