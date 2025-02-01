let dino = document.getElementById('dino');
let gameContainer = document.querySelector('.game-container');
let scoreDisplay = document.getElementById('score');
let score = 0;
let isJumping = false;
let backgroundPosition = 0;

let cacti = [];
let lastCactusSpawnTime = 0;

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
  isJumping = true;
  let jumpHeight = 0;

  let jumpUp = setInterval(() => {
    if (jumpHeight < 100) {
      jumpHeight += 5;
      dino.style.bottom = (30 + jumpHeight) + 'px';
    } else {
      clearInterval(jumpUp);

      let fallDown = setInterval(() => {
        if (jumpHeight > 0) {
          jumpHeight -= 5;
          dino.style.bottom = (30 + jumpHeight) + 'px';
        } else {
          clearInterval(fallDown);
          isJumping = false;
        }
      }, 20);
    }
  }, 20);
}

function createCactus() {
  // Only create a new cactus if no cacti exist
  if (cacti.length === 0) {
    let cactus = document.createElement('div');
    cactus.classList.add('cactus');
    
    // Position the cactus just outside the right edge of the game container
    cactus.style.right = `-60px`;
    
    gameContainer.appendChild(cactus);
    cacti.push(cactus);
  }
}

function spawnCactiRandomly() {
  // Check current time and last spawn time
  let currentTime = Date.now();
  
  // Spawn a new cactus with a random interval between 1.5 and 3.5 seconds
  if (currentTime - lastCactusSpawnTime > (Math.random() * 2000 + 1500)) {
    createCactus();
    lastCactusSpawnTime = currentTime;
  }

  // Continue spawning
  requestAnimationFrame(spawnCactiRandomly);
}

// Start spawning cacti
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
