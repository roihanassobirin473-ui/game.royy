let plane = document.getElementById("plane");
let scoreEl = document.getElementById("score");
let area = document.getElementById("area");
let restartBtn = document.getElementById("restartBtn");
let main = document.getElementById("main");

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
}

// ================= SHOOT =================
function shoot() {

    if (!gameRunning) return;
    if (!canShoot) return;

    bullets.push({
        x: planeX + 33,
        y: planeY
    });

    // sound tembak
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

// ================= TOUCH HP FIX =================
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

    // smooth hp control
    planeX += moveX * 0.25;
    planeY += moveY * 0.25;

    touchStartX = t.clientX;
    touchStartY = t.clientY;

    e.preventDefault();

}, { passive: false });

// ================= METEOR SPAWN =================
setInterval(() => {

    if (!gameRunning) return;

    // maksimal meteor
    if (meteors.length > 5) return;

    meteors.push({
        x: Math.random() * (area.clientWidth - 60),
        y: -80,

        // 🔥 meteor lebih pelan
        speed: 1 + Math.random() * 1.5
    });

}, 1400);

// ================= GAME LOOP =================
function update() {

    requestAnimationFrame(update);

    if (!gameRunning) return;

    // ================= BACKGROUND SCROLL =================
    bgY += 1.5;
    main.style.backgroundPositionY = bgY + "px";

    // ================= MOVE KEYBOARD =================
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

        // hapus peluru
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

        // ================= HIT PLAYER =================
        if (
            planeX < m.x + 60 &&
            planeX + 70 > m.x &&
            planeY < m.y + 70 &&
            planeY + 70 > m.y
        ) {

            playSound("sound/gameover.mp3", 0.7);

            gameOver();
        }

        // ================= HIT BULLET =================
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

                // ledakan
                playSound("sound/tembakan.mp3", 0.6);

                m.el.remove();
                b.el.remove();

                meteors.splice(i, 1);
                bullets.splice(j, 1);

                break;
            }
        }

        // keluar layar
        if (m.y > area.clientHeight + 100) {

            m.el.remove();
            meteors.splice(i, 1);
        }
    }

    // ================= UPDATE PLANE =================
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