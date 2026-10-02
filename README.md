# Arena Battle 3D

Game arena 3D bergaya MOBA mini, dibuat dengan [Three.js](https://threejs.org/) (v0.160 via CDN). Tanpa build tool.

## Cara main

Buka `index.html` di browser (atau jalankan server statis, misalnya `python3 -m http.server`).

| Kontrol | PC | Mobile |
| --- | --- | --- |
| Bergerak | W A S D / panah | D-pad di layar |
| Serang | Spasi / klik kiri | Tombol ⚔ |
| Pause | ESC | - |

## Aturan

- Tiap tim punya **tower** dan **base**. Base kebal selama tower timnya masih hidup.
- Hancurkan tower musuh, lalu base musuh untuk menang. Kalau HP-mu atau base-mu habis, kamu kalah.
- Setiap 10 detik, 3 minion kurcaci muncul dari tiap sisi. Minion melawan minion dan hero lawan yang dekat, lalu maju ke tower dan base.
- Serangan Hikaru mengenai semua musuh dalam jangkauan: hero, minion, tower, dan base.
- Hero musuh (Dark Knight) hidup lagi 8 detik setelah dikalahkan.

## Struktur file

| File | Isi |
| --- | --- |
| `arena.js` | Scene, kamera, lampu, lantai, dinding |
| `player.js` | Hikaru: input, gerak, serangan |
| `enemy.js` | Dark Knight: AI kejar, serangan, respawn |
| `minion.js` | Minion, targeting, `damageEntity()` |
| `tower.js` | Tower dan serangannya |
| `base.js` | Base dan perlindungan tower |
| `ui.js` | HUD, health bar, layar menang/kalah |
| `main.js` | Game loop, kamera, pause |
