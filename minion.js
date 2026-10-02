/*==========================================================
    Arena Battle 3D
    minion.js FIXED

    Sistem:
    - Kurcaci 3D
    - Spawn wave
    - Target: minion lawan -> hero lawan -> tower -> base
    - Attack
    - Death + cleanup
    - damageEntity() : satu pintu damage untuk semua unit
==========================================================*/

"use strict";

const Minions = [];

const MINION_CONFIG = {

    hp: 100,
    speed: 1.2,
    damage: 8,
    attackRange: 1.8,
    attackCooldown: 1,

    // Jarak minion mulai mengejar minion / hero lawan
    aggroRange: 4

};

/*==========================================================
    CREATE DWARF MINION
==========================================================*/

function createMinion(team, x, z) {

    const dwarf = new THREE.Group();

    // BODY
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.5, 0.8, 8),
        new THREE.MeshStandardMaterial({
            color: team === "player" ? 0x0088ff : 0xff6600
        })
    );
    body.position.y = 0.8;
    dwarf.add(body);

    // HEAD
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xffc49b })
    );
    head.position.y = 1.5;
    dwarf.add(head);

    // BEARD
    const beard = new THREE.Mesh(
        new THREE.ConeGeometry(0.25, 0.45, 8),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    beard.rotation.x = Math.PI;
    beard.position.set(0, 1.25, -0.35);
    dwarf.add(beard);

    // LEGS
    for (let i = -1; i <= 1; i += 2) {

        const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 0.4, 0.15),
            new THREE.MeshStandardMaterial({ color: 0x222222 })
        );

        leg.position.set(i * 0.15, 0.25, 0);
        dwarf.add(leg);
    }

    // AXE
    const axe = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.8, 0.35),
        new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            metalness: 0.8
        })
    );
    axe.position.set(0.45, 0.9, 0);
    dwarf.add(axe);

    dwarf.position.set(x, 0, z);

    // Menghadap ke arah musuh
    dwarf.rotation.y = team === "player" ? -Math.PI / 2 : Math.PI / 2;

    scene.add(dwarf);

    const minion = {
        kind: "minion",
        mesh: dwarf,
        team: team,
        hp: MINION_CONFIG.hp,
        maxHp: MINION_CONFIG.hp,
        speed: MINION_CONFIG.speed,
        damage: MINION_CONFIG.damage,
        timer: 0,
        alive: true
    };

    Minions.push(minion);

    return minion;
}

/*==========================================================
    SPAWN WAVE
    Minion muncul di dekat tower timnya, bukan di atasnya.
==========================================================*/

function spawnWave() {

    for (let i = 0; i < 3; i++) {

        createMinion("player", -11.5 + i * 0.4, i * 2 - 2);
        createMinion("enemy", 11.5 - i * 0.4, i * 2 - 2);

    }

}

/*==========================================================
    HELPER
==========================================================*/

function flatDistance(a, b) {

    return Math.hypot(a.x - b.x, a.z - b.z);

}

/*==========================================================
    TARGET
    1. minion lawan terdekat (dalam aggroRange)
    2. hero lawan (dalam aggroRange)
    3. tower lawan yang masih hidup
    4. base lawan
==========================================================*/

function getMinionTarget(m) {

    const foe = m.team === "player" ? "enemy" : "player";
    const pos = m.mesh.position;

    let best = null;
    let bestDistance = MINION_CONFIG.aggroRange;

    // 1. Minion lawan
    for (const other of Minions) {

        if (!other.alive || other.team !== foe) continue;

        const d = flatDistance(pos, other.mesh.position);

        if (d < bestDistance) {
            best = other;
            bestDistance = d;
        }

    }

    // 2. Hero lawan
    const hero = m.team === "player"
        ? (Enemy.mesh && Enemy.alive ? Enemy : null)
        : (Player.mesh && Player.hp > 0 ? Player : null);

    if (hero) {

        const d = flatDistance(pos, hero.mesh.position);

        if (d < bestDistance) {
            best = hero;
            bestDistance = d;
        }

    }

    if (best) return best;

    // 3. Tower
    const tower = Towers.find(
        t => t.team === foe && t.alive && t.hp > 0
    );

    if (tower) return tower;

    // 4. Base
    const base = Bases.find(
        b => b.team === foe && b.hp > 0
    );

    return base || null;

}

/*==========================================================
    UPDATE MINION
==========================================================*/

function updateMinions(dt) {

    // Mundur supaya aman saat splice
    for (let i = Minions.length - 1; i >= 0; i--) {

        const m = Minions[i];

        // Bersihkan minion yang sudah mati
        if (!m.alive || m.hp <= 0) {

            if (m.alive) {
                m.alive = false;
                scene.remove(m.mesh);
            }

            Minions.splice(i, 1);
            continue;

        }

        const target = getMinionTarget(m);

        if (!target) continue;

        const dx = target.mesh.position.x - m.mesh.position.x;
        const dz = target.mesh.position.z - m.mesh.position.z;

        const distance = Math.hypot(dx, dz);

        // Bangunan punya ukuran, jadi jangkauannya sedikit lebih jauh
        const reach = MINION_CONFIG.attackRange +
            ((target.kind === "tower" || target.kind === "base") ? 0.8 : 0);

        // Hadap ke target (depan minion = arah -z)
        if (distance > 0.001) {
            m.mesh.rotation.y = Math.atan2(dx, dz) + Math.PI;
        }

        if (distance > reach) {

            m.mesh.position.x += dx / distance * m.speed * dt;
            m.mesh.position.z += dz / distance * m.speed * dt;

        } else {

            m.timer -= dt;

            if (m.timer <= 0) {

                m.timer = MINION_CONFIG.attackCooldown;

                damageEntity(target, m.damage);

            }

        }

    }

}

/*==========================================================
    DAMAGE ENTITY
    Satu pintu damage untuk: Player, Enemy (hero),
    minion, tower, dan base.
==========================================================*/

function damageEntity(target, damage) {

    if (!target || gameOver) return;

    // Hero musuh
    if (target === Enemy) {
        damageEnemy(damage);
        return;
    }

    // Player
    if (target === Player) {

        Player.hp = Math.max(0, Player.hp - damage);

        if (typeof updateUI === "function") {
            updateUI();
        }

        return;
    }

    // Tower
    if (target.kind === "tower") {
        hurtTower(target, damage);
        return;
    }

    // Base (dilindungi selama tower hidup)
    if (target.kind === "base") {
        damageBase(target.team, damage);
        return;
    }

    // Minion
    if (target.kind === "minion") {

        if (!target.alive) return;

        target.hp -= damage;

        if (target.hp <= 0) {
            target.hp = 0;
            target.alive = false;
            scene.remove(target.mesh);
        }

    }

}

// Nama lama, tetap tersedia
function damageTarget(target, damage) {

    damageEntity(target, damage);

}
