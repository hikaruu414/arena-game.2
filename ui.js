/*==========================================================
    Arena Battle 3D
    ui.js  (HUD gaya MOBA mobile)

    Sistem:
    - HUD: potret + HP, scoreboard, waktu, HP musuh
    - Bar HP 3D di atas hero, minion, tower, dan base
    - Minimap
    - Cooldown tombol skill
    - Angka damage melayang dan banner pesan
    - Layar menang / kalah + tombol main lagi
==========================================================*/

"use strict";

let playerBar = null;
let enemyBar = null;

// Warna bar HP
const COLOR_ALLY_BAR = 0x4cd964;
const COLOR_ENEMY_BAR = 0xff4d4d;
const COLOR_BLUE_TEAM = 0x3d8bff;

/*==========================================================
    HELPER DOM
==========================================================*/

const uiCache = {};

// Ubah teks hanya kalau nilainya berubah
function setText(id, value) {

    if (uiCache[id] === value) return;

    uiCache[id] = value;

    const el = document.getElementById(id);

    if (el) {
        el.textContent = value;
    }

}

function setWidth(id, percent) {

    const key = id + "_w";

    const rounded = Math.round(percent * 10) / 10;

    if (uiCache[key] === rounded) return;

    uiCache[key] = rounded;

    const el = document.getElementById(id);

    if (el) {
        el.style.width = rounded + "%";
    }

}

/*==========================================================
    BAR HP 3D
    Dua sprite: latar gelap + isi berwarna.
==========================================================*/

function createHealthBar(object, color, width, height, y) {

    const w = width || 2;
    const h = height || 0.25;

    const back = new THREE.Sprite(
        new THREE.SpriteMaterial({
            color: 0x14142a,
            transparent: true,
            opacity: 0.85,
            depthTest: false
        })
    );

    back.scale.set(w + 0.12, h + 0.1, 1);
    back.position.y = y;
    back.renderOrder = 10;

    const fill = new THREE.Sprite(
        new THREE.SpriteMaterial({
            color: color,
            depthTest: false
        })
    );

    fill.scale.set(w, h, 1);
    fill.position.y = y;
    fill.renderOrder = 11;

    fill.userData.fullWidth = w;
    fill.userData.back = back;

    object.add(back);
    object.add(fill);

    return fill;

}

// Lebar bar = persen HP x lebar penuh (dihaluskan)
function updateHealthBar(bar, current, max) {

    if (!bar) return;

    const full = bar.userData.fullWidth || 2;

    const percent = Math.max(0, Math.min(1, current / max));

    bar.scale.x += (percent * full - bar.scale.x) * 0.2;

}

// Buat bar kalau belum ada (atau kalau unit dibuat ulang)
function ensureBar(entity, color, width, height) {

    if (!entity.mesh) return null;

    if (!entity.bar || entity.bar.parent !== entity.mesh) {

        entity.bar = createHealthBar(
            entity.mesh,
            color,
            width,
            height,
            entity.mesh.userData.barHeight || 3
        );

    }

    return entity.bar;

}

function updateWorldBars() {

    // Hero
    playerBar = ensureBar(Player, COLOR_ALLY_BAR, 2, 0.26);
    enemyBar = ensureBar(Enemy, COLOR_ENEMY_BAR, 2, 0.26);

    updateHealthBar(playerBar, Player.hp, Player.maxHp);
    updateHealthBar(enemyBar, Enemy.hp, Enemy.maxHp);

    // Minion: bar baru terlihat setelah terkena damage
    for (const m of Minions) {

        if (!m.alive) continue;

        const bar = ensureBar(
            m,
            m.team === "player" ? COLOR_ALLY_BAR : COLOR_ENEMY_BAR,
            1.2,
            0.16
        );

        updateHealthBar(bar, m.hp, m.maxHp);

        const show = m.hp < m.maxHp;

        bar.visible = show;
        bar.userData.back.visible = show;

    }

    // Tower
    for (const t of Towers) {

        if (!t.alive) continue;

        const bar = ensureBar(
            t,
            t.team === "player" ? COLOR_BLUE_TEAM : COLOR_ENEMY_BAR,
            2.4,
            0.3
        );

        updateHealthBar(bar, t.hp, t.maxHp);

    }

    // Base
    for (const b of Bases) {

        if (b.hp <= 0) continue;

        const bar = ensureBar(
            b,
            b.team === "player" ? COLOR_BLUE_TEAM : COLOR_ENEMY_BAR,
            2.8,
            0.32
        );

        updateHealthBar(bar, b.hp, b.maxHp);

    }

}

/*==========================================================
    MINIMAP
==========================================================*/

function drawMinimap() {

    const canvas = document.getElementById("minimap");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const size = canvas.width;

    const k = size / 30;

    const px = x => (x + 15) * k;
    const pz = z => (z + 15) * k;

    // Rumput + lane
    ctx.fillStyle = "#3f9a47";
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "#d9b878";
    ctx.fillRect(0, pz(-2.3), size, 4.6 * k);

    // Area penyembuh
    for (const pad of HealPads) {

        const cx = px(pad.mesh.position.x);
        const cz = pz(pad.mesh.position.z);

        ctx.fillStyle = "#7dff9a";
        ctx.beginPath();
        ctx.arc(cx, cz, 6, 0, 6.2832);
        ctx.fill();

        // Tanda plus
        ctx.fillStyle = "#145a2a";
        ctx.fillRect(cx - 3.5, cz - 1, 7, 2);
        ctx.fillRect(cx - 1, cz - 3.5, 2, 7);

    }

    // Bangunan
    for (const b of Bases) {

        if (b.hp <= 0) continue;

        ctx.fillStyle = b.team === "player" ? "#3d8bff" : "#ff4d4d";
        ctx.fillRect(px(b.mesh.position.x) - 6, pz(b.mesh.position.z) - 6, 12, 12);

    }

    for (const t of Towers) {

        if (!t.alive) continue;

        ctx.fillStyle = t.team === "player" ? "#3d8bff" : "#ff4d4d";
        ctx.fillRect(px(t.mesh.position.x) - 4, pz(t.mesh.position.z) - 4, 8, 8);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(px(t.mesh.position.x) - 4, pz(t.mesh.position.z) - 4, 8, 8);

    }

    // Minion
    for (const m of Minions) {

        if (!m.alive) continue;

        ctx.fillStyle = m.team === "player" ? "#9ad1ff" : "#ffb09a";
        ctx.beginPath();
        ctx.arc(px(m.mesh.position.x), pz(m.mesh.position.z), 2.2, 0, 6.2832);
        ctx.fill();

    }

    // Hero
    function drawHero(mesh, color) {

        ctx.fillStyle = color;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px(mesh.position.x), pz(mesh.position.z), 5, 0, 6.2832);
        ctx.fill();
        ctx.stroke();

    }

    if (Enemy.mesh && Enemy.alive) {
        drawHero(Enemy.mesh, "#ff4d4d");
    }

    if (Player.mesh) {
        drawHero(Player.mesh, "#4cd964");
    }

}

/*==========================================================
    COOLDOWN TOMBOL SKILL
==========================================================*/

function updateSkillButton(id, skill) {

    const button = document.getElementById(id);

    if (!button || !skill) return;

    const ratio = skill.timer > 0 ? skill.timer / skill.cd : 0;

    button.style.setProperty("--cd", (ratio * 100).toFixed(0) + "%");

    button.classList.toggle("cooling", skill.timer > 0);

    const label = button.querySelector(".cdText");

    if (label) {
        label.textContent = skill.timer > 0 ? Math.ceil(skill.timer) : "";
    }

}

/*==========================================================
    UPDATE HUD
    Dipanggil tiap frame dari main.js.
==========================================================*/

function updateUI() {

    // ---------- Angka dan bar HP ----------
    setText("playerHP", String(Math.floor(Player.hp)));
    setText("enemyHealth", String(Math.floor(Enemy.hp)));

    setWidth(
        "playerHealthBar",
        Math.max(0, Math.min(1, Player.hp / Player.maxHp)) * 100
    );

    setWidth(
        "enemyHealthBar",
        Math.max(0, Math.min(1, Enemy.hp / Enemy.maxHp)) * 100
    );

    // ---------- Scoreboard ----------
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);

    setText(
        "gameTime",
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0")
    );

    setText(
        "blueTowers",
        String(Towers.filter(t => t.team === "player" && t.alive).length)
    );

    setText(
        "redTowers",
        String(Towers.filter(t => t.team === "enemy" && t.alive).length)
    );

    // ---------- Status penyembuhan / peringatan HP rendah ----------
    let healMessage = "";
    let healClass = "";

    if (Player.healing) {

        healMessage = "💚 Memulihkan HP...";
        healClass = "healing";

    } else if (Player.hp > 0 && Player.hp / Player.maxHp < 0.3) {

        healMessage = "❤️ HP rendah! Menuju lingkaran hijau di base";
        healClass = "low";

    }

    if (uiCache.healMessage !== healMessage) {

        uiCache.healMessage = healMessage;

        const badge = document.getElementById("healBadge");

        if (badge) {
            badge.textContent = healMessage;
            badge.className = healClass;
            badge.style.display = healMessage ? "block" : "none";
        }

    }

    // ---------- Skill ----------
    if (typeof Skills !== "undefined") {

        updateSkillButton("skillSlash", Skills.slash);
        updateSkillButton("skillHeal", Skills.heal);

    }

    // ---------- Bar 3D dan minimap ----------
    updateWorldBars();

    drawMinimap();

}

/*==========================================================
    ANGKA DAMAGE MELAYANG
==========================================================*/

let floatingCount = 0;

function showDamageNumber(pos, text, kind) {

    // Batasi jumlah elemen supaya tidak berat
    if (floatingCount > 24) return;

    const v = new THREE.Vector3(
        pos.x,
        (pos.y || 0) + 2.4,
        pos.z
    ).project(camera);

    if (v.z > 1) return;

    const x = (v.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-v.y * 0.5 + 0.5) * window.innerHeight;

    const div = document.createElement("div");

    div.className = "floatDmg" + (kind ? " " + kind : "");
    div.textContent = typeof text === "number" ? Math.round(text) : text;
    div.style.left = x + "px";
    div.style.top = y + "px";

    document.body.appendChild(div);

    floatingCount++;

    setTimeout(() => {

        div.remove();
        floatingCount--;

    }, 800);

}

/*==========================================================
    BANNER PESAN (tower hancur, dll)
==========================================================*/

function addMessage(text) {

    const div = document.createElement("div");

    div.className = "bannerMsg";
    div.textContent = text;

    document.body.appendChild(div);

    setTimeout(() => div.remove(), 1900);

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
    title.className = type === "win" ? "win" : "lose";

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
