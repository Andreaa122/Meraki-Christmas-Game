// Prevent default scrolling on mobile
document.body.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

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

// NEW WIN SCREEN ELEMENTS
const winScreen = document.getElementById('win-screen');
const winBackBtn = document.getElementById('win-back-btn');

// Game variables
let score = 0, bucketPosition = 0;
let fallingInterval, timerInterval, snowInterval;
let timeLeft = 30;
const targetScore = 1000;

// Sounds
const catchSound = new Audio('https://freesound.org/data/previews/66/66717_931655-lq.mp3');
const winSound = new Audio('https://freesound.org/data/previews/276/276032_5121236-lq.mp3');
const loseSound = new Audio('https://freesound.org/data/previews/331/331912_3248244-lq.mp3');

// Falling items
const fallingItems = [
    { img: '5.png', points: 50 },
    { img: '4.png', points: 30 },
    { img: '3.png', points: 70 }
];

// Bucket image
bucket.style.backgroundImage = "url('M (16).png')";

// ===== Splash Screen 3s =====
window.addEventListener('load', () => {
    setTimeout(() => {
        splashScreen.style.display = 'none';
        welcomeScreen.style.display = 'flex';
    }, 3000);
});

// ===== Welcome Screen =====
startBtn.addEventListener('click', () => {
    welcomeScreen.style.display = 'none';
    userFormDiv.style.display = 'flex';
});

// ===== User Form =====
userForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const mobile = document.getElementById('mobile').value;
    const email = document.getElementById('email').value;

    userFormDiv.style.display = 'none';
    gameContainer.style.display = 'flex';
    startGame();

    sendDataToSheet(name, mobile, email, "Game Started");
});

// ===== Controls =====
gameArea.addEventListener('touchmove', e => moveBucket(e.touches[0].clientX));
gameArea.addEventListener('mousemove', e => moveBucket(e.clientX));

function moveBucket(clientX) {
    const rect = gameArea.getBoundingClientRect();
    let x = clientX - rect.left - bucket.offsetWidth/2;
    if(x<0) x=0;
    if(x>rect.width - bucket.offsetWidth) x = rect.width - bucket.offsetWidth;
    bucket.style.left = x+'px';
    bucketPosition = x;
}

// ===== Back Button =====
backButton.addEventListener('click', resetToForm);
function resetToForm() {
    clearIntervals();
    stopSnow();
    bgMusic.pause();
    bgMusic.currentTime=0;

    gameContainer.style.display='none';
    userFormDiv.style.display='flex';
    resetGameVariables();
}

// ===== Page Visibility =====
document.addEventListener('visibilitychange', () => {
    if(document.hidden){
        clearIntervals();
        bgMusic.pause();
    } else {
        if(gameContainer.style.display === 'flex') startGame();
    }
});

// ===== Game Functions =====
function startGame(){
    resetGameVariables();
    bgMusic.currentTime=0; bgMusic.volume=0.5; bgMusic.play().catch(()=>{});

    fallingInterval = setInterval(createFallingItem, 800);
    timerInterval = setInterval(()=>{ 
        timeLeft--; 
        updateScoreboard(); 
        if(timeLeft<=0) endGame(false); 
    }, 1000);

    startSnow();
    updateScoreboard();
}

function resetGameVariables(){
    score=0; timeLeft=30;
    updateScoreboard();
    winMessage.innerHTML='';

    gameArea.innerHTML='<div id="snow-container"></div><div id="bucket"></div>';
    bucket = document.getElementById('bucket');
    bucket.style.backgroundImage = "url('M (16).png')";
}

function clearIntervals(){
    clearInterval(fallingInterval);
    clearInterval(timerInterval);
    document.querySelectorAll('.falling-item').forEach(i=>i.remove());
}

// ===== Scoreboard =====
function updateScoreboard(){
    scoreDisplay.innerText=`Score: ${score}`;
    targetDisplay.innerText=`Target: ${targetScore} | Time: ${timeLeft}s`;
}

// ===== Falling Items =====
function createFallingItem(){
    const itemData = fallingItems[Math.floor(Math.random()*fallingItems.length)];

    const item = document.createElement('div');
    item.classList.add('falling-item');
    item.style.left = Math.random()*(gameArea.offsetWidth-40)+'px';
    item.style.top = '-40px';
    item.style.backgroundImage = `url(${itemData.img})`;
    gameArea.appendChild(item);

    let fallSpeed = 2 + Math.random()*3;

    function fall(){
        const top = parseFloat(item.style.top);
        item.style.top = top+fallSpeed+'px';

        const itemRect = item.getBoundingClientRect();
        const bucketRect = bucket.getBoundingClientRect();

        if(itemRect.bottom>=bucketRect.top && itemRect.top<=bucketRect.bottom && itemRect.left<=bucketRect.right && itemRect.right>=bucketRect.left){
            score+=itemData.points;
            updateScoreboard();

            catchSound.currentTime=0; 
            catchSound.play();
            item.remove();

            if(score>=targetScore) endGame(true); 
            return;
        }

        if(top>gameArea.offsetHeight){
            item.remove();
            return;
        }

        requestAnimationFrame(fall);
    }
    fall();
}

// ===== Snow =====
function createSnowflake(){
    const snowContainer = document.getElementById('snow-container');
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');

    snowflake.style.left = Math.random()*(gameArea.offsetWidth-10)+'px';
    snowflake.style.width = '8px';
    snowflake.style.height = '8px';

    const duration = 5 + Math.random()*5;
    snowflake.style.animationDuration = `${duration}s`;

    snowContainer.appendChild(snowflake);
    setTimeout(()=>snowflake.remove(), duration*1000);
}
function startSnow(){ snowInterval=setInterval(createSnowflake,150); }
function stopSnow(){ clearInterval(snowInterval); }

// ===== Google Sheets API =====
function sendDataToSheet(name, phone, email, result) {
    const scriptURL = "https://script.google.com/macros/s/AKfycbzMujI4zB0yDxV5GaMbxqS-Z8rqpBj5IZ0jA9mVNZY46pEGTxI_5CFcZX08Qi2tENu2/exec";
    const formData = new FormData();

    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("result", result);
    formData.append("timestamp", new Date().toLocaleString());

    fetch(scriptURL, { method: "POST", body: formData })
        .then(() => console.log("Data sent successfully"))
        .catch(() => alert("Error saving your info. Try again."));
}

// Add Lose Screen reference
const loseScreen = document.getElementById('lose-screen'); // make sure you add this div in HTML
const loseBackBtn = document.getElementById('lose-back-btn'); // button inside lose screen

// ===== NEW END GAME FUNCTION (EDITED VERSION) =====
function endGame(win){
    clearIntervals();
    stopSnow();
    bgMusic.pause();
    bgMusic.currentTime = 0;

    const name = document.getElementById('name').value;
    const mobile = document.getElementById('mobile').value;
    const email = document.getElementById('email').value;

    sendDataToSheet(name, mobile, email, win ? "Win" : "Lose");

    gameContainer.style.display = "none";

    if(win){
        winScreen.style.display = "flex";
        winSound.play();
    } else {
        // Show Lose Screen instead of alert
        loseScreen.style.display = "flex";
        loseSound.play();
    }
}

// Back button for Lose Screen
loseBackBtn.addEventListener('click', () => {
    loseScreen.style.display = "none";
    resetToForm();
});

