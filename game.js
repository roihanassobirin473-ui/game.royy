let plane = document.getElementById("plane");
let scoreEl = document.getElementById("score");
let area = document.getElementById("area");
let restartBtn = document.getElementById("restartBtn");
let main = document.getElementById("main");

// GAME OVER UI
let gameOverBox = document.getElementById("gameOverBox");
let finalScore = document.getElementById("finalScore");
let gameText = document.getElementById("gameText");
let backHomeBtn = document.getElementById("backHomeBtn");

// ================= GAME STATE =================
let score = 0;
let gameRunning = true;

let planeX = 160;
let planeY = 400;

let bullets = [];
let meteors = [];

let keys = {};
let canShoot = true;

let bgY = 0;

// ================= SOUND =================
function playSound(src, volume = 0.5) {

    let s = new Audio(src);

    s.volume = volume;

    s.play().catch(() => { });

    return s;
}

// ================= SEMBUNYIKAN TOMBOL AWAL =================
restartBtn.style.display = "none";
backHomeBtn.style.display = "none";

// ================= SHOOT =================
function shoot() {

    if (!gameRunning) return;
    if (!canShoot) return;

    bullets.push({
        x: planeX + 33,
        y: planeY
    });

    // SOUND TEMBAK
    playSound("sounds/shoot.mp3", 0.4);

    canShoot = false;

    setTimeout(() => {
        canShoot = true;
    }, 250);
}

// ================= KEYBOARD =================
window.addEventListener("keydown", e => {

    keys[e.keyCode] = true;

    // SPACE
    if (e.keyCode === 32) {
        shoot();
    }
});

window.addEventListener("keyup", e => {
    keys[e.keyCode] = false;
});

// ================= TOUCH CONTROL =================
let touchStartX = 0;
let touchStartY = 0;

area.addEventListener("touchstart", e => {

    let t = e.touches[0];

    touchStartX = t.clientX;
    touchStartY = t.clientY;

    shoot();

}, { passive: false });

area.addEventListener("touchmove", e => {

    if (!gameRunning) return;

    let t = e.touches[0];

    let moveX = t.clientX - touchStartX;
    let moveY = t.clientY - touchStartY;

    // CONTROL HP LEBIH ENAK
    planeX += moveX * 0.25;
    planeY += moveY * 0.25;

    touchStartX = t.clientX;
    touchStartY = t.clientY;

    e.preventDefault();

}, { passive: false });

// ================= METEOR SPAWN =================
setInterval(() => {

    if (!gameRunning) return;

    // BATAS METEOR
    if (meteors.length > 5) return;

    meteors.push({

        x: Math.random() * (area.clientWidth - 60),

        y: -80,

        // METEOR LEBIH PELAN
        speed: 1 + Math.random() * 1.5
    });

}, 1400);

// ================= GAME LOOP =================
function update() {

    requestAnimationFrame(update);

    if (!gameRunning) return;

    // ================= BACKGROUND GERAK =================
    bgY += 1.5;

    main.style.backgroundPositionY = bgY + "px";

    // ================= MOVE KEYBOARD =================
    if (keys[37]) planeX -= 4;
    if (keys[39]) planeX += 4;
    if (keys[38]) planeY -= 4;
    if (keys[40]) planeY += 4;

    // BATAS LAYAR
    planeX = Math.max(0, Math.min(area.clientWidth - 80, planeX));
    planeY = Math.max(0, Math.min(area.clientHeight - 90, planeY));

    // ================= BULLET =================
    for (let i = bullets.length - 1; i >= 0; i--) {

        let b = bullets[i];

        b.y -= 10;

        if (!b.el) {

            b.el = document.createElement("div");

            b.el.className = "bullet";

            area.appendChild(b.el);
        }

        b.el.style.left = b.x + "px";
        b.el.style.top = b.y + "px";

        // HAPUS PELURU
        if (b.y < -20) {

            b.el.remove();

            bullets.splice(i, 1);
        }
    }

    // ================= METEOR =================
    for (let i = meteors.length - 1; i >= 0; i--) {

        let m = meteors[i];

        m.y += m.speed;

        if (!m.el) {

            m.el = document.createElement("div");

            m.el.className = "meteor";

            area.appendChild(m.el);
        }

        m.el.style.left = m.x + "px";
        m.el.style.top = m.y + "px";

        // ================= KENA PLAYER =================
        if (
            planeX < m.x + 60 &&
            planeX + 70 > m.x &&
            planeY < m.y + 70 &&
            planeY + 70 > m.y
        ) {

            gameOver();

            return;
        }

        // ================= KENA PELURU =================
        for (let j = bullets.length - 1; j >= 0; j--) {

            let b = bullets[j];

            if (
                b.x < m.x + 60 &&
                b.x + 5 > m.x &&
                b.y < m.y + 70 &&
                b.y + 10 > m.y
            ) {

                score += 10;

                scoreEl.innerText = score;

                // SOUND LEDAKAN
                playSound("sound/tembakan.mp3", 0.6);

                m.el.remove();
                b.el.remove();

                meteors.splice(i, 1);
                bullets.splice(j, 1);

                break;
            }
        }

        // METEOR KELUAR
        if (m.y > area.clientHeight + 100) {

            m.el.remove();

            meteors.splice(i, 1);
        }
    }

    // ================= UPDATE PESAWAT =================
    plane.style.left = planeX + "px";
    plane.style.top = planeY + "px";
}

// ================= GAME OVER =================
function gameOver() {

    gameRunning = false;

    // TAMPILKAN BOX
    gameOverBox.style.display = "block";

    // SEMBUNYIKAN DULU TOMBOL
    restartBtn.style.display = "none";
    backHomeBtn.style.display = "none";

    // SOUND GAME OVER
    let overSound = playSound("sound/gameover.mp3", 0.7);

    // SKOR AKHIR
    finalScore.innerText = "Skor Kamu : " + score;

    // TEXT RANDOM
    let texts = [

        "Pesawatmu hancur di luar angkasa 🚀",

        "Meteor terlalu kuat ☄️",

        "Pilot hebat tidak menyerah 🔥",

        "Coba lagi dan pecahkan rekor 😎",

        "Misi gagal... tapi tidak untuk selamanya 💫"
    ];

    let randomText =
        texts[Math.floor(Math.random() * texts.length)];

    gameText.innerText = randomText;

    // TOMBOL MUNCUL BARENG SETELAH SOUND SELESAI
    overSound.onended = () => {

        restartBtn.style.display = "block";
        backHomeBtn.style.display = "block";
    };
}

// ================= RESTART =================
restartBtn.onclick = () => {

    location.reload();
};

// ================= BUTTON HOME =================
document.getElementById("homeBtn").onclick = () => {

    window.location.href = "index.html";
};

backHomeBtn.onclick = () => {

    window.location.href = "index.html";
};

// START GAME
update();