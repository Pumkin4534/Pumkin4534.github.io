let dino = document.getElementById('dino');
let gameContainer = document.querySelector('.game-container');
let scoreDisplay = document.getElementById('score');
let score = 0;
let isJumping = false;
let backgroundPosition = 0; // Initial position of the background

// Array to hold cacti
let cacti = [];

// Event listeners for jump
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

  // Dino jumps up
  let jumpUp = setInterval(() => {
    if (jumpHeight < 100) {
      jumpHeight += 5;
      dino.style.bottom = (30 + jumpHeight) + 'px';
    } else {
      clearInterval(jumpUp);

      // Dino falls down
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

// Function to create a new cactus
function createCactus() {
  let cactus = document.createElement('div');
  cactus.classList.add('cactus');
  cactus.style.right = '-60px';
  gameContainer.appendChild(cactus);
  cacti.push(cactus);

  // Remove cactus when it goes off-screen
  setTimeout(() => {
    cactus.remove();
    cacti.shift();
  }, 8000); // Ensure removal happens after it leaves the screen
}

// Random cactus spawner
function spawnCactiRandomly() {
  createCactus();
  let randomTime = Math.random() * 2000 + 1500; // Random interval between 1.5s and 3.5s
  setTimeout(spawnCactiRandomly, randomTime);
}

// Start spawning cacti
spawnCactiRandomly();

// Game loop for movement, scrolling, and collision detection
let gameInterval = setInterval(() => {
  let dinoRect = dino.getBoundingClientRect(); // Get dino dimensions

  // Refine the hitboxes for dino
  let adjustedDino = {
    top: dinoRect.top + 5,    // Shrink hitbox slightly from top
    bottom: dinoRect.bottom - 5, // Shrink hitbox slightly from bottom
    left: dinoRect.left + 12, // Shrink hitbox horizontally from left
    right: dinoRect.right - 12, // Shrink hitbox horizontally from right
  };

  // Move background at the same speed as the cacti
  backgroundPosition -= 5; // Move background left
  gameContainer.style.backgroundPosition = `${backgroundPosition}px 0`;

  // Loop through all cacti for movement and collision detection
  cacti.forEach((cactus) => {
    let cactusPosition = parseInt(window.getComputedStyle(cactus).getPropertyValue('right'));
    cactus.style.right = (cactusPosition + 5) + 'px';

    let cactusRect = cactus.getBoundingClientRect();

    // Refine the hitbox for cactus
    let adjustedCactus = {
      top: cactusRect.top + 5,
      bottom: cactusRect.bottom - 10,
      left: cactusRect.left + 8,
      right: cactusRect.right - 8,
    };

    // Collision detection with adjusted hitboxes
    if (
      adjustedDino.right > adjustedCactus.left && // Dino's right edge passes cactus's left edge
      adjustedDino.left < adjustedCactus.right && // Dino's left edge passes cactus's right edge
      adjustedDino.bottom > adjustedCactus.top && // Dino's bottom edge passes cactus's top edge
      adjustedDino.top < adjustedCactus.bottom // Dino's top edge passes cactus's bottom edge
    ) {
      alert("Game Over! Final Score: " + score);
      score = 0;
      scoreDisplay.innerText = "Score: " + score;
      cacti.forEach((c) => c.remove()); // Remove all cacti
      cacti = []; // Reset the cactus array
      backgroundPosition = 0; // Reset background position
      gameContainer.style.backgroundPosition = `${backgroundPosition}px 0`;
    }
  });

  // Increment score
  score += 1;
  scoreDisplay.innerText = "Score: " + score;
}, 20);
