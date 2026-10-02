/*==========================================================
    Arena Battle 3D
    main.js FINAL
==========================================================*/

"use strict";

/*==========================================================
    GLOBAL
==========================================================*/

let lastFrame = performance.now();
let paused = false;

let gameTime = 0;

let waveTimer = 0;
const WAVE_DELAY = 10;

/*==========================================================
    PAUSE
==========================================================*/

function togglePause() {

    // Setelah menang / kalah, game tidak bisa di-unpause
    if (gameOver) return;

    paused = !paused;

    const pauseUI = document.getElementById("pauseText");

    if (pauseUI) {
        pauseUI.style.display = paused ? "block" : "none";
    }

    lastFrame = performance.now();

}

window.addEventListener("keydown", (e) => {

    if (e.code === "Escape") {
        togglePause();
    }

});

const pauseButton = document.getElementById("pauseButton");

if (pauseButton) {

    pauseButton.addEventListener("pointerdown", (e) => {

        e.preventDefault();

        togglePause();

    });

}

/*==========================================================
    CAMERA FOLLOW
==========================================================*/

function updateCamera() {

    if (
        typeof Player === "undefined" ||
        !Player.mesh
    ) {
        return;
    }

    const target = Player.mesh.position;

    // Sudut miring seperti game MOBA
    camera.position.x +=
        (target.x - camera.position.x) * 0.08;

    camera.position.y +=
        (14 - camera.position.y) * 0.08;

    camera.position.z +=
        (target.z + 10 - camera.position.z) * 0.08;

    camera.lookAt(
        target.x,
        0,
        target.z - 1
    );

}

/*==========================================================
    GAME LOOP
==========================================================*/

function gameLoop(time) {

    if (paused) {

        lastFrame = time;
        requestAnimationFrame(gameLoop);

        return;
    }

    const dt = Math.min(
        (time - lastFrame) / 1000,
        0.05
    );

    lastFrame = time;

    if (typeof updatePlayer === "function") {
        updatePlayer(dt);
    }

    if (typeof updateEnemy === "function") {
        updateEnemy(dt);
    }

    if (typeof updateMinions === "function") {
        updateMinions(dt);
    }

    if (typeof updateTowers === "function") {
        updateTowers(dt);
    }

    gameTime += dt;

    if (typeof updateScene === "function") {
        updateScene(dt);
    }

    if (typeof updateBaseShield === "function") {
        updateBaseShield();
    }

    if (typeof updateUI === "function") {
        updateUI();
    }

    /*======================================================
        AUTO SPAWN WAVE
    ======================================================*/

    waveTimer += dt;

    if (waveTimer >= WAVE_DELAY) {

        waveTimer = 0;

        if (typeof spawnWave === "function") {
            spawnWave();
        }

    }

    updateCamera();

    if (typeof renderScene === "function") {
        renderScene();
    }

    requestAnimationFrame(gameLoop);

}

/*==========================================================
    START GAME
==========================================================*/

function startGame() {

    // Player
    if (typeof createPlayer === "function") {
        createPlayer();
    }

    // Enemy Hero
    if (typeof createEnemy === "function") {
        createEnemy();
    }

    // Base
    if (typeof createBases === "function") {
        createBases();
    }

    // Tower
    if (typeof createTowerLine === "function") {
        createTowerLine();
    }

    // First Wave
    if (typeof spawnWave === "function") {
        spawnWave();
    }

    // UI
    if (typeof updateUI === "function") {
        updateUI();
    }

    requestAnimationFrame(gameLoop);

}

/*==========================================================
    RUN GAME
==========================================================*/

startGame();
