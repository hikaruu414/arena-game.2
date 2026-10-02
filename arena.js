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

function createTree(x, z, size) {

    const s = size || 1;

    const tree = new THREE.Group();

    tree.add(makePart(
        new THREE.CylinderGeometry(0.22 * s, 0.32 * s, 1.2 * s, 8),
        0x8a5a2b,
        0,
        0.6 * s,
        0
    ));

    // Daun bertumpuk (bulat seperti kartun)
    tree.add(makePart(
        new THREE.SphereGeometry(1.0 * s, 14, 12),
        0x2fa84f,
        0,
        1.7 * s,
        0
    ));

    tree.add(makePart(
        new THREE.SphereGeometry(0.75 * s, 14, 12),
        0x3dc25e,
        0.1 * s,
        2.45 * s,
        0.05 * s
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

[[-4, -9], [4, 9], [-13, 6], [13, -6]].forEach(p => {
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
    kind: "spin" (berputar), "bob" (naik turun)
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
    EFEK CINCIN (skill)
==========================================================*/

const effects = [];

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

    scene.add(mesh);

    effects.push({
        mesh: mesh,
        time: 0,
        duration: duration || 0.4,
        radius: radius || 3
    });

}

/*==========================================================
    UPDATE SCENE (dipanggil tiap frame dari main.js)
==========================================================*/

let sceneTime = 0;

function updateScene(dt) {

    sceneTime += dt;

    for (const a of animatedObjects) {

        if (a.kind === "spin") {

            a.obj.rotation.y += a.speed * dt;

        } else if (a.kind === "bob") {

            a.obj.position.y =
                a.baseY +
                Math.sin(sceneTime * a.speed + a.phase) * a.amount;

        }

    }

    for (let i = effects.length - 1; i >= 0; i--) {

        const e = effects[i];

        e.time += dt;

        const k = Math.min(1, e.time / e.duration);

        // Membesar cepat lalu melambat
        const ease = 1 - (1 - k) * (1 - k);

        e.mesh.scale.setScalar(0.2 + (e.radius - 0.2) * ease);
        e.mesh.material.opacity = 0.9 * (1 - k);

        if (k >= 1) {

            scene.remove(e.mesh);
            e.mesh.geometry.dispose();
            e.mesh.material.dispose();

            effects.splice(i, 1);

        }

    }

}

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
