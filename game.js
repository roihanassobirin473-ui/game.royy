let plane = document.getElementById("plane");
let scoreEl = document.getElementById("score");
let area = document.getElementById("area");
let restartBtn = document.getElementById("restartBtn");

// ================= GAME STATE =================
let score = 0;
let gameRunning = true;

// posisi pesawat
let planeX = 160;
let planeY = 400;

// object
let bullets = [];
let meteors = [];

// kontrol
let keys = {};
let canShoot = true;

// ================= SETTING GAME (INI PENTING) =================
let METEOR_SPEED_MIN = 1;   // 🔥 kecepatan paling lambat meteor
let METEOR_SPEED_MAX = 4;   // 🔥 kecepatan paling cepat meteor
let METEOR_SPAWN_TIME = 1000; // 🔥 tiap berapa ms meteor muncul

// ================= SOUND =================
function playSound(src, volume = 0.5) {
    let s = new Audio(src);
    s.volume = volume;
    s.play().catch(() => { });
}

// ================= SHOOT =================
function shoot() {
    if (!gameRunning) return;
    if (!canShoot) return;

    bullets.push({ x: planeX + 30, y: planeY });

    playSound("sound/tembakan.mp3", 0.5);

    canShoot = false;
    setTimeout(() => canShoot = true, 150);
}

// ================= KEYBOARD =================
window.addEventListener("keydown", e => {
    keys[e.keyCode] = true;

    if (e.keyCode === 32) shoot(); // SPACE
});

window.addEventListener("keyup", e => {
    keys[e.keyCode] = false;
});

// ================= TOUCH (HP) =================
let touchX = 0;
let touchY = 0;

area.addEventListener("touchstart", e => {
    let t = e.touches[0];
    touchX = t.clientX;
    touchY = t.clientY;

    shoot();
});

area.addEventListener("touchmove", e => {
    let t = e.touches[0];

    let dx = t.clientX - touchX;
    let dy = t.clientY - touchY;

    planeX += dx * 0.3;
    planeY += dy * 0.3;

    touchX = t.clientX;
    touchY = t.clientY;
});

// ================= METEOR SPAWN =================
setInterval(() => {
    if (!gameRunning) return;

    meteors.push({
        x: Math.random() * 340,
        y: -50,
        speed: METEOR_SPEED_MIN + Math.random() * METEOR_SPEED_MAX
    });

}, METEOR_SPAWN_TIME);

// ================= GAME LOOP =================
function update() {
    requestAnimationFrame(update);

    if (!gameRunning) return;

    // MOVE KEYBOARD
    if (keys[37]) planeX -= 5;
    if (keys[39]) planeX += 5;
    if (keys[38]) planeY -= 5;
    if (keys[40]) planeY += 5;

    planeX = Math.max(0, Math.min(330, planeX));
    planeY = Math.max(0, Math.min(420, planeY));

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

        if (b.y < 0) {
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

        // HIT PLAYER
        if (
            planeX < m.x + 60 &&
            planeX + 70 > m.x &&
            planeY < m.y + 70 &&
            planeY + 70 > m.y
        ) {
            playSound("sounds/boom.mp3", 0.7);
            gameOver();
        }

        // HIT BULLET
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

                playSound("sound/tembakan.mp3", 0.7);

                m.el.remove();
                b.el.remove();

                meteors.splice(i, 1);
                bullets.splice(j, 1);

                break;
            }
        }
    }

    // update pesawat
    plane.style.left = planeX + "px";
    plane.style.top = planeY + "px";
}

// ================= GAME OVER =================
function gameOver() {
    gameRunning = false;
    restartBtn.style.display = "block";
}

// ================= RESTART =================
restartBtn.onclick = () => {
    location.reload();
};

// START GAME
update();