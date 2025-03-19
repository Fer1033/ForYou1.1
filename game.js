let currentRoom = 0;
let rabbitsCaught = 0;
let rabbits = [];
let gameInterval;

function startGame() {
    document.getElementById('intro').classList.remove('active');
    document.getElementById('room1').classList.add('active');
    currentRoom = 1;
}

function nextRoom(roomNumber) {
    document.getElementById(`room${roomNumber}`).classList.remove('active');
    document.getElementById(`room${roomNumber + 1}`).classList.add('active');
    currentRoom = roomNumber + 1;

    if (currentRoom === 3) {
        createGayDoors();
    } else if (currentRoom === 4) {
        startMinigame();
    } else if (currentRoom === 5) {
        startLoveMinigame();
    }
}

function createGayDoors() {
    const container = document.getElementById('gay-doors');
    for (let i = 0; i < 10; i++) {
        const door = document.createElement('button');
        door.className = 'door';
        door.textContent = 'Yes';
        door.onclick = () => nextRoom(3);
        container.appendChild(door);
    }
}

function startMinigame() {
    const minigame = document.getElementById('minigame');
    const rabbitCount = document.getElementById('rabbit-count');
    
    // Create rabbits
    for (let i = 0; i < 10; i++) {
        const rabbit = document.createElement('div');
        rabbit.className = 'rabbit';
        rabbit.style.left = Math.random() * (minigame.offsetWidth - 60) + 'px';
        rabbit.style.top = Math.random() * (minigame.offsetHeight - 60) + 'px';
        rabbit.onclick = () => catchRabbit(rabbit);
        minigame.appendChild(rabbit);
        rabbits.push(rabbit);
    }

    // Start rabbit movement
    gameInterval = setInterval(moveRabbits, 1000);
}

function catchRabbit(rabbit) {
    if (rabbit.style.display !== 'none') {
        rabbit.style.display = 'none';
        rabbitsCaught++;
        document.getElementById('rabbit-count').textContent = `Rabbits caught: ${rabbitsCaught}/10`;
        
        if (rabbitsCaught === 10) {
            clearInterval(gameInterval);
            setTimeout(() => nextRoom(4), 1000);
        }
    }
}

function moveRabbits() {
    rabbits.forEach(rabbit => {
        if (rabbit.style.display !== 'none') {
            const minigame = document.getElementById('minigame');
            const newX = Math.random() * (minigame.offsetWidth - 40);
            const newY = Math.random() * (minigame.offsetHeight - 40);
            rabbit.style.left = newX + 'px';
            rabbit.style.top = newY + 'px';
        }
    });
}

function startLoveMinigame() {
    const minigame = document.getElementById('love-minigame');
    const player = document.getElementById('player');
    let score = 0;
    let timeLeft = 30;
    let gameActive = true;
    const scoreElement = document.getElementById('score');
    const timerElement = document.getElementById('timer');
    const goalScore = 200;
    let timer;
    let heartSpawner;

    // Remove any existing failure message
    const existingMessage = minigame.querySelector('.failure-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    function showFailureMessage() {
        const failureMessage = document.createElement('div');
        failureMessage.className = 'failure-message';
        failureMessage.innerHTML = `
            <h3>yo mama tehehehe u noob</h3>
            <button class="restart-button">lemme try again</button>
        `;
        minigame.appendChild(failureMessage);

        failureMessage.querySelector('.restart-button').onclick = () => {
            failureMessage.remove();
            // Clear all hearts
            const hearts = minigame.querySelectorAll('.heart, .broken-heart');
            hearts.forEach(heart => heart.remove());
            // Restart the game
            score = 0;
            timeLeft = 30;
            gameActive = true;
            scoreElement.textContent = `Score: ${score}/${goalScore}`;
            timerElement.textContent = `Time: ${timeLeft}s`;
            
            // Clear existing intervals
            if (timer) clearInterval(timer);
            if (heartSpawner) clearInterval(heartSpawner);
            
            // Start new intervals
            timer = startTimer();
            heartSpawner = startHeartSpawning();
        };
    }

    function startTimer() {
        return setInterval(() => {
            if (!gameActive) return;
            timeLeft--;
            timerElement.textContent = `Time: ${timeLeft}s`;
            
            if (timeLeft <= 0) {
                gameActive = false;
                clearInterval(timer);
                clearInterval(heartSpawner);
                showFailureMessage();
            }
        }, 1000);
    }

    function startHeartSpawning() {
        // Spawn hearts periodically
        return setInterval(spawnHeart, 1000);
    }

    // Player movement
    minigame.addEventListener('mousemove', (e) => {
        if (!gameActive) return;
        const rect = minigame.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const maxX = minigame.offsetWidth - 50;
        player.style.left = Math.min(Math.max(0, x - 25), maxX) + 'px';
    });

    // Spawn hearts
    function spawnHeart() {
        if (!gameActive) return;
        const heart = document.createElement('div');
        heart.className = Math.random() < 0.7 ? 'heart' : 'broken-heart';
        heart.style.left = Math.random() * (minigame.offsetWidth - 50) + 'px';
        heart.style.top = '-50px';
        minigame.appendChild(heart);

        const speed = 2 + Math.random() * 2;
        let position = -50;

        function moveHeart() {
            if (!gameActive) return;
            position += speed;
            heart.style.top = position + 'px';

            // Check collision with player
            const playerRect = player.getBoundingClientRect();
            const heartRect = heart.getBoundingClientRect();
            
            if (heartRect.bottom >= playerRect.top && 
                heartRect.top <= playerRect.bottom &&
                heartRect.right >= playerRect.left && 
                heartRect.left <= playerRect.right) {
                
                if (heart.classList.contains('heart')) {
                    score += 10;
                    scoreElement.textContent = `Score: ${score}/${goalScore}`;
                    if (score >= goalScore) {
                        gameActive = false;
                        clearInterval(timer);
                        clearInterval(heartSpawner);
                        setTimeout(() => nextRoom(5), 1000);
                    }
                } else {
                    score = Math.max(0, score - 20);
                    scoreElement.textContent = `Score: ${score}/${goalScore}`;
                }
                heart.remove();
            } else if (position > minigame.offsetHeight) {
                heart.remove();
            } else {
                requestAnimationFrame(moveHeart);
            }
        }

        moveHeart();
    }

    // Start the game
    timer = startTimer();
    heartSpawner = startHeartSpawning();
} 
