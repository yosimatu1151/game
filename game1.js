// 4. キャンバスの準備
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//画像ロード
const playerImg = new Image();
playerImg.src = "player.png";  // 自機の画像

const enemyImg = new Image();
enemyImg.src = "inseki.png";    // 敵の画像

// プレイヤー
let player = { x: 180, y: 500, width: 40, height: 40, speed: 5 };


// --- スコア ---
let score = 0;

// --- ゲーム状態管理 ---
let gameState = "start"; // start / play / gameover

// クリックで状態切り替え
canvas.addEventListener("click", () => {
    if (gameState === "start") gameState = "play";
    if (gameState === "gameover") document.location.reload();
});

// --- スタート画面 ---
function drawStartScreen() {
    ctx.fillStyle = "white";
    ctx.font = "28px sans-serif";
    ctx.fillText("クリックしてスタート", 60, 250);

    ctx.font = "22px sans-serif";
    ctx.fillText("＜操作方法＞", 120, 320);

    ctx.font = "18px sans-serif";
    ctx.fillText("A / D ： 左右移動", 110, 360);
    ctx.fillText("W / S ： 上下移動", 110, 390);
    ctx.fillText("Eキー / スペース ： 弾を撃つ", 110, 420);
}

// --- プレイヤー描画 ---
function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

// --- キー操作 ---
let keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    // ★ Eキー または スペースで弾発射
    if (e.key === "e" || e.key === "E" || e.key === " ") {
        bullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 12,
            speed: 7
        });
    }
});


document.addEventListener("keyup", (e) => keys[e.key] = false);

function movePlayer() {
    if (keys["a"]) player.x -= player.speed;
    if (keys["d"]) player.x += player.speed;
    if (keys["w"]) player.y -= player.speed;
    if (keys["s"]) player.y += player.speed;

    // 画面外制限
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// --- 弾 ---
let bullets = [];

function moveBullets() {
    bullets.forEach((b) => {
        b.y -= b.speed;
    });

    // 画面外の弾を削除
    bullets = bullets.filter(b => b.y > -20);
}

function drawBullets() {
    ctx.fillStyle = "white";
    bullets.forEach((b) => {
        ctx.fillRect(b.x, b.y, b.width, b.height);
    });
}

// --- 星パーティクル ---
let stars = [];
for (let i = 0; i < 80; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 1 + 0.5
    });
}

function drawStars() {
    ctx.fillStyle = "white";
    stars.forEach(s => {
        ctx.fillRect(s.x, s.y, s.size, s.size);
        s.y += s.speed;

        if (s.y > canvas.height) {
            s.y = 0;
            s.x = Math.random() * canvas.width;
        }
    });
}

// --- 敵 ---
let enemy = { x: Math.random() * 360, y: 0, width: 70, height: 70, speed: 5 };


function drawEnemy() {
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);

}

function moveEnemy() {
    enemy.y += enemy.speed;
    if (enemy.y > canvas.height) {
        enemy.y = 0;
        enemy.x = Math.random() * (canvas.width - enemy.width);
    }
}

// 弾が敵に当たったか
function checkBulletHit() {
    bullets.forEach((b, i) => {
        if (
            b.x < enemy.x + enemy.width &&
            b.x + b.width > enemy.x &&
            b.y < enemy.y + enemy.height &&
            b.y + b.height > enemy.y
        ) {
            // 弾削除
            bullets.splice(i, 1);

            // スコア加算
            score += 100;

            // 敵リスポーン
            enemy.x = Math.random() * (canvas.width - enemy.width);
            enemy.y = 0;
        }
    });
}

// --- プレイヤーが敵に当たる ---
function checkCollision() {
    return (
        player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y
    );
}

// --- スコア ---
function drawScore() {
    ctx.fillStyle = "white"; // ★ 星に負けないように白に変更
    ctx.font = "20px sans-serif";
    ctx.fillText("SCORE: " + score, 10, 30);
}

// --- ゲームオーバー ---
function drawGameOver() {
    ctx.fillStyle = "white";
    ctx.font = "30px sans-serif";
    ctx.fillText("GAME OVER", 120, 250);

    ctx.font = "24px sans-serif";
    ctx.fillText("SCORE: " + score, 145, 300);

    ctx.font = "20px sans-serif";
    ctx.fillText("クリックでスタート画面", 90, 350);
}

// --- ゲームループ ---
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景（星）
    drawStars();

    // スタート
    if (gameState === "start") {
        drawStartScreen();
        requestAnimationFrame(gameLoop);
        return;
    }

    // ゲームオーバー
    if (gameState === "gameover") {
        drawGameOver();
        requestAnimationFrame(gameLoop);
        return;
    }

    // --- ゲーム中 ---
    movePlayer();
    moveEnemy();
    moveBullets();
    checkBulletHit();

    if (checkCollision()) {
        gameState = "gameover";
    }

    drawPlayer();
    drawEnemy();
    drawBullets();
    drawScore();

    requestAnimationFrame(gameLoop);
}

gameLoop();
