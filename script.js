let dino = document.getElementById('dino');
let gameContainer = document.querySelector('.game-container');
let scoreDisplay = document.getElementById('score');
let score = 0;
let isJumping = false;
let backgroundPosition = 0;

let cacti = [];

document.addEventListener('keydown', (event) => {
  if (event.code === "Space" && !isJumping) {
    jump();
  }
});

document.addEventListener('touchstart', (event) => {
  if (!isJumping) {
    jump();
  }
});

function jump() {
  // ... (jump function remains the same)
}

function createCactus() {
  let cactus = document.createElement('div');
  cactus.classList.add('cactus');
  cactus.style.right = `-${cactus.offsetWidth}px`; // Start just outside the right edge
  gameContainer.appendChild(cactus);
  cacti.push(cactus);
}

function spawnCactiRandomly() {
  createCactus();
  let randomTime = Math.random() * 2000 + 1500;
  setTimeout(spawnCactiRandomly, randomTime);
}

spawnCactiRandomly();

let gameInterval = setInterval(() => {
  let dinoRect = dino.getBoundingClientRect();

  let adjustedDino = {
    top: dinoRect.top + 5,
    bottom: dinoRect.bottom - 5,
    left: dinoRect.left + 12,
    right: dinoRect.right - 12,
  };

  backgroundPosition -= 5;
  gameContainer.style.backgroundPosition = `${backgroundPosition}px 0`;

  for (let i = cacti.length - 1; i >= 0; i--) {
    let cactus = cacti[i];
    let cactusPosition = parseInt(window.getComputedStyle(cactus).getPropertyValue('right'));
    cactus.style.right = (cactusPosition + 5) + 'px';

    // Remove cactus when it goes off-screen
    if (cactusPosition > gameContainer.offsetWidth) {
      cactus.remove();
      cacti.splice(i, 1);
      continue;
    }

    let cactusRect = cactus.getBoundingClientRect();

    let adjustedCactus = {
      top: cactusRect.top + 5,
      bottom: cactusRect.bottom - 10,
      left: cactusRect.left + 8,
      right: cactusRect.right - 8,
    };

    if (
      adjustedDino.right > adjustedCactus.left &&
      adjustedDino.left < adjustedCactus.right &&
      adjustedDino.bottom > adjustedCactus.top &&
      adjustedDino.top < adjustedCactus.bottom
    ) {
      alert("Game Over! Final Score: " + score);
      score = 0;
      scoreDisplay.innerText = "Score: " + score;
      cacti.forEach((c) => c.remove());
      cacti = [];
      backgroundPosition = 0;
      gameContainer.style.backgroundPosition = `${backgroundPosition}px 0`;
    }
  }

  score += 1;
  scoreDisplay.innerText = "Score: " + score;
}, 20);
