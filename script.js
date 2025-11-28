// DOM elements
const splashScreen = document.getElementById('splash-screen');
const welcomeScreen = document.getElementById('welcome-screen');
const startBtn = document.getElementById('start-btn');
const userForm = document.getElementById('playerForm');
const userFormDiv = document.getElementById('user-form');
const gameContainer = document.getElementById('game-container');
const gameArea = document.getElementById('game-area');
let bucket = document.getElementById('bucket');
const scoreDisplay = document.getElementById('score-display');
const targetDisplay = document.getElementById('target-display');
const winMessage = document.getElementById('win-message');
const bgMusic = document.getElementById('bg-music');
const backButton = document.getElementById('back-button');

let score = 0;
let bucketPosition = 0;
let fallingInterval;
let timerInterval;
let snowInterval;
let timeLeft = 30;
const targetScore = 1000;

// Sounds
const catchSound = new Audio('https://freesound.org/data/previews/66/66717_931655-lq.mp3');
const winSound = new Audio('https://freesound.org/data/previews/276/276032_5121236-lq.mp3');
const loseSound = new Audio('https://freesound.org/data/previews/331/331912_3248244-lq.mp3');

// Falling items
const fallingItems = [
    { img: '5.png', points: 10 },
    { img: '4.png', points: 30 },
    { img: '3.png', points: 40 }
];

// Editable bucket image
bucket.style.backgroundImage = "url('M (16).png')";

// ===== Splash Screen =====
window.addEventListener('load', () => {
    setTimeout(() => {
        splashScreen.style.display = 'none';
        welcomeScreen.style.display = 'block';
    }, 2000);
});

// ===== Welcome Screen =====
startBtn.addEventListener('click', () => {
    welcomeScreen.style.display = 'none';
    userFormDiv.style.display = 'block';
});

// ===== User Form =====
userForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const mobile = document.getElementById('mobile').value;
    const email = document.getElementById('email').value;
    console.log({ name, mobile, email }); // Placeholder for spreadsheet
    userFormDiv.style.display = 'none';
    gameContainer.style.display = 'block';
    startGame();
});

// ===== Controls =====
gameArea.addEventListener('touchmove', e => moveBucket(e.touches[0].clientX));
gameArea.addEventListener('mousemove', e => moveBucket(e.clientX));

function moveBucket(clientX) {
    const rect = gameArea.getBoundingClientRect();
    let x = clientX - rect.left - bucket.offsetWidth / 2;
    if (x < 0) x = 0;
    if (x > rect.width - bucket.offsetWidth) x = rect.width - bucket.offsetWidth;
    bucket.style.left = x + 'px';
    bucketPosition = x;
}

// ===== Back Button =====
backButton.addEventListener('click', resetToForm);
function resetToForm() {
    clearIntervals();
    stopSnow();
    bgMusic.pause();
    bgMusic.currentTime = 0;
    gameContainer.style.display = 'none';
    userFormDiv.style.display = 'block';
    resetGameVariables();
}

// ===== Start Game =====
function startGame() {
    resetGameVariables();
    bgMusic.currentTime = 0;
    bgMusic.volume = 0.5;
    bgMusic.play().catch(() => console.log('Autoplay blocked.'));
    fallingInterval = setInterval(createFallingItem, 800);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateScoreboard();
        if (timeLeft <= 0) endGame(false);
    }, 1000);
    startSnow();
    updateScoreboard();
}

// ===== Reset Variables =====
function resetGameVariables() {
    score = 0;
    timeLeft = 30;
    updateScoreboard();
    winMessage.innerHTML = '';
    gameArea.innerHTML = '<div id="snow-container"></div><div id="bucket"></div>';
    bucket = document.getElementById('bucket');
    bucket.style.backgroundImage = "url('M (16).png')";
}

// ===== Clear Intervals =====
function clearIntervals() {
    clearInterval(fallingInterval);
    clearInterval(timerInterval);
    document.querySelectorAll('.falling-item').forEach(item => item.remove());
}

// ===== Update Scoreboard =====
function updateScoreboard() {
    scoreDisplay.innerText = `Score: ${score}`;
    targetDisplay.innerText = `Target: ${targetScore} | Time: ${timeLeft}s`;
}

// ===== Create Falling Items =====
function createFallingItem() {
    const itemData = fallingItems[Math.floor(Math.random() * fallingItems.length)];
    const item = document.createElement('div');
    item.classList.add('falling-item');
    item.style.left = Math.random() * (gameArea.offsetWidth - 40) + 'px';
    item.style.top = '-40px';
    item.style.backgroundImage = `url(${itemData.img})`;
    gameArea.appendChild(item);
    let fallSpeed = 2 + Math.random() * 3;

    function fall() {
        const top = parseFloat(item.style.top);
        item.style.top = top + fallSpeed + 'px';
        const itemRect = item.getBoundingClientRect();
        const bucketRect = bucket.getBoundingClientRect();
        if (
            itemRect.bottom >= bucketRect.top &&
            itemRect.top <= bucketRect.bottom &&
            itemRect.left <= bucketRect.right &&
            itemRect.right >= bucketRect.left
        ) {
            score += itemData.points;
            updateScoreboard();
            bucket.style.transform = 'translateX(-50%) scale(1.2)';
            setTimeout(() => (bucket.style.transform = 'translateX(-50%) scale(1)'), 200);
            catchSound.currentTime = 0;
            catchSound.play();
            item.remove();
            if (score >= targetScore) endGame(true);
            return;
        }
        if (top > gameArea.offsetHeight) { item.remove(); return; }
        requestAnimationFrame(fall);
    }
    fall();
}

// ===== Snow Effects =====
function createSnowflake() {
    const snowContainer = document.getElementById('snow-container');
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.style.left = Math.random() * (gameArea.offsetWidth - 10) + 'px';
    const size = 5 + Math.random() * 5;
    snowflake.style.width = size + 'px';
    snowflake.style.height = size + 'px';
    const fallDuration = 5 + Math.random() * 5;
    snowflake.style.animationDuration = `${fallDuration}s, ${2 + Math.random()*2}s`;
    snowContainer.appendChild(snowflake);
    setTimeout(() => snowflake.remove(), fallDuration * 1000);
}

function startSnow() {
    snowInterval = setInterval(createSnowflake, 150);
}
function stopSnow() {
    clearInterval(snowInterval);
    document.querySelectorAll('.snowflake').forEach(f => f.remove());
}

// ===== End Game =====
function endGame(win) {
    clearIntervals();
    stopSnow();
    bgMusic.pause();
    bgMusic.currentTime = 0;

    if (win) {
        gameArea.innerHTML = `<div class="win-emoji">😊</div>`;
        winMessage.innerHTML = `
        <div class="win-message">
          🎉 YOU WIN! <br>
          Here is your offer: <b>Coupon Code: mkchristmas10</b>
        </div>`;
        winSound.play();
    } else {
        gameArea.innerHTML = `<div class="win-emoji">😔</div>`;
        winMessage.innerHTML = 'YOU LOSE 😔 Try a new time!';
        loseSound.play();

        const playAgainBtn = document.createElement('button');
        playAgainBtn.innerText = "Play Again";
        winMessage.appendChild(document.createElement('br'));
        winMessage.appendChild(playAgainBtn);

        playAgainBtn.addEventListener('click', () => {
            resetGameVariables();
            bgMusic.currentTime = 0;
            bgMusic.play().catch(() => console.log('Autoplay blocked.'));
            startGame();
        });
    }
}
