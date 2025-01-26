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
  let jumpHeight = 0; // Current height of the jump

  // Jump up
  let jumpUp = setInterval(() => {
    if (jumpHeight < 100) {
      jumpHeight += 5; // Increment height
      dino.style.bottom = (30 + jumpHeight) + 'px'; // Update dino's position
    } else {
      clearInterval(jumpUp);

      // Fall down
      let fallDown = setInterval(() => {
        if (jumpHeight > 0) {
          jumpHeight -= 5; // Decrement height
          dino.style.bottom = (30 + jumpHeight) + 'px'; // Update dino's position
        } else {
          clearInterval(fallDown);
          isJumping = false; // Reset jumping state
        }
      }, 20);
    }
  }, 20);
}

// Cactus movement and collision detection
let cactusMoveInterval = setInterval(() => {
  let cactusPosition = parseInt(window.getComputedStyle(cactus).getPropertyValue('right'));
  
  // Move cactus
  if (cactusPosition >= 800) {
    cactus.style.right = '-60px';
    score += 1;
    scoreDisplay.innerText = "Score: " + score;
  } else {
    cactus.style.right = (cactusPosition + 5) + 'px';
  }

  // Dino position for collision detection
  let dinoPosition = parseInt(window.getComputedStyle(dino).getPropertyValue('bottom'));

  // Check for collision
  if (cactusPosition >= 50 && cactusPosition <= 90 && dinoPosition <= 80 && !isJumping) {
    alert("Game Over! Final Score: " + score);
    score = 0;
    scoreDisplay.innerText = "Score: " + score;
    cactus.style.right = '-60px'; // Reset cactus position
  }
}, 20);
