const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restart-btn");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScore = document.getElementById("final-score");
const scoreDisplay = document.getElementById("score");
const jumpSound = document.getElementById("jump-sound");
const gameOverSound = document.getElementById("gameover-sound");
const collectSound = document.getElementById("collect-sound");

const GAME_WIDTH = 350;
const GAME_HEIGHT = 540;

const GRAVITY = 0.6;
const JUMP_POWER = 12;
const LADDER_GAP = 60;
const LADDER_WIDTH = 80;
const LADDER_HEIGHT = 10;
const LADDER_OPTIONS = [50, 135, 230];

let playerImg = new Image();
playerImg.src = "personagem.svg";

// Carregando as imagens dos itens
let bananaImg = new Image();
bananaImg.src = "banana.png";
let uvaImg = new Image();
uvaImg.src = "uva.png";
let morangoImg = new Image();
morangoImg.src = "morango.png";

let player, ladders, offsetY, score, items, gameOver, darkMode;
darkMode = false;
let scale = 1;

let lastLadderPositions = [];

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
  const lastY = ladders[ladders.length - 1].y;
  const newY = lastY - LADDER_GAP;

  let x;

  const last1 = lastLadderPositions[lastLadderPositions.length - 1];
  const last2 = lastLadderPositions[lastLadderPositions.length - 2];

  if (last1 === 50 && last2 === 50) {
    x = 135;
  } else if (last1 === 230 && last2 === 230) {
    x = 135;
  } else {
    x = LADDER_OPTIONS[Math.floor(Math.random() * LADDER_OPTIONS.length)];
  }

  if (!ladders.some(l => l.y === newY && l.x === x)) {
    ladders.push({ x, y: newY, width: LADDER_WIDTH });
    lastLadderPositions.push(x);

    if (lastLadderPositions.length > 3) {
      lastLadderPositions.shift();
    }

    if (Math.random() < 0.05) {
      const itemType = Math.floor(Math.random() * 3);

      let itemImage;
      switch (itemType) {
        case 0:
          itemImage = bananaImg;
          break;
        case 1:
          itemImage = uvaImg;
          break;
        case 2:
          itemImage = morangoImg;
          break;
      }

      const itemY = newY - 20;
      items.push({ x: x + 25, y: itemY - 10, width: 16, height: 16, collected: false, image: itemImage });
    }
  }
}

function resizeCanvas() {
  const container = document.getElementById("game-card");
  const width = container.clientWidth;
  const height = width * (GAME_HEIGHT / GAME_WIDTH);
  canvas.width = width;
  canvas.height = height;
  scale = width / GAME_WIDTH;
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
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = darkMode ? "#2c2c2c" : "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let ladder of ladders) {
    ctx.fillStyle = darkMode ? "#4b0082" : "#a561cc";
    ctx.fillRect(ladder.x * scale, (ladder.y - offsetY) * scale, ladder.width * scale, LADDER_HEIGHT * scale);
  }

  for (let item of items) {
    if (!item.collected) {
      ctx.drawImage(item.image, item.x * scale, (item.y - offsetY) * scale, item.width * scale, item.height * scale);
    }
  }

  if (playerImg.complete) {
    ctx.drawImage(playerImg, player.x * scale, player.y * scale - offsetY * scale, player.width * scale, player.height * scale);
  } else {
    ctx.fillStyle = darkMode ? "#fff" : "#000";
    ctx.fillRect(player.x * scale, player.y * scale - offsetY * scale, player.width * scale, player.height * scale);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function safePlay(sound) {
  if (sound && sound.paused) {
    sound.play();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") {
    player.x -= 5;
  }
  if (e.key === "ArrowRight" || e.key === "d") {
    player.x += 5;
  }
  if (e.key === "ArrowUp" || e.key === " " || e.key === "w") {
    if (player.onLadder) {
      player.vy = -JUMP_POWER;
    }
  }
});

document.getElementById("btn-left").addEventListener("click", () => {
  player.x -= 5;
});

document.getElementById("btn-right").addEventListener("click", () => {
  player.x += 5;
});

document.getElementById("btn-jump").addEventListener("click", () => {
  if (player.onLadder) {
    player.vy = -JUMP_POWER;
  }
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
resetGame();
