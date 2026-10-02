/*==========================================================
    Arena Battle 3D
    enemy.js FINAL
    PART 1
==========================================================*/

"use strict";

/*==========================================================
    ENEMY DATA
==========================================================*/

const Enemy = {

    name: "Dark Knight",

    mesh: null,

    hp: 500,
    maxHp: 500,

    speed: 2,

    damage: 20,

    attackRange: 2.5,

    attackCooldown: 1.2,

    timer: 0,

    alive: true

};

// Waktu hero musuh hidup lagi setelah dikalahkan (detik)
const ENEMY_RESPAWN_TIME = 8;

/*==========================================================
    CREATE ENEMY
==========================================================*/

function createEnemy() {

    if (Enemy.mesh) return;

    const enemy = new THREE.Group();

    const skin = 0xe8b894;

    /*================ BODY ================*/

    enemy.add(makePart(
        new THREE.CylinderGeometry(0.45, 0.58, 0.95, 16),
        0x7a1424, 0, 0.98, 0
    ));

    enemy.add(makePart(
        new THREE.CylinderGeometry(0.59, 0.59, 0.14, 16),
        0x3a3a48, 0, 0.62, 0, { outline: 1.1 }
    ));

    /*================ CAPE ================*/

    enemy.add(makePart(
        new THREE.BoxGeometry(1.0, 1.1, 0.07),
        0x23182e, 0, 1.08, 0.46
    ));

    /*================ HEAD ================*/

    enemy.add(makePart(
        new THREE.SphereGeometry(0.62, 24, 20),
        skin, 0, 2.0, 0
    ));

    /*================ HELMET (setengah bola) ================*/

    enemy.add(makePart(
        new THREE.SphereGeometry(
            0.7, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55
        ),
        0x2b2d3a, 0, 2.07, 0.02
    ));

    /*================ HORNS ================*/

    for (let i = -1; i <= 1; i += 2) {

        const horn = makePart(
            new THREE.ConeGeometry(0.15, 0.7, 8),
            0xf0e6d0, i * 0.52, 2.7, 0
        );

        horn.rotation.z = -i * 0.7;

        enemy.add(horn);

    }

    /*================ SHOULDER SPIKES ================*/

    for (let i = -1; i <= 1; i += 2) {

        const spike = makePart(
            new THREE.ConeGeometry(0.22, 0.55, 8),
            0x2a2a35, i * 0.68, 1.62, 0
        );

        spike.rotation.z = -i * 0.6;

        enemy.add(spike);

    }

    /*================ EYES (marah) ================*/

    for (let i = -1; i <= 1; i += 2) {

        enemy.add(makePart(
            new THREE.SphereGeometry(0.13, 12, 10),
            0xffffff, i * 0.24, 1.96, -0.5,
            { outline: 1.12, shadow: false }
        ));

        enemy.add(makePart(
            new THREE.SphereGeometry(0.08, 10, 8),
            0xff2200, i * 0.24, 1.95, -0.59,
            {
                outline: false,
                shadow: false,
                material: { emissive: 0xff2200, emissiveIntensity: 0.8 }
            }
        ));

        // ALIS MIRING
        const brow = makePart(
            new THREE.BoxGeometry(0.3, 0.07, 0.07),
            0x111111, i * 0.25, 2.14, -0.56,
            { outline: false, shadow: false }
        );

        brow.rotation.z = i * 0.45;

        enemy.add(brow);

    }

    /*================ SWORD ================*/

    const sword = makePart(
        new THREE.BoxGeometry(0.16, 1.5, 0.18),
        0xff6a6a, 0.9, 1.25, -0.15,
        {
            outline: 1.3,
            material: { emissive: 0x880000, emissiveIntensity: 0.6 }
        }
    );

    sword.name = "Sword";
    sword.rotation.z = -0.5;

    sword.add(makePart(
        new THREE.BoxGeometry(0.5, 0.12, 0.22),
        0x2a2a35, 0, -0.65, 0, { outline: 1.2 }
    ));

    enemy.add(sword);

    /*================ LEGS ================*/

    for (let i = -1; i <= 1; i += 2) {

        enemy.add(makePart(
            new THREE.BoxGeometry(0.3, 0.5, 0.34),
            0x2a2030, i * 0.22, 0.25, 0
        ));

    }

    /*================ BAYANGAN ================*/

    const blob = new THREE.Mesh(
        new THREE.CircleGeometry(0.9, 20),
        new THREE.MeshBasicMaterial({
            color: 0x000000, transparent: true, opacity: 0.25
        })
    );

    blob.rotation.x = -Math.PI / 2;
    blob.position.y = 0.05;
    enemy.add(blob);

    enemy.scale.setScalar(1.15);

    enemy.userData.barHeight = 3.2;

    enemy.position.set(
        0,
        0,
        -8
    );

    Enemy.mesh = enemy;

    scene.add(enemy);

}
/*==========================================================
    Arena Battle 3D
    enemy.js FINAL
    PART 2
==========================================================*/

/*==========================================================
    UPDATE ENEMY
==========================================================*/

function updateEnemy(dt) {

    if (
        !Enemy.mesh ||
        !Enemy.alive ||
        !Player ||
        !Player.mesh
    ) return;

    const dx = Player.mesh.position.x - Enemy.mesh.position.x;
    const dz = Player.mesh.position.z - Enemy.mesh.position.z;

    const distance = Math.hypot(dx, dz);

    /*================ CHASE PLAYER ================*/

    if (distance > Enemy.attackRange) {

        Enemy.mesh.position.x +=
            (dx / distance) *
            Enemy.speed *
            dt;

        Enemy.mesh.position.z +=
            (dz / distance) *
            Enemy.speed *
            dt;

        // Depan karakter = arah -z, jadi tambah PI
        Enemy.mesh.rotation.y =
            Math.atan2(dx, dz) + Math.PI;

        /*================ WALK ANIMATION ================*/

        const walk =
            Math.sin(performance.now() * 0.012) * 0.45;

        Enemy.mesh.children.forEach(part => {

            if (
                part.isMesh &&
                part.geometry instanceof THREE.BoxGeometry &&
                part.position.y < 1
            ) {

                part.rotation.x =
                    part.position.x < 0
                        ? walk
                        : -walk;

            }

        });

    }

    /*================ ATTACK PLAYER ================*/

    else {

        Enemy.timer -= dt;

        if (Enemy.timer <= 0) {

            Enemy.timer =
                Enemy.attackCooldown;

            /* Sword Animation */

            const sword =
                Enemy.mesh.getObjectByName("Sword");

            if (sword) {

                sword.rotation.z = -1.5;

                setTimeout(() => {

                    if (Enemy.mesh) {

                        sword.rotation.z = -0.5;

                    }

                }, 120);

            }

            /* Damage Player */

            damageEntity(Player, Enemy.damage);

            if (Player.hp <= 0) {

                if (typeof loseGame === "function") {

                    loseGame();

                }

            }

        }

    }

}
/*==========================================================
    Arena Battle 3D
    enemy.js FINAL
    PART 3
==========================================================*/

/*==========================================================
    DAMAGE ENEMY
==========================================================*/

function damageEnemy(amount) {

    if (!Enemy.alive || !Enemy.mesh || gameOver) return;

    Enemy.hp -= amount;

    /*================ HIT EFFECT ================*/

    Enemy.mesh.traverse(obj => {

        if (!obj.isMesh || obj.userData.isOutline) return;

        // Warna asli disimpan sekali, supaya hit beruntun
        // tidak membuat warna "asli" tersimpan sebagai putih.
        if (!obj.userData.baseColor) {
            obj.userData.baseColor = obj.material.color.clone();
        }

        obj.material.color.set(0xffffff);

        setTimeout(() => {

            if (obj.material && obj.userData.baseColor) {
                obj.material.color.copy(obj.userData.baseColor);
            }

        }, 100);

    });

    if (Enemy.hp < 0) {
        Enemy.hp = 0;
    }

    if (typeof updateUI === "function") {
        updateUI();
    }

    /*================ DEATH ================*/

    if (Enemy.hp <= 0) {

        Enemy.alive = false;

        // Animasi jatuh
        Enemy.mesh.rotation.z = Math.PI / 2;

        // Turun sedikit ke tanah
        Enemy.mesh.position.y = -0.3;

        // Hapus setelah animasi selesai
        setTimeout(() => {

            if (Enemy.mesh) {

                scene.remove(Enemy.mesh);
                Enemy.mesh = null;

            }

        }, 400);

        // Pesan kemenangan
        if (typeof addMessage === "function") {
            addMessage("Enemy Defeated");
        }

        // Hidup lagi setelah beberapa detik
        setTimeout(() => {

            if (!gameOver) {
                resetEnemy();
            }

        }, ENEMY_RESPAWN_TIME * 1000);

    }

}

/*==========================================================
    RESET ENEMY
==========================================================*/

function resetEnemy() {

    if (Enemy.mesh) {

        scene.remove(Enemy.mesh);
        Enemy.mesh = null;

    }

    Enemy.hp = Enemy.maxHp;
    Enemy.timer = 0;
    Enemy.alive = true;

    createEnemy();

    if (typeof updateUI === "function") {
        updateUI();
    }

}