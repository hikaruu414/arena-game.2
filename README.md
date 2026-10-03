# Arena Battle 3D

Game arena 3D bergaya MOBA mini, dibuat dengan [Three.js](https://threejs.org/) (v0.160 via CDN). Tanpa build tool.

## Cara main

Buka `index.html` di browser (atau jalankan server statis, misalnya `python3 -m http.server`).

| Kontrol | PC | Mobile |
| --- | --- | --- |
| Bergerak | W A S D / panah | Joystick di kiri bawah (analog) |
| Serang | Spasi / klik kiri | Tombol ⚔ |
| Skill 1: Tebasan Putar (damage area, cooldown 6 dtk) | Q | Tombol 🌀 |
| Skill 2: Penyembuh (+120 HP, cooldown 15 dtk) | E | Tombol 💚 |
| Pause | ESC | Tombol ⏸ di kanan atas |

## Aturan

- Tiap tim punya **tower** dan **base**. Base kebal selama tower timnya masih hidup.
- Hancurkan tower musuh, lalu base musuh untuk menang. Kalau HP-mu atau base-mu habis, kamu kalah.
- Setiap 10 detik, 3 minion kurcaci muncul dari tiap sisi. Minion melawan minion dan hero lawan yang dekat, lalu maju ke tower dan base.
- Serangan Hikaru mengenai semua musuh dalam jangkauan: hero, minion, tower, dan base.
- Hero musuh (Dark Knight) hidup lagi 8 detik setelah dikalahkan.
- Tiap tim punya **lingkaran penyembuh** hijau di samping base. Hero yang berdiri di dalamnya memulihkan 60 HP per detik. Lokasinya ditandai di minimap, dan saat HP di bawah 30% muncul peringatan di layar.

## Tampilan

Gaya kartun ala game MOBA mobile: karakter chibi beroutline, langit dan rumput cerah, lane tanah, HUD biru-emas dengan potret hero, scoreboard, minimap, angka damage melayang, dan bar HP di atas tiap unit. Semua model dibuat dari bentuk dasar Three.js (tanpa aset gambar atau model luar).

Efek dan animasi: ayunan pedang dengan busur tebasan, percikan dan kilatan putih saat terkena serangan, asap saat unit mati atau tower hancur, bola energi dari tower, getaran kamera, kilat merah di layar saat Hikaru terluka, jubah yang bergoyang, minion yang muncul dengan efek membesar. Dunia lebih hidup dengan obor berapi, kunang-kunang, bayangan awan yang bergeser, bendera berkibar di base, jendela bercahaya di tower, dan barisan pohon di luar pagar.

## Struktur file

| File | Isi |
| --- | --- |
| `arena.js` | Scene, kamera, lampu, lantai, dekorasi, helper gaya kartun (`makePart`, outline), efek cincin |
| `player.js` | Hikaru: input, gerak, serangan |
| `enemy.js` | Dark Knight: AI kejar, serangan, respawn |
| `minion.js` | Minion, targeting, `damageEntity()` |
| `tower.js` | Tower dan serangannya |
| `base.js` | Base dan perlindungan tower |
| `ui.js` | HUD, bar HP 3D, minimap, angka damage, layar menang/kalah |
| `main.js` | Game loop, kamera, pause |
