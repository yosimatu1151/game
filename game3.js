// ====== 基本設定 ======
let W = 50, H = 30;
let ROOM_MAX = 6;
let ROOM_MIN_SIZE = 4;
let ROOM_MAX_SIZE = 10;

let map = [];
let rooms = [];
let floor = 1;

let player = {
    x: 0,
    y: 0,
    hp: 100,
    maxHp: 100,
    exp: 0,
    level: 1,
    atk: 5
};

let enemies = [];   // ★ 複数敵
let stairs = { x: 0, y: 0 };

let playerTurn = true;
let gameOver = false;

// ===== DOM =====
const mapDiv = document.getElementById("map");
const php = document.getElementById("php");
const ehp = document.getElementById("ehp");
const logDiv = document.getElementById("log");
const floorUI = document.getElementById("floor");
const lvUI = document.getElementById("lv");
const expUI = document.getElementById("exp");

function log(msg) {
    logDiv.innerHTML += msg + "<br>";
    logDiv.scrollTop = logDiv.scrollHeight;
}

// ===== UI更新 =====
function updateUI() {
    php.textContent = player.hp;
    ehp.textContent = enemies.length;
    lvUI.textContent = player.level;
    expUI.textContent = player.exp;
    floorUI.textContent = floor;
}

// ===== マップ生成 =====
function generateMap() {
    rooms = [];
    map = [];
    enemies = [];

    for (let y = 0; y < H; y++) {
        map[y] = [];
        for (let x = 0; x < W; x++) map[y][x] = 0;
    }

    function createRoom(x, y, w, h) {
        for (let iy = y; iy < y + h; iy++)
            for (let ix = x; ix < x + w; ix++)
                map[iy][ix] = 1;
    }

    function center(r) {
        return [
            Math.floor(r.x + r.w / 2),
            Math.floor(r.y + r.h / 2)
        ];
    }

    function digTunnel(x1, y1, x2, y2) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) map[y1][x] = 1;
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) map[y][x2] = 1;
    }

    for (let i = 0; i < ROOM_MAX; i++) {
        const w = ROOM_MIN_SIZE + (Math.random() * (ROOM_MAX_SIZE - ROOM_MIN_SIZE) | 0);
        const h = ROOM_MIN_SIZE + (Math.random() * (ROOM_MAX_SIZE - ROOM_MIN_SIZE) | 0);
        const x = 1 + (Math.random() * (W - w - 2) | 0);
        const y = 1 + (Math.random() * (H - h - 2) | 0);

        const room = { x, y, w, h };

        if (rooms.some(r =>
            x < r.x + r.w && x + w > r.x &&
            y < r.y + r.h && y + h > r.y
        )) continue;

        createRoom(x, y, w, h);

        if (rooms.length) {
            const [px, py] = center(rooms[rooms.length - 1]);
            const [nx, ny] = center(room);
            digTunnel(px, py, nx, ny);
        }
        rooms.push(room);
    }

    // プレイヤー
    [player.x, player.y] = center(rooms[0]);

    // 階段
    [stairs.x, stairs.y] = center(rooms[rooms.length - 1]);

    // 敵（ランダム 2〜4体）
    let enemyCount = 2 + (Math.random() * 3 | 0);
    for (let i = 0; i < enemyCount; i++) placeEnemy();

    draw();
}

function placeEnemy() {
    while (true) {
        let x = Math.random() * W | 0;
        let y = Math.random() * H | 0;

        if (map[y][x] !== 1) continue;
        if (x === player.x && y === player.y) continue;
        if (enemies.some(e => e.x === x && e.y === y)) continue;

        enemies.push({ x, y, hp: 15 });
        return;
    }
}

// ===== 描画 =====
function draw() {
    mapDiv.innerHTML = "";

    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const t = document.createElement("div");
            t.classList.add("tile");

            if (x === player.x && y === player.y) t.classList.add("player");
            else if (enemies.some(e => e.x === x && e.y === y)) t.classList.add("enemy");
            else if (x === stairs.x && y === stairs.y) t.classList.add("stairs");
            else t.classList.add(map[y][x] === 1 ? "floor" : "wall");

            mapDiv.appendChild(t);
        }
        mapDiv.appendChild(document.createElement("br"));
    }

    updateUI();
}

// ===== 敵ターン =====
function enemyTurn() {
    for (let e of enemies) {
        let dx = Math.sign(player.x - e.x);
        let dy = Math.sign(player.y - e.y);

        let nx = e.x + dx;
        let ny = e.y + dy;

        if (map[ny]?.[nx] === 1 &&
            !(nx === player.x && ny === player.y) &&
            !enemies.some(o => o !== e && o.x === nx && o.y === ny)) {
            e.x = nx;
            e.y = ny;
        }

        if (Math.abs(e.x - player.x) + Math.abs(e.y - player.y) === 1) {
            player.hp -= 10;
            log("敵の攻撃！ 10ダメージ");
            if (player.hp <= 0) {
                gameOver = true;
                log("GAME OVER");
                setTimeout(() => {
                    location.href = "game3over.html";
                },500);
}

        }
    }
}

// ===== プレイヤー操作 =====
document.addEventListener("keydown", (e) => {
    if (gameOver || !playerTurn) return;

    let nx = player.x;
    let ny = player.y;

    if (e.key === "w") ny--;
    if (e.key === "s") ny++;
    if (e.key === "a") nx--;
    if (e.key === "d") nx++;

    // 攻撃
    if (e.key === "f") {
        let target = enemies.find(e =>
            Math.abs(player.x - e.x) + Math.abs(player.y - e.y) === 1
        );

        if (target) {
            target.hp -= player.atk;
            log(`敵に ${player.atk} ダメージ`);

            if (target.hp <= 0) {
                enemies = enemies.filter(e => e !== target);
                log("敵を倒した！ EXP +10");
                gainExp(10);
            }
        }

        endPlayerTurn();
        return;
    }

    // 移動
    if (map[ny]?.[nx] === 1 &&
        !enemies.some(e => e.x === nx && e.y === ny)) {
        player.x = nx;
        player.y = ny;
    }

    // 階段
    if (player.x === stairs.x && player.y === stairs.y) {
        floor++;
        log(`=== ${floor}階 ===`);
        generateMap();
        return;
    }

    endPlayerTurn();
});

// ===== 経験値 =====
function gainExp(amount) {
    player.exp += amount;

    let need = player.level * 10;

    while (player.exp >= need) {
        player.exp -= need;
        player.level++;

        // 攻撃力アップ
        player.atk = Math.floor(player.atk * 1.2);

        // ★ 最大HPアップ
        player.maxHp += 20;

        // ★ 回復量アップ（最大HPの50%回復）
        let heal = Math.floor(player.maxHp * 0.5);
        player.hp = Math.min(player.maxHp, player.hp + heal);

        log(`*** レベルアップ！ Lv${player.level} ***`);
        log(`最大HPが ${player.maxHp} に増加！`);
        log(`HPが ${heal} 回復！`);
        log(`ATK が ${player.atk} に上昇！`);

        need = player.level * 10;
    }

    updateUI();
}


// ===== ターン終了 =====
function endPlayerTurn() {
    playerTurn = false;
    enemyTurn();
    draw();
    playerTurn = true;
}

// ===== 初期化 =====
generateMap();
log("ゲーム開始！");
