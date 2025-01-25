let dino = document.getElementById('dino');
let cactus = document.getElementById('cactus');
let scoreDisplay = document.getElementById('score');
let score = 0;
let isJumping = false;

document.addEventListener('keydown', jump);

function jump(event) {
  if (event.code === "Space" && !isJumping) {
    isJumping = true;
    let jumpHeight = 0;
    
    let jumpInterval = setInterval(() => {
      if (jumpHeight < 100) {
        jumpHeight += 5;
        dino.style.bottom = (30 + jumpHeight) + 'px';
      } else {
        clearInterval(jumpInterval);
        let fallInterval = setInterval(() => {
          if (jumpHeight > 0) {
            jumpHeight -= 5;
            dino.style.bottom = (30 + jumpHeight) + 'px';
          } else {
            clearInterval(fallInterval);
            isJumping = false;
          }
        }, 20);
      }
    }, 20);
  }
}

let cactusMoveInterval = setInterval(() => {
  let cactusPosition = parseInt(window.getComputedStyle(cactus).getPropertyValue('right'));
  if (cactusPosition >= 800) {
    cactus.style.right = '-60px';
    score += 1;
    scoreDisplay.innerText = "Score: " + score;
  } else {
    cactus.style.right = (cactusPosition + 5) + 'px';
  }

  let dinoPosition = parseInt(window.getComputedStyle(dino).getPropertyValue('bottom'));

  if (cactusPosition >= 50 && cactusPosition <= 90 && dinoPosition <= 80 && !isJumping) {
    alert("Game Over! Final Score: " + score);
    score = 0;
    scoreDisplay.innerText = "Score: " + score;
    cactus.style.right = '-60px'; 
  }
}, 20);
