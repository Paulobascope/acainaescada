const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restart-btn");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScore = document.getElementById("final-score");
const scoreDisplay = document.getElementById("score");
const jumpSound = document.getElementById("jump-sound");
const gameOverSound = document.getElementById("gameover-sound");
const collectSound = document.getElementById("collect-sound");

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

const GRAVITY = 0.6;
const JUMP_POWER = 12;
const LADDER_GAP = 60;
const LADDER_WIDTH = 80;
const LADDER_HEIGHT = 10;
const LADDER_OPTIONS = [50, 135, 230];

let playerImg = new Image();
playerImg.src = "personagem.svg";

let player, ladders, offsetY, score, items, gameOver;

function resetGame() {
  player = { x: 135, y: 400, width: 32, height: 32, vy: 0, onLadder: false };
  ladders = [];
  items = [];
  offsetY = 0;
  score = 0;
  gameOver = false;
  scoreDisplay.textContent = "0";
  gameOverScreen.style.display = "none";

  for (let i = 0; i < 5; i++) {
    ladders.push({ x: 135, y: 500 - i * LADDER_GAP, width: LADDER_WIDTH });
  }

  loop();
}

function generateLadder() {
  const x = LADDER_OPTIONS[Math.floor(Math.random() * LADDER_OPTIONS.length)];
  const lastY = ladders[ladders.length - 1].y;
  const newY = lastY - LADDER_GAP;

  if (!ladders.some(l => l.y === newY && l.x === x)) {
    ladders.push({ x, y: newY, width: LADDER_WIDTH });

    if (Math.random() < 0.3) {
      items.push({ x: x + 25, y: newY - 10, width: 16, height: 16, collected: false });
    }
  }
}

function update() {
  if (gameOver) return;

  player.vy += GRAVITY;
  player.y += player.vy;
  player.onLadder = false;

  for (let ladder of ladders) {
    const onLadder =
      player.y + player.height >= ladder.y - 5 &&
      player.y + player.height <= ladder.y + 10 &&
      player.x + player.width > ladder.x &&
      player.x < ladder.x + ladder.width;

    if (onLadder && player.vy >= 0) {
      player.y = ladder.y - player.height;
      player.vy = 0;
      player.onLadder = true;

      if (!ladder.stepped) {
        score += 1;
        ladder.stepped = true;
        scoreDisplay.textContent = score;
      }
    }
  }

  for (let item of items) {
    if (
      !item.collected &&
      player.x < item.x + item.width &&
      player.x + player.width > item.x &&
      player.y < item.y + item.height &&
      player.y + player.height > item.y
    ) {
      item.collected = true;
      safePlay(collectSound);
      score += 3;
      scoreDisplay.textContent = score;
    }
  }

  if (player.y - offsetY > GAME_HEIGHT) {
    gameOver = true;
    safePlay(gameOverSound);
    gameOverScreen.style.display = "flex";
    finalScore.textContent = score;
    return;
  }

  while (ladders.length < 20) {
    generateLadder();
  }

  ladders = ladders.filter(l => l.y - offsetY < GAME_HEIGHT + 50);
  items = items.filter(i => i.y - offsetY < GAME_HEIGHT + 50);

  if (player.y < 200 + offsetY) {
    offsetY -= 2;
    if (score % 100 === 0) {
      document.body.style.background = `linear-gradient(to bottom, #${Math.floor(Math.random() * 16777215).toString(16)}, #4b0082)`;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  for (let ladder of ladders) {
    ctx.fillStyle = "#a561cc";
    ctx.fillRect(ladder.x, ladder.y - offsetY, ladder.width, LADDER_HEIGHT);
  }

  for (let item of items) {
    if (!item.collected) {
      ctx.fillStyle = "#8e24aa";
      ctx.beginPath();
      ctx.arc(item.x, item.y - offsetY, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (playerImg.complete) {
    ctx.drawImage(playerImg, player.x, player.y - offsetY, player.width, player.height);
  } else {
    ctx.fillStyle = "purple";
    ctx.fillRect(player.x, player.y - offsetY, player.width, player.height);
  }
}

function loop() {
  update();
  draw();
  if (!gameOver) requestAnimationFrame(loop);
}

// Controles do teclado
document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") player.x -= 20;
  if (e.key === "ArrowRight") player.x += 20;
  if ((e.key === "ArrowUp" || e.key === " ") && player.onLadder) {
    player.vy = -JUMP_POWER;
    player.onLadder = false;
    safePlay(jumpSound);
  }
});

// Botões
document.getElementById("btn-left").addEventListener("click", () => player.x -= 20);
document.getElementById("btn-right").addEventListener("click", () => player.x += 20);
document.getElementById("btn-jump").addEventListener("click", () => {
  if (player.onLadder) {
    player.vy = -JUMP_POWER;
    player.onLadder = false;
    safePlay(jumpSound);
  }
});

restartBtn.addEventListener("click", () => resetGame());
playerImg.onload = () => resetGame();


// 🔊 Botão de som
let soundOn = true;
const toggleSoundBtn = document.getElementById("toggle-sound");

toggleSoundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  toggleSoundBtn.textContent = soundOn ? "🔊 Som: On" : "🔇 Som: Off";
});

function safePlay(audio) {
  if (soundOn) audio.play();
}


// 🌙 Botão de tema claro/escuro
const toggleThemeBtn = document.getElementById("toggle-theme");
const gameCard = document.getElementById("game-card");

toggleThemeBtn.addEventListener("click", () => {
  gameCard.classList.toggle("dark");
  const darkMode = gameCard.classList.contains("dark");
  toggleThemeBtn.textContent = darkMode ? "☀️ Tema: Claro" : "🌙 Tema: Escuro";
});
