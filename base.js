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

    const geometry = new THREE.BoxGeometry(
        BASE_CONFIG.size,
        BASE_CONFIG.size,
        BASE_CONFIG.size
    );

    const material = new THREE.MeshStandardMaterial({
        color: team === "player" ? 0x0066ff : 0xff2222
    });

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(
        x,
        BASE_CONFIG.size / 2,
        z
    );

    mesh.castShadow = true;

    scene.add(mesh);

    const base = {
        kind: "base",
        mesh,
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
