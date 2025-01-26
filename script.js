let dino = document.getElementById('dino');
let cactus = document.getElementById('cactus');
let scoreDisplay = document.getElementById('score');
let score = 0;
let isJumping = false;

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

// Cactus movement and collision detection
let cactusMoveInterval = setInterval(() => {
  let cactusRect = cactus.getBoundingClientRect(); // Get cactus dimensions
  let dinoRect = dino.getBoundingClientRect(); // Get dino dimensions

  // Adjust the hitbox for dino
  let adjustedDino = {
    top: dinoRect.top + 5,    // Shrink hitbox
    bottom: dinoRect.bottom - 5,
    left: dinoRect.left + 10,
    right: dinoRect.right - 10,
  };

  // Adjust the hitbox for cactus
  let adjustedCactus = {
    top: cactusRect.top + 5,    // Shrink hitbox
    bottom: cactusRect.bottom - 5,
    left: cactusRect.left + 5,
    right: cactusRect.right - 5,
  };

  // Debugging (optional: remove after testing)
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
  }
}, 20);
