let dino = document.querySelector('.dino');
let obstacle = document.querySelector('.obstacle');
let scoreElement = document.getElementById('score');

let isJumping = false;
let isGameOver = false; // Variable to track game over state
let gravity = 0.9;
let score = 0;


// Function to start the game
function startGame() {
    // Prevent multiple starts
    if (isGameOver) {
        isGameOver = false;
        score = 0;
        scoreElement.innerText = score;
        obstacle.style.right = '-40px';
        dino.style.bottom = '0px';
    }
}

// Jumping logic when spacebar is pressed
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (isGameOver) return; // Prevent jumping if game is over

        // Start the game when space is pressed for the first time
        if (!score) {
            startGame();
        }

        if (!isJumping) {
            isJumping = true;
            let jumpHeight = 150; // Height of the jump
            let jumpInterval = setInterval(() => {
                if (jumpHeight > 0) {
                    dino.style.bottom = (parseInt(dino.style.bottom) + 10) + 'px';
                    jumpHeight -= 10;
                } else {
                    clearInterval(jumpInterval);
                    let fallInterval = setInterval(() => {
                        if (parseInt(dino.style.bottom) > 0) {
                            dino.style.bottom = (parseInt(dino.style.bottom) - 10) + 'px';
                        } else {
                            clearInterval(fallInterval);
                            isJumping = false;
                        }
                    }, 20);
                }
            }, 20);
        }
    }
});

// Obstacle movement and collision detection
let obstacleInterval = setInterval(() => {
    if (isGameOver) return; // Stop game mechanics if game is over

    let obstaclePosition = parseInt(obstacle.style.right);
    let dinoPosition = parseInt(dino.style.bottom);

    if (obstaclePosition > 600) {
        obstacle.style.right = '-40px';
        score++;
        scoreElement.innerText = score;
    } else {
        obstacle.style.right = (obstaclePosition + 5) + 'px';
    }

    // Check for collision
    if (obstaclePosition > 50 && obstaclePosition < 90 && dinoPosition <= 40) {
        endGame();
    }
}, 20);

// Function to end the game when a collision happens
function endGame() {
    isGameOver = true;
    alert('Game Over! Final Score: ' + score);
    score = 0;
    scoreElement.innerText = score;
    obstacle.style.right = '-40px'; // Reset the obstacle position
    dino.style.bottom = '0px'; // Reset the dino's position
}
