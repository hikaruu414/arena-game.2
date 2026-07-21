/*==========================================================
    Arena Battle 3D
    base.js FIXED
==========================================================*/

"use strict";

const Bases = [];

const BASE_CONFIG = {
    hp: 2000,
    size: 2.5
};

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
==========================================================*/

function updateBaseShield() {

    for (const base of Bases) {

        if (typeof Towers === "undefined") continue;

        const tower = Towers.find(
            t => t.team === base.team
        );

        base.protected = tower ? tower.hp > 0 : false;
    }
}

/*==========================================================
    DAMAGE BASE
==========================================================*/

function damageBase(team, damage) {

    const base = Bases.find(
        b => b.team === team
    );

    if (!base) return;

    // Base tidak bisa diserang jika tower masih hidup
    if (base.protected) return;

    base.hp -= damage;

    if (base.hp < 0) {
        base.hp = 0;
    }

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

/*==========================================================
    GAME RESULT
==========================================================*/

function winGame() {

    if (typeof showResult === "function") {
        showResult("🏆 YOU WIN!", "win");
        return;
    }

    const end = document.getElementById("pauseText");

    if (end) {
        end.innerHTML = "🏆 YOU WIN!";
        end.style.display = "block";
    }
}

function loseGame() {

    if (typeof showResult === "function") {
        showResult("💀 DEFEAT", "lose");
        return;
    }

    const end = document.getElementById("pauseText");

    if (end) {
        end.innerHTML = "💀 DEFEAT";
        end.style.display = "block";
    }
}