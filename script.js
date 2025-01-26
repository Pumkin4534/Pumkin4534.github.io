let dino = document.getElementById('dino');
let cactus = document.getElementById('cactus');
let scoreDisplay = document.getElementById('score');
let gameContainer = document.querySelector('.game-container');
let score = 0;
let isJumping = false;
let backgroundPosition = 0; // Initial position of the background

document.addEventListener('keydown', (event) => {
  if (event.code === "Space" && !isJumping) {
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

// Game loop for movement, scrolling, and collision detection
let gameInterval = setInterval(() => {
  let cactusRect = cactus.getBoundingClientRect(); // Get cactus dimensions
  let dinoRect = dino.getBoundingClientRect(); // Get dino dimensions

  // Adjust hitboxes for dino and cactus
  let adjustedDino = {
    top: dinoRect.top + 10,    // Shrink hitbox vertically
    bottom: dinoRect.bottom - 10,
    left: dinoRect.left + 10, // Shrink hitbox horizontally
    right: dinoRect.right - 10,
  };

  let adjustedCactus = {
    top: cactusRect.top + 5,    // Shrink hitbox vertically
    bottom: cactusRect.bottom - 5,
    left: cactusRect.left + 5,  // Shrink hitbox horizontally
    right: cactusRect.right - 5,
  };

  // Debugging hitboxes (optional, remove after testing)
  console.log("Adjusted Dino:", adjustedDino, "Adjusted Cactus:", adjustedCactus);

  // Move cactus
  let cactusPosition = parseInt(window.getComputedStyle(cactus).getPropertyValue('right'));
  if (cactusPosition >= 800) {
    cactus.style.right = '-60px';
    score += 1;
    scoreDisplay.innerText = "Score: " + score;
  } else {
    cactus.style.right = (cactusPosition + 5) + 'px';
  }

  // Move background at the same speed as the cactus
  backgroundPosition -= 5; // Move background left
  gameContainer.style.backgroundPosition = `${backgroundPosition}px 0`;

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
    cactus.style.right = '-60px'; // Reset cactus position
    backgroundPosition = 0; // Reset background position
    gameContainer.style.backgroundPosition = `${backgroundPosition}px 0`;
  }
}, 20);
