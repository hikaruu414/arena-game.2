/*==========================================================
    Arena Battle 3D
    arena.js  (gaya kartun / MOBA mobile)

    Sistem:
    - Scene, kamera, renderer
    - Material toon + outline hitam (gaya kartun)
    - Langit, kabut, lantai rumput, jalur lane
    - Dekorasi (pohon, semak, batu, bunga)
    - Animasi benda (berputar / melayang) dan efek cincin
==========================================================*/

"use strict";

/*==========================================================
    HELPER GAYA KARTUN
==========================================================*/

const OUTLINE_COLOR = 0x1b1b2f;

function toonMat(color, extra) {

    return new THREE.MeshToonMaterial(
        Object.assign({ color: color }, extra || {})
    );

}

// Garis tepi hitam: salinan mesh yang sedikit lebih besar,
// hanya sisi belakangnya yang digambar.
function addOutline(mesh, scale) {

    const outline = new THREE.Mesh(
        mesh.geometry,
        new THREE.MeshBasicMaterial({
            color: OUTLINE_COLOR,
            side: THREE.BackSide
        })
    );

    outline.scale.setScalar(scale || 1.08);
    outline.userData.isOutline = true;

    mesh.add(outline);

    return mesh;

}

// Satu bagian model: geometri + warna + posisi (+ outline)
function makePart(geometry, color, x, y, z, options) {

    const o = options || {};

    const mesh = new THREE.Mesh(
        geometry,
        toonMat(color, o.material)
    );

    mesh.position.set(x || 0, y || 0, z || 0);

    mesh.castShadow = o.shadow !== false;

    if (o.outline !== false) {
        addOutline(mesh, o.outline);
    }

    return mesh;

}

// Angka acak yang selalu sama (supaya dekorasi tidak berubah)
function seededRandom(seed) {

    let s = seed;

    return function () {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };

}

/*==========================================================
    SCENE
==========================================================*/

const SKY_COLOR = 0x9be0ff;

const scene = new THREE.Scene();

scene.background = new THREE.Color(SKY_COLOR);

scene.fog = new THREE.Fog(SKY_COLOR, 38, 85);

/*==========================================================
    CAMERA (sudut miring seperti game MOBA)
==========================================================*/

const camera = new THREE.PerspectiveCamera(
    48,
    window.innerWidth / window.innerHeight,
    0.1,
    200
);

camera.position.set(0, 14, 10);

camera.lookAt(0, 0, 0);

/*==========================================================
    RENDERER
==========================================================*/

const renderer = new THREE.WebGLRenderer({

    antialias: true,

    powerPreference: "high-performance"

});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

/*==========================================================
    LIGHT SYSTEM
==========================================================*/

const hemiLight = new THREE.HemisphereLight(
    0xffffff,
    0x77aa66,
    0.9
);

scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(
    0xfff2cc,
    0.95
);

sunLight.position.set(8, 16, 6);

sunLight.castShadow = true;

// Area bayangan menutupi seluruh arena 30x30
sunLight.shadow.camera.left = -20;
sunLight.shadow.camera.right = 20;
sunLight.shadow.camera.top = 20;
sunLight.shadow.camera.bottom = -20;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 50;
sunLight.shadow.mapSize.set(1024, 1024);
sunLight.shadow.camera.updateProjectionMatrix();

scene.add(sunLight);

/*==========================================================
    LANTAI RUMPUT
==========================================================*/

function makeGrassTexture() {

    const canvas = document.createElement("canvas");

    canvas.width = 256;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");

    const rand = seededRandom(7);

    // Kotak-kotak rumput dua warna
    for (let ty = 0; ty < 8; ty++) {
        for (let tx = 0; tx < 8; tx++) {

            ctx.fillStyle = (tx + ty) % 2 === 0
                ? "#5fbf4a"
                : "#58b443";

            ctx.fillRect(tx * 32, ty * 32, 32, 32);

        }
    }

    // Bintik rumput lebih terang
    for (let i = 0; i < 90; i++) {

        ctx.fillStyle = "#7fd65f";

        ctx.fillRect(
            rand() * 252,
            rand() * 252,
            3,
            3
        );

    }

    const texture = new THREE.CanvasTexture(canvas);

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;

}

// Tanah luas di luar arena supaya tidak ada ruang kosong
const outerGround = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshToonMaterial({ color: 0x4a9a3f })
);

outerGround.rotation.x = -Math.PI / 2;
outerGround.position.y = -0.05;

scene.add(outerGround);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshToonMaterial({ map: makeGrassTexture() })
);

floor.rotation.x = -Math.PI / 2;

floor.receiveShadow = true;

scene.add(floor);

/*==========================================================
    JALUR LANE (tanah liat) + LINGKARAN BASE
==========================================================*/

function createFlatPlane(width, depth, x, z, color, y) {

    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(width, depth),
        new THREE.MeshToonMaterial({ color: color })
    );

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;

}

function createFlatCircle(radius, x, z, color, y) {

    const mesh = new THREE.Mesh(
        new THREE.CircleGeometry(radius, 40),
        new THREE.MeshToonMaterial({ color: color })
    );

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;

}

// Tepi jalur (lebih gelap) lalu jalur utama
createFlatPlane(30, 5.6, 0, 0, 0xb98d55, 0.02);
createFlatPlane(30, 4.6, 0, 0, 0xdcb97a, 0.03);

// Lingkaran tanah di sekitar tower dan base
[-1, 1].forEach(side => {

    createFlatCircle(4.2, side * 11.5, 0, 0xb98d55, 0.025);
    createFlatCircle(3.7, side * 11.5, 0, 0xe8cc92, 0.035);

});

// Lingkaran tengah arena
createFlatCircle(2.4, 0, 0, 0xb98d55, 0.025);
createFlatCircle(2.0, 0, 0, 0xe8cc92, 0.035);

/*==========================================================
    PAGAR ARENA
==========================================================*/

function createWall(x, z, sx, sz) {

    const wall = makePart(
        new THREE.BoxGeometry(sx, 0.9, sz),
        0x9a8c7a,
        x,
        0.45,
        z,
        { outline: 1.06 }
    );

    wall.receiveShadow = true;

    scene.add(wall);

}

createWall(0, -15, 30.5, 0.6);
createWall(0, 15, 30.5, 0.6);
createWall(-15, 0, 0.6, 30.5);
createWall(15, 0, 0.6, 30.5);

// Tiang di tiap ujung dan tengah pagar
[-15, 0, 15].forEach(a => {
    [-15, 15].forEach(b => {

        scene.add(makePart(
            new THREE.CylinderGeometry(0.4, 0.45, 1.5, 10),
            0xb8a894,
            a,
            0.75,
            b
        ));

        if (a !== 0) return;

        scene.add(makePart(
            new THREE.CylinderGeometry(0.4, 0.45, 1.5, 10),
            0xb8a894,
            b,
            0.75,
            a
        ));

    });
});

/*==========================================================
    DEKORASI
==========================================================*/

// simple = true: tanpa outline dan bayangan (untuk pohon jauh)
function createTree(x, z, size, simple) {

    const s = size || 1;

    const o = simple ? { outline: false, shadow: false } : undefined;

    const tree = new THREE.Group();

    tree.add(makePart(
        new THREE.CylinderGeometry(0.22 * s, 0.32 * s, 1.2 * s, 8),
        0x8a5a2b,
        0,
        0.6 * s,
        0,
        o
    ));

    // Daun bertumpuk (bulat seperti kartun)
    tree.add(makePart(
        new THREE.SphereGeometry(1.0 * s, 14, 12),
        0x2fa84f,
        0,
        1.7 * s,
        0,
        o
    ));

    tree.add(makePart(
        new THREE.SphereGeometry(0.75 * s, 14, 12),
        0x3dc25e,
        0.1 * s,
        2.45 * s,
        0.05 * s,
        o
    ));

    tree.position.set(x, 0, z);

    scene.add(tree);

    return tree;

}

function createBush(x, z, size) {

    const s = size || 1;

    const bush = new THREE.Group();

    bush.add(makePart(
        new THREE.SphereGeometry(0.5 * s, 10, 8),
        0x2f9d46,
        0,
        0.35 * s,
        0
    ));

    bush.add(makePart(
        new THREE.SphereGeometry(0.38 * s, 10, 8),
        0x3dbb5c,
        0.45 * s,
        0.28 * s,
        0.1 * s
    ));

    bush.position.set(x, 0, z);

    scene.add(bush);

}

function createRock(x, z, size) {

    const s = size || 1;

    const rock = makePart(
        new THREE.DodecahedronGeometry(0.5 * s, 0),
        0xa9b0b8,
        x,
        0.3 * s,
        z
    );

    rock.rotation.y = x * 0.7;

    scene.add(rock);

}

function createFlower(x, z, color) {

    const flower = new THREE.Group();

    flower.add(makePart(
        new THREE.CylinderGeometry(0.03, 0.03, 0.3, 5),
        0x2f9d46,
        0,
        0.15,
        0,
        { outline: false, shadow: false }
    ));

    flower.add(makePart(
        new THREE.SphereGeometry(0.11, 8, 6),
        color,
        0,
        0.34,
        0,
        { outline: false, shadow: false }
    ));

    flower.position.set(x, 0, z);

    scene.add(flower);

}

// Pohon di sisi atas dan bawah lane (di luar jalur)
const treeSpots = [
    [-12, -9.5], [-6, -12], [0, -11.5], [6, -12], [12, -9.5],
    [-12, 9.5], [-6, 12], [0, 12], [6, 12], [12, 9.5]
];

treeSpots.forEach((p, i) => {
    createTree(p[0], p[1], 0.9 + (i % 3) * 0.15);
});

[[-8, -7], [8, -7], [-8, 7], [8, 7], [-3.5, 8.5], [3.5, -8.5]].forEach(p => {
    createBush(p[0], p[1], 1);
});

[[-4, -9], [4, 9], [-13.5, 10.5], [13.5, -10.5]].forEach(p => {
    createRock(p[0], p[1], 1.1);
});

(function scatterFlowers() {

    const rand = seededRandom(21);
    const colors = [0xffffff, 0xffe066, 0xff8fb1, 0xb28dff];

    for (let i = 0; i < 28; i++) {

        const x = rand() * 26 - 13;
        const z = rand() * 26 - 13;

        // Jangan di jalur lane
        if (Math.abs(z) < 3.2) continue;

        createFlower(x, z, colors[i % colors.length]);

    }

})();

/*==========================================================
    OBJECT STORAGE
==========================================================*/

const worldObjects = [];

function addWorldObject(obj) {

    worldObjects.push(obj);

    scene.add(obj);

}

/*==========================================================
    ANIMASI BENDA
    kind:
      "spin"  berputar        "bob"   naik turun
      "pulse" berdenyut       "wave"  bergoyang (bendera)
      "drift" bergeser pelan (amount = batas sebelum kembali)
==========================================================*/

const animatedObjects = [];

function registerAnimated(obj, kind, speed, amount) {

    animatedObjects.push({
        obj: obj,
        kind: kind,
        speed: speed || 1,
        amount: amount || 0.15,
        baseY: obj.position.y,
        phase: Math.random() * 6.28
    });

}

/*==========================================================
    EFEK SINGKAT
    Tiap efek punya durasi dan fungsi step(k), k = 0..1.
==========================================================*/

const effects = [];

// Geometri bersama (tidak dibuang saat efek selesai)
const sparkGeometry = new THREE.BoxGeometry(0.12, 0.12, 0.12);
const puffGeometry = new THREE.SphereGeometry(0.4, 8, 6);
const projectileGeometry = new THREE.SphereGeometry(0.2, 8, 6);

const SHARED_GEOMETRIES = [sparkGeometry, puffGeometry, projectileGeometry];

function addEffect(object, duration, step) {

    scene.add(object);

    effects.push({
        mesh: object,
        time: 0,
        duration: duration,
        step: step
    });

}

function disposeObject(root) {

    root.traverse(obj => {

        if (obj.geometry && !SHARED_GEOMETRIES.includes(obj.geometry)) {
            obj.geometry.dispose();
        }

        if (obj.material) {
            obj.material.dispose();
        }

    });

}

// Cincin yang melebar di tanah (skill)
function spawnRingEffect(pos, color, radius, duration) {

    const mesh = new THREE.Mesh(
        new THREE.RingGeometry(0.82, 1, 48),
        new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        })
    );

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(pos.x, 0.12, pos.z);
    mesh.scale.setScalar(0.2);

    const r = radius || 3;

    addEffect(mesh, duration || 0.4, k => {

        // Membesar cepat lalu melambat
        const ease = 1 - (1 - k) * (1 - k);

        mesh.scale.setScalar(0.2 + (r - 0.2) * ease);
        mesh.material.opacity = 0.9 * (1 - k);

    });

}

// Busur tebasan di depan hero (facingY = rotation.y hero)
function spawnSlashEffect(pos, facingY, color) {

    const pivot = new THREE.Group();

    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    const arc = new THREE.Mesh(
        new THREE.RingGeometry(0.75, 1.5, 20, 1, -0.95, 1.9),
        material
    );

    arc.rotation.x = -Math.PI / 2;

    pivot.add(arc);

    // Depan karakter = arah -z
    pivot.position.set(
        pos.x - Math.sin(facingY) * 0.5,
        1.0,
        pos.z - Math.cos(facingY) * 0.5
    );

    const base = facingY + Math.PI / 2;

    pivot.rotation.y = base;

    addEffect(pivot, 0.22, k => {

        pivot.scale.setScalar(0.8 + 0.6 * k);
        pivot.rotation.y = base + (k - 0.5) * 0.8;
        material.opacity = 0.9 * (1 - k);

    });

}

// Asap / debu yang membesar lalu pudar (unit mati, bangunan hancur)
function spawnPuff(pos, color, size) {

    const group = new THREE.Group();
    const materials = [];

    for (let i = 0; i < 3; i++) {

        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.7,
            depthWrite: false
        });

        const puff = new THREE.Mesh(puffGeometry, material);

        puff.position.set((i - 1) * 0.35, 0.3 + i * 0.1, (i % 2 - 0.5) * 0.3);

        group.add(puff);
        materials.push(material);

    }

    const s = size || 1;

    group.position.set(pos.x, 0.3, pos.z);

    addEffect(group, 0.5, k => {

        group.scale.setScalar((0.5 + k * 1.2) * s);
        group.position.y = 0.3 + k * 0.8;

        materials.forEach(m => {
            m.opacity = 0.7 * (1 - k);
        });

    });

}

// Bola energi dari tower ke target (hanya visual)
function spawnProjectile(from, to, color) {

    const mesh = new THREE.Mesh(
        projectileGeometry,
        new THREE.MeshBasicMaterial({ color: color })
    );

    mesh.position.set(from.x, from.y, from.z);

    addEffect(mesh, 0.22, k => {

        mesh.position.set(
            from.x + (to.x - from.x) * k,
            from.y + (to.y - from.y) * k + Math.sin(k * Math.PI) * 0.6,
            from.z + (to.z - from.z) * k
        );

        mesh.scale.setScalar(1 - 0.4 * k);

    });

}

/*==========================================================
    PARTIKEL PERCIKAN
    Dibatasi supaya tetap ringan di HP.
==========================================================*/

const particles = [];

const MAX_PARTICLES = 70;

function spawnSparks(pos, color, count, speed, up) {

    for (let i = 0; i < count; i++) {

        if (particles.length >= MAX_PARTICLES) return;

        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1
        });

        const mesh = new THREE.Mesh(sparkGeometry, material);

        mesh.position.set(pos.x, pos.y, pos.z);

        const angle = Math.random() * 6.2832;
        const power = (speed || 3) * (0.5 + Math.random() * 0.5);
        const life = 0.35 + Math.random() * 0.25;

        scene.add(mesh);

        particles.push({
            mesh: mesh,
            material: material,
            vx: Math.cos(angle) * power,
            vy: (up || 3) * (0.6 + Math.random() * 0.8),
            vz: Math.sin(angle) * power,
            life: life,
            maxLife: life
        });

    }

}

/*==========================================================
    KILATAN PUTIH SAAT TERKENA SERANGAN
==========================================================*/

function flashMesh(root, duration) {

    if (!root) return;

    root.traverse(obj => {

        if (!obj.isMesh || obj.userData.isOutline) return;

        const m = obj.material;

        if (!m || !m.emissive || !m.emissive.getHex) return;

        // Simpan nilai asli sekali saja
        if (obj.userData.baseEmissive === undefined) {
            obj.userData.baseEmissive = m.emissive.getHex();
            obj.userData.baseEmissiveIntensity = m.emissiveIntensity;
        }

        m.emissive.setHex(0xffffff);
        m.emissiveIntensity = 0.9;

    });

    setTimeout(() => {

        root.traverse(obj => {

            if (obj.userData.baseEmissive === undefined) return;

            const m = obj.material;

            if (!m || !m.emissive) return;

            m.emissive.setHex(obj.userData.baseEmissive);
            m.emissiveIntensity = obj.userData.baseEmissiveIntensity;

        });

    }, duration || 90);

}

/*==========================================================
    GETAR KAMERA
==========================================================*/

let shakePower = 0;
let shakeTime = 0;
let shakeDuration = 0.001;

function shakeCamera(power, duration) {

    // Jangan menimpa getaran yang masih lebih kuat
    if (power < shakePower * (shakeTime / shakeDuration)) return;

    shakePower = power;
    shakeTime = duration;
    shakeDuration = duration;

}

function getShakeOffset() {

    if (shakeTime <= 0) {
        return { x: 0, z: 0 };
    }

    const amp = shakePower * (shakeTime / shakeDuration);

    return {
        x: (Math.random() - 0.5) * 2 * amp,
        z: (Math.random() - 0.5) * 2 * amp
    };

}

/*==========================================================
    UPDATE SCENE (dipanggil tiap frame dari main.js)
==========================================================*/

let sceneTime = 0;

function updateScene(dt) {

    sceneTime += dt;

    shakeTime = Math.max(0, shakeTime - dt);

    for (const a of animatedObjects) {

        if (a.kind === "spin") {

            a.obj.rotation.y += a.speed * dt;

        } else if (a.kind === "bob") {

            a.obj.position.y =
                a.baseY +
                Math.sin(sceneTime * a.speed + a.phase) * a.amount;

        } else if (a.kind === "pulse") {

            a.obj.scale.setScalar(
                1 + Math.sin(sceneTime * a.speed + a.phase) * a.amount
            );

        } else if (a.kind === "wave") {

            a.obj.rotation.y =
                Math.sin(sceneTime * a.speed + a.phase) * a.amount;

        } else if (a.kind === "drift") {

            a.obj.position.x += a.speed * dt;

            if (a.obj.position.x > a.amount) {
                a.obj.position.x = -a.amount;
            }

        }

    }

    // Efek singkat
    for (let i = effects.length - 1; i >= 0; i--) {

        const e = effects[i];

        e.time += dt;

        const k = Math.min(1, e.time / e.duration);

        e.step(k);

        if (k >= 1) {

            scene.remove(e.mesh);
            disposeObject(e.mesh);

            effects.splice(i, 1);

        }

    }

    // Partikel percikan
    for (let i = particles.length - 1; i >= 0; i--) {

        const p = particles[i];

        p.life -= dt;

        if (p.life <= 0) {

            scene.remove(p.mesh);
            p.material.dispose();

            particles.splice(i, 1);

            continue;

        }

        p.vy -= 14 * dt;

        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.mesh.position.z += p.vz * dt;

        // Memantul pelan di tanah
        if (p.mesh.position.y < 0.05) {
            p.mesh.position.y = 0.05;
            p.vy *= -0.3;
            p.vx *= 0.6;
            p.vz *= 0.6;
        }

        const k = p.life / p.maxLife;

        p.material.opacity = k;
        p.mesh.scale.setScalar(0.4 + k * 0.8);
        p.mesh.rotation.x += dt * 8;

    }

}

/*==========================================================
    DEKORASI HIDUP
    (setelah sistem animasi, karena memakai registerAnimated)
==========================================================*/

// Obor di tepi lane
function createTorch(x, z) {

    const torch = new THREE.Group();

    torch.add(makePart(
        new THREE.CylinderGeometry(0.08, 0.11, 1.3, 8),
        0x6b4423, 0, 0.65, 0
    ));

    torch.add(makePart(
        new THREE.CylinderGeometry(0.24, 0.14, 0.2, 10),
        0x4a4a58, 0, 1.38, 0
    ));

    // Api: kerucut oranye + halo transparan, berdenyut
    const fire = new THREE.Group();

    fire.position.y = 1.65;

    fire.add(new THREE.Mesh(
        new THREE.ConeGeometry(0.15, 0.45, 8),
        new THREE.MeshBasicMaterial({ color: 0xffa534 })
    ));

    const inner = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.28, 8),
        new THREE.MeshBasicMaterial({ color: 0xffe27a })
    );

    inner.position.y = -0.04;

    fire.add(inner);

    fire.add(new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 12, 10),
        new THREE.MeshBasicMaterial({
            color: 0xffa534,
            transparent: true,
            opacity: 0.16,
            depthWrite: false
        })
    ));

    torch.add(fire);

    registerAnimated(fire, "pulse", 9, 0.18);

    torch.position.set(x, 0, z);

    scene.add(torch);

}

[-9, -4.5, 4.5, 9].forEach(x => {

    createTorch(x, 3.5);
    createTorch(x, -3.5);

});

// Kunang-kunang melayang di rumput
(function createFireflies() {

    const rand = seededRandom(55);

    for (let i = 0; i < 16; i++) {

        const x = rand() * 26 - 13;
        let z = rand() * 20 + 4;

        if (rand() < 0.5) z = -z;

        const fly = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0xfff3a0 })
        );

        fly.position.set(x, 1 + rand() * 1.2, z);

        scene.add(fly);

        registerAnimated(fly, "bob", 1.2 + rand(), 0.25);
        registerAnimated(fly, "pulse", 3 + rand() * 2, 0.35);

    }

})();

// Bayangan awan yang bergeser pelan di tanah
(function createCloudShadows() {

    const spots = [[-18, -8, 5], [-4, 6, 4], [10, -3, 6], [20, 9, 4.5]];

    spots.forEach(s => {

        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(1, 24),
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.07,
                depthWrite: false
            })
        );

        shadow.rotation.x = -Math.PI / 2;
        shadow.scale.set(s[2], s[2] * 0.6, 1);
        shadow.position.set(s[0], 0.08, s[1]);

        scene.add(shadow);

        registerAnimated(shadow, "drift", 0.7, 24);

    });

})();

// Barisan pohon di luar pagar sebagai bingkai arena
(function createOuterTrees() {

    for (let x = -14; x <= 14; x += 4) {

        createTree(x, -18, 1.1 + (x % 3 === 0 ? 0.2 : 0), true);
        createTree(x + 2, 18, 1.0 + (x % 3 === 0 ? 0.25 : 0), true);

    }

    for (let z = -10; z <= 10; z += 5) {

        createTree(-18, z, 1.1, true);
        createTree(18, z + 2, 1.15, true);

    }

})();

/*==========================================================
    RESIZE
==========================================================*/

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});

/*==========================================================
    RENDER
==========================================================*/

function renderScene() {

    renderer.render(scene, camera);

}
