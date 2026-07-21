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

/*==========================================================
    CREATE ENEMY
==========================================================*/

function createEnemy() {

    if (Enemy.mesh) return;

    const enemy = new THREE.Group();

    /*================ BODY ================*/

    const armor = new THREE.Mesh(

        new THREE.CylinderGeometry(
            0.55,
            0.7,
            1.3,
            12
        ),

        new THREE.MeshStandardMaterial({

            color: 0x880000,
            metalness: 0.7,
            roughness: 0.3

        })

    );

    armor.position.y = 1.2;
    enemy.add(armor);

    /*================ HEAD ================*/

    const head = new THREE.Mesh(

        new THREE.SphereGeometry(
            0.38,
            20,
            20
        ),

        new THREE.MeshStandardMaterial({

            color: 0xffc49b

        })

    );

    head.position.y = 2.2;
    enemy.add(head);

    /*================ HELMET ================*/

    const helmet = new THREE.Mesh(

        new THREE.SphereGeometry(
            0.42,
            16,
            16
        ),

        new THREE.MeshStandardMaterial({

            color: 0x111111,
            metalness: 0.8

        })

    );

    helmet.scale.y = 0.5;
    helmet.position.y = 2.45;
    enemy.add(helmet);

    /*================ SHOULDER ================*/

    const shoulder = new THREE.Mesh(

        new THREE.BoxGeometry(
            1.4,
            0.25,
            0.5
        ),

        new THREE.MeshStandardMaterial({

            color: 0x550000,
            metalness: 1

        })

    );

    shoulder.position.y = 1.7;
    enemy.add(shoulder);

    /*================ SWORD ================*/

    const sword = new THREE.Mesh(

        new THREE.BoxGeometry(
            0.12,
            1.5,
            0.15
        ),

        new THREE.MeshStandardMaterial({

            color: 0xffffff,
            metalness: 1

        })

    );

    sword.name = "Sword";

    sword.position.set(
        0.8,
        1.2,
        0
    );

    sword.rotation.z = -0.5;

    enemy.add(sword);

    /*================ LEGS ================*/

    for (let i = -1; i <= 1; i += 2) {

        const leg = new THREE.Mesh(

            new THREE.BoxGeometry(
                0.25,
                0.7,
                0.3
            ),

            new THREE.MeshStandardMaterial({

                color: 0x222222

            })

        );

        leg.position.set(
            i * 0.2,
            0.35,
            0
        );

        enemy.add(leg);

    }

    /*================ EYES ================*/

    const eyeMaterial = new THREE.MeshStandardMaterial({

        color: 0xff0000,
        emissive: 0xaa0000

    });

    const eye1 = new THREE.Mesh(

        new THREE.SphereGeometry(
            0.04,
            8,
            8
        ),

        eyeMaterial

    );

    const eye2 = eye1.clone();

    eye1.position.set(-0.12, 2.22, -0.34);
    eye2.position.set(0.12, 2.22, -0.34);

    enemy.add(eye1);
    enemy.add(eye2);

    /*================ SHADOW ================*/

    enemy.traverse(obj => {

        if (obj.isMesh) {

            obj.castShadow = true;
            obj.receiveShadow = true;

        }

    });

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

        Enemy.mesh.rotation.y =
            Math.atan2(dx, dz);

        /*================ WALK ANIMATION ================*/

        const t = performance.now() * 0.01;

        Enemy.mesh.children.forEach(part => {

            if (part.geometry instanceof THREE.BoxGeometry) {

                part.rotation.x =
                    Math.sin(t * 8) * 0.15;

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

            Player.hp -= Enemy.damage;

            if (Player.hp < 0) {

                Player.hp = 0;

            }

            if (typeof updateUI === "function") {

                updateUI();

            }

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

    if (!Enemy.alive || !Enemy.mesh) return;

    Enemy.hp -= amount;

    /*================ HIT EFFECT ================*/

    Enemy.mesh.traverse(obj => {

        if (!obj.isMesh) return;

        const oldColor = obj.material.color.clone();

        obj.material.color.set(0xffffff);

        setTimeout(() => {

            if (obj.material) {
                obj.material.color.copy(oldColor);
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