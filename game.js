let plane = document.getElementById("plane");
let scoreEl = document.getElementById("score");
let area = document.getElementById("area");
let restartBtn = document.getElementById("restartBtn");

let score = 0;
let gameRunning = true;

let planeX = 160;
let planeY = 400;

let bullets = [];
let meteors = [];

let keys = {};
let canShoot = true;

// ================= SOUND (SAFE) =================
function playSound(src) {
    let s = new Audio(src);
    s.volume = 0.5;
    s.play().catch(() => { });
}

// ================= SHOOT (NO SOUND) =================
function shoot() {
    if (!gameRunning || !canShoot) return;

    bullets.push({
        x: planeX + 30,
        y: planeY
    });

    canShoot = false;
    setTimeout(() => canShoot = true, 200);
}

// ================= KEYBOARD =================
window.addEventListener("keydown", e => {
    keys[e.keyCode] = true;

    if (e.keyCode === 32) shoot();
});

window.addEventListener("keyup", e => {
    keys[e.keyCode] = false;
});

// ================= TOUCH (SMOOTH SIMPLE) =================
let lastX = 0;
let lastY = 0;

area.addEventListener("touchstart", e => {
    let t = e.touches[0];
    lastX = t.clientX;
    lastY = t.clientY;

    shoot();
});

area.addEventListener("touchmove", e => {
    if (!gameRunning) return;

    let t = e.touches[0];

    let dx = t.clientX - lastX;
    let dy = t.clientY - lastY;

    planeX += dx;
    planeY += dy;

    lastX = t.clientX;
    lastY = t.clientY;

    e.preventDefault();
}, { passive: false });

// ================= METEOR SPAWN =================
setInterval(() => {
    if (!gameRunning) return;

    meteors.push({
        x: Math.random() * (area.clientWidth - 60),
        y: -50,
        speed: 2 + Math.random() * 2
    });

}, 1000);

// ================= GAME LOOP =================
function update() {
    requestAnimationFrame(update);

    if (!gameRunning) return;

    // move keyboard
    if (keys[37]) planeX -= 4;
    if (keys[39]) planeX += 4;
    if (keys[38]) planeY -= 4;
    if (keys[40]) planeY += 4;

    // batas layar
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

        // HIT PLAYER
        if (
            planeX < m.x + 60 &&
            planeX + 70 > m.x &&
            planeY < m.y + 70 &&
            planeY + 70 > m.y
        ) {
            playSound("sound/boom.mp3");
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

                // 🔊 hanya saat kena
                playSound("sound/tembakan.mp3");

                m.el.remove();
                b.el.remove();

                meteors.splice(i, 1);
                bullets.splice(j, 1);

                break;
            }
        }

        if (m.y > area.clientHeight + 50) {
            m.el.remove();
            meteors.splice(i, 1);
        }
    }

    plane.style.left = planeX + "px";
    plane.style.top = planeY + "px";
}

// ================= GAME OVER =================
function gameOver() {
    gameRunning = false;
    restartBtn.style.display = "block";
}

// restart
restartBtn.onclick = () => location.reload();

update();