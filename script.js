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

  // Move cactus
  let cactusPosition = parseInt(window.getComputedStyle(cactus).getPropertyValue('right'));
  if (cactusPosition >= 800) {
    cactus.style.right = '-60px';
    score += 1;
    scoreDisplay.innerText = "Score: " + score;
  } else {
    cactus.style.right = (cactusPosition + 5) + 'px';
  }

  // Collision detection for visual touch
  if (
    dinoRect.right > cactusRect.left && // Dino's right edge passes cactus's left edge
    dinoRect.left < cactusRect.right && // Dino's left edge passes cactus's right edge
    dinoRect.bottom > cactusRect.top && // Dino's bottom edge passes cactus's top edge
    dinoRect.top < cactusRect.bottom // Dino's top edge passes cactus's bottom edge
  ) {
    alert("Game Over! Final Score: " + score);
    score = 0;
    scoreDisplay.innerText = "Score: " + score;
    cactus.style.right = '-60px'; // Reset cactus position
  }
}, 20);
