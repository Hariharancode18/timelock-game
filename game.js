const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const TILE = 40;

// ===== CONFIG (SAFE DEFAULTS) =====
const cfg = JSON.parse(localStorage.getItem("cfg")) || {
  playerSpeed: 2,
  ghostSpeed: 2,
  useMoves: false,
  moves: 25
};

let movesLeft = cfg.moves;

// ===== LEVELS =====
const levels = [
[
"#################",
"#P..K....I....D.#",
"#.###.#####.###.#",
"#...#.....#...#.#",
"#.###.###.#.###.#",
"#.....T...#.....#",
"#.###.#####.###.#",
"#..H.....N.....G#",
"#################"
],
[
"#################",
"#P..I....#...D..#",
"#.###.###.#.###..#",
"#..K....#.....#.#",
"#.#####.###.###.#",
"#.....T...#..H..#",
"#.###.#####.###.#",
"#..G.....N.....F#",
"#################"
]
];

let lvl = 0, level, player, door, ghosts = [];
let keysLeft = 0;
let gameOver = false, complete = false;
let tick = 0;

// ===== LOAD LEVEL =====
function loadLevel(i) {
  level = levels[i];
  canvas.width = level[0].length * TILE;
  canvas.height = level.length * TILE;

  ghosts = [];
  keysLeft = 0;
  movesLeft = cfg.moves;

  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      const t = level[y][x];
      if (t === "P") player = { x, y };
      if (t === "D") door = { x, y };
      if (t === "K") keysLeft++;
      if ("GHFN".includes(t)) ghosts.push({ x, y, type: t });
    }
  }
}
loadLevel(0);

// ===== INPUT =====
const keysDown = {};
window.addEventListener("keydown", e => keysDown[e.key] = true);
window.addEventListener("keyup", e => keysDown[e.key] = false);

// ===== PLAYER SPEED CONTROL =====
let lastMoveTime = 0;
function canPlayerMove() {
  const delay = [0, 300, 180, 90][cfg.playerSpeed || 2];
  return Date.now() - lastMoveTime > delay;
}

// ===== UPDATE =====
function update() {
  if (gameOver || complete) return;

  if (!canPlayerMove()) return;

  let nx = player.x;
  let ny = player.y;
  let moved = false;

  if (keysDown.w || keysDown.ArrowUp) ny--;
  else if (keysDown.s || keysDown.ArrowDown) ny++;
  else if (keysDown.a || keysDown.ArrowLeft) nx--;
  else if (keysDown.d || keysDown.ArrowRight) nx++;

  if (level[ny]?.[nx] && level[ny][nx] !== "#") {
    player.x = nx;
    player.y = ny;
    moved = true;
    lastMoveTime = Date.now();

    if (cfg.useMoves) movesLeft--;

    if (level[ny][nx] === "K") {
      keysLeft--;
      level[ny] = level[ny].substring(0, nx) + "." + level[ny].substring(nx + 1);
    }

    moveGhosts();
  }

  // ===== LEVEL COMPLETE =====
  if (player.x === door.x && player.y === door.y && keysLeft <= 0) {
    lvl++;
    if (lvl >= levels.length) complete = true;
    else loadLevel(lvl);
  }

  if (cfg.useMoves && movesLeft <= 0) gameOver = true;

  tick += 0.05;
}

// ===== GHOST SPEED (FIXED) =====
let ghostStep = 0;
function moveGhosts() {
  ghostStep++;

  const interval = cfg.ghostSpeed === 1 ? 3 :
                   cfg.ghostSpeed === 2 ? 2 : 1;

  if (ghostStep % interval !== 0) return;

  ghosts.forEach(g => {
    if (g.type === "H") { // Hunter
      g.x += Math.sign(player.x - g.x);
      g.y += Math.sign(player.y - g.y);
    } else if (g.type === "F") { // Phantom
      g.x += Math.sign(player.x - g.x);
    } else { // Drifter
      Math.random() < 0.5 ? g.x++ : g.y++;
    }

    if (g.x === player.x && g.y === player.y) gameOver = true;
  });
}

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[y].length; x++) {
      if (level[y][x] === "#") {
        ctx.fillStyle = "#1b2738";
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
  }

  // Door
  ctx.fillStyle = keysLeft <= 0 ? "#4caf50" : "#555";
  ctx.fillRect(door.x * TILE + 8, door.y * TILE + 4, 24, 32);

  // Ghosts
  ghosts.forEach(g => {
    const cx = g.x * TILE + 20;
    const cy = g.y * TILE + 20 + Math.sin(tick) * 3;
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 8, Math.PI, 0);
    ctx.lineTo(cx + 8, cy + 8);
    ctx.quadraticCurveTo(cx, cy + 14, cx - 8, cy + 8);
    ctx.fillStyle = "#fff";
    ctx.fill();
  });

  // Player
  const px = player.x * TILE + 20;
  const py = player.y * TILE + 20;
  ctx.fillStyle = "#4fc3f7";
  ctx.beginPath();
  ctx.arc(px, py - 6, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#4fc3f7";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px, py + 10);
  ctx.stroke();

  // HUD
  ctx.fillStyle = "#aaa";
  if (cfg.useMoves) ctx.fillText("Moves: " + movesLeft, 10, canvas.height - 10);

  if (gameOver) drawMsg("GAME OVER");
  if (complete) drawMsg("ALL LEVELS CLEARED!");
}

function drawMsg(t) {
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
  ctx.fillStyle = "#fff";
  ctx.fillText(t, canvas.width / 2 - 140, canvas.height / 2 + 5);
}

// ===== LOOP =====
(function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
})();
