/*==========================================================
    Arena Battle 3D
    ui.js FIXED

    Sistem:
    - HUD HP
    - Health bar HTML (atas layar)
    - Health bar 3D di atas hero
    - Teks melayang / pesan
    - Victory / Defeat + tombol main lagi
==========================================================*/

"use strict";

let playerBar = null;
let enemyBar = null;

// Lebar sprite health bar 3D saat HP penuh
const BAR_WIDTH = 2;

/*==========================================================
    CREATE 3D HEALTH BAR
==========================================================*/

function createHealthBar(object, color) {

    const canvas = document.createElement("canvas");

    canvas.width = 256;
    canvas.height = 32;

    const ctx = canvas.getContext("2d");

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.SpriteMaterial({
        map: texture
    });

    const sprite = new THREE.Sprite(material);

    // Mulai dari penuh
    sprite.scale.set(BAR_WIDTH, 0.25, 1);
    sprite.position.y = 3;

    object.add(sprite);

    return sprite;

}

/*==========================================================
    HEALTH BAR ANIMATION
    Lebar bar = persen HP x BAR_WIDTH (dihaluskan)
==========================================================*/

function updateHealthBar(bar, current, max) {

    if (!bar) return;

    const percent = Math.max(0, Math.min(1, current / max));

    bar.scale.x +=
        (percent * BAR_WIDTH - bar.scale.x) * 0.15;

}

/*==========================================================
    UPDATE HUD
    Dipanggil tiap frame dari main.js.
==========================================================*/

function updateUI() {

    // ---------- Angka HP ----------
    const playerHP = document.getElementById("playerHP");

    if (playerHP) {
        playerHP.innerHTML = Math.floor(Player.hp);
    }

    const enemyHP = document.getElementById("enemyHealth");

    if (enemyHP) {
        enemyHP.innerHTML = Math.floor(Enemy.hp);
    }

    // ---------- Bar HTML ----------
    const htmlBar = document.getElementById("playerHealthBar");

    if (htmlBar) {

        const percent =
            Math.max(0, Math.min(1, Player.hp / Player.maxHp)) * 100;

        htmlBar.style.width = percent + "%";

    }

    // ---------- Bar 3D (dibuat saat pertama dibutuhkan,
    //            dan dibuat ulang kalau hero respawn) ----------
    if (Player.mesh && (!playerBar || playerBar.parent !== Player.mesh)) {
        playerBar = createHealthBar(Player.mesh, "cyan");
    }

    if (Enemy.mesh && (!enemyBar || enemyBar.parent !== Enemy.mesh)) {
        enemyBar = createHealthBar(Enemy.mesh, "red");
    }

    updateHealthBar(playerBar, Player.hp, Player.maxHp);
    updateHealthBar(enemyBar, Enemy.hp, Enemy.maxHp);

}

/*==========================================================
    DAMAGE TEXT / MESSAGE
==========================================================*/

function showDamage(text) {

    const div = document.createElement("div");

    div.innerHTML = text;

    div.style.position = "absolute";
    div.style.left = "50%";
    div.style.top = "35%";
    div.style.transform = "translate(-50%,-50%)";
    div.style.color = "yellow";
    div.style.fontSize = "28px";
    div.style.fontWeight = "bold";
    div.style.zIndex = "100";
    div.style.pointerEvents = "none";

    document.body.appendChild(div);

    let y = 0;

    const anim = setInterval(() => {

        y -= 2;

        div.style.top = `calc(35% + ${y}px)`;
        div.style.opacity = 1 + y / 100;

        if (y < -100) {
            clearInterval(anim);
            div.remove();
        }

    }, 20);

}

// Dipanggil dari enemy.js dan tower.js
function addMessage(text) {

    showDamage(text);

}

/*==========================================================
    RESULT SCREEN
    Gaya layar ada di style.css (#resultScreen).
==========================================================*/

function showResult(text, type) {

    let screen = document.getElementById("resultScreen");

    if (!screen) {

        screen = document.createElement("div");
        screen.id = "resultScreen";

        const title = document.createElement("div");
        title.id = "resultText";
        screen.appendChild(title);

        const button = document.createElement("button");
        button.type = "button";
        button.id = "restartButton";
        button.innerHTML = "Main Lagi";
        button.addEventListener("click", () => {
            location.reload();
        });
        screen.appendChild(button);

        document.body.appendChild(screen);

    }

    const title = document.getElementById("resultText");

    title.innerHTML = text;
    title.style.color = type === "win" ? "cyan" : "red";

    screen.style.display = "block";

}

/*==========================================================
    WIN LOSE
==========================================================*/

function winGame() {

    if (gameOver) return;

    gameOver = true;

    showResult("🏆 HIKARU MENANG!", "win");

    paused = true;

}

function loseGame() {

    if (gameOver) return;

    gameOver = true;

    showResult("💀 KALAH!", "lose");

    paused = true;

}

/*==========================================================
    START UI
==========================================================*/

function initUI() {

    updateUI();

}
