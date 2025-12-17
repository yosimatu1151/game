const player = document.getElementById("player");
const obstacle = document.getElementById("obstacle");
const scoreText = document.getElementById("score");
const countdownText = document.getElementById("countdown");

let jumping = false;
let jumpHeight = 0;
let gameOver = false;
let gameStarted = false;  // ← スタートフラグ追加

let score = 0;
let combo = 1;

//  カウントダウン処理追加
function startCountdown() {
    let count = 3;

    countdownText.innerText = count;

    let interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownText.innerText = count;
        } else {
            countdownText.innerText = "START!!";

            clearInterval(interval);

            // 1秒後に消す
            setTimeout(() => {
                countdownText.innerText = "";
            }, 1000);

            // ゲーム開始
            gameStarted = true;
        }
    }, 1000);
}

startCountdown();  // ← ページ読み込み時に開始
// ーーーーーーーーーーーーーーーーーー


// ジャンプ処理
function jump() {
    if (!gameStarted) return; // ← まだ始まってなければ無視
    if (jumping) return;
    jumping = true;

    let upInterval = setInterval(() => {
        if (jumpHeight >= 100) {
            clearInterval(upInterval);

            let downInterval = setInterval(() => {
                if (jumpHeight <= 0) {
                    clearInterval(downInterval);
                    jumping = false;
                }
                jumpHeight -= 5;
                player.style.bottom = jumpHeight + "px";
            }, 20);

        }
        jumpHeight += 5;
        player.style.bottom = jumpHeight + "px";
    }, 20);
}

document.addEventListener("keydown", e => {
    if (e.code === "Space") jump();
});
document.addEventListener("click", jump);


// 障害物移動
let obstacleX = 600;
let obstacleSpeed = getRandomSpeed();

function getRandomSpeed() {
    return Math.floor(Math.random() * 7) + 5; // 5〜12
}

function moveObstacle() {
    if (gameOver) return;

    // ★ゲームが始まるまでは障害物を止める
    if (!gameStarted) {
        requestAnimationFrame(moveObstacle);
        return;
    }

    obstacleX -= obstacleSpeed;
    obstacle.style.right = (600 - obstacleX) + "px";

    // 左に消えたらスコア加算 & コンボUP
    if (obstacleX < -30) {
        obstacleX = 600;
        obstacleSpeed = getRandomSpeed();

        score += combo;
        combo++;

        scoreText.innerText = `スコア: ${score}（コンボ: ${combo - 1}）`;
    }

    checkCollision();
    requestAnimationFrame(moveObstacle);
}
moveObstacle();


// 当たり判定
function checkCollision() {
    const playerRect = player.getBoundingClientRect();
    const obsRect = obstacle.getBoundingClientRect();

    if (
        playerRect.right > obsRect.left &&
        playerRect.left < obsRect.right &&
        playerRect.bottom > obsRect.top
    ) {
        gameOver = true;

        // ★ゲームオーバー画面へスコアつきで移動！
        location.href = "game2over.html?score=" + score;
    }
}
