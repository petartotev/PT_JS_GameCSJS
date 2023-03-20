// ==================== Game Variables ====================

var isGameOn = false;
var countEnemiesTotal = 12;
var difficultyByTimeBetweenEnemies = 50;
var difficultyByEnemySizeFull = 100;

var playerScore = 0;
var playerHealth = 3;
var playerGun = 5;

var roundNumber = 0;
var enemyPositionX = 0;
var enemyPositionY = 0;
var isEnemyOnStageKilled = false;
var isPlayerCurrentlyShot = false;
var isPlayerGunLoaded = true;

// ==================== HTML Elements ====================

var textHeaderTitle = document.getElementById("textHeaderTitle");
var textHeaderInfoBox = document.getElementById("textHeaderInfoBox");
var buttonHeaderStart = document.getElementById("buttonHeaderStart");
var imageGun = document.getElementById("imageGun");
var imageHealth = document.getElementById("imageHealth");

var canvasShooter = document.getElementById("canvasShooter");
canvasShooter.width = 1280;
canvasShooter.height = 720;
var ctx = canvasShooter.getContext("2d");

// ==================== Main Functions ====================

async function playGameAsync() {
    resetGame();

    await playIntroAsync();

    showGameDetailsInNavbar();

    isGameOn = true;

    // Loop through all Enemies:
    for (roundNumber = 0; roundNumber < countEnemiesTotal; roundNumber++) {
        isPlayerCurrentlyShot = false;

        textHeaderInfoBox.innerHTML = getTextTargetsRemaining(roundNumber);
        textHeaderInfoBox.style.color = playerHealth <= 1 ? "red" : (countEnemiesTotal - roundNumber <= 3 ? "orange" : "white");

        await sleep((difficultyByTimeBetweenEnemies * 2) + (countEnemiesTotal * 100) - (roundNumber * 50));

        setEnemyAtRandomPositionOnCanvas();

        isEnemyOnStageKilled = false;

        // Enemy grows on screen:
        for (let enemySizeCurr = 0; enemySizeCurr <= difficultyByEnemySizeFull; enemySizeCurr++) {
            ctx.drawImage(imgEnemyIdle, (enemyPositionX - (enemySizeCurr / 2)), (enemyPositionY - (enemySizeCurr / 2)), enemySizeCurr, enemySizeCurr);

            await sleep(countEnemiesTotal - (roundNumber / 2));

            if (isEnemyOnStageKilled === true) {
                ctx.clearRect(0, 0, 1280, 720);
                break;
            }

            // If Enemy grows to its full size => shoots Player and decreases their Health:
            if (enemySizeCurr === difficultyByEnemySizeFull) {
                isPlayerCurrentlyShot = true;

                new Audio("./sounds/gun_shoot.wav").play();

                ctx.drawImage(imgEnemyBang, (enemyPositionX - (enemySizeCurr / 2)), (enemyPositionY - (enemySizeCurr / 2)), enemySizeCurr, enemySizeCurr);
                
                await sleep(250);

                await decreaseHealthAsync();

                if (playerHealth === 0) {
                    break;
                }
            }
        }

        if (playerHealth === 0) {
            break;
        }
    }

    var isGameWon = playerHealth === 0 ? false : true;
    await endGameAsync(isGameWon);

    buttonHeaderStart.innerHTML = "&nbsp;&nbsp;" + "<i class=\"fa-forward-step fa-solid fa-2x\"></i>" + "&nbsp;";
    buttonHeaderStart.style.display = "inline";
};

async function endGameAsync(isGameWon) {
    isGameOn = false;

    new Audio(isGameWon ? "./sounds/win_counter_terrorists.wav" : "./sounds/win_terrorists.wav").play();

    await sleep(1000);

    textHeaderInfoBox.style.color = isGameWon ? "green" : "red";
    textHeaderInfoBox.innerHTML = isGameWon ? "You won!" : "Game over!";

    await sleep(2500);

    ctx.font = "100px Arial";
    ctx.fillStyle = isGameWon ? "green" : "red";
    ctx.fillText(isGameWon ? `Your points: ${playerScore}/${countEnemiesTotal}` : "You lost! ", isGameWon ? 240 : 460, 375);

    await sleep(3000);

    ctx.clearRect(0, 0, 1280, 720);
    ctx.fillStyle = "black";
    ctx.fillText("One more?", 400, 375);

    resetCanvasCursor();
    hideGameDetailsInNavbar();
}

function resetGame() {
    resetEnvironment();
    resetGameStats();
    resetPlayer();
    resetEnemy();
}

// ==================== Helper Functions ====================

async function playIntroAsync() {
    new Audio("./sounds/game_start.wav").play();

    ctx.font = "100px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("3", 630, 375);
    await sleep(1000);
    ctx.clearRect(0, 0, 1280, 720);
    ctx.fillText("2", 630, 375);
    await sleep(1000);
    ctx.clearRect(0, 0, 1280, 720);
    ctx.fillText("1", 630, 375);
    await sleep(1000);
    ctx.clearRect(0, 0, 1280, 720);
    ctx.fillText("GO!", 570, 375);
    await sleep(1000);
    ctx.clearRect(0, 0, 1280, 720);
}

async function decreaseHealthAsync() {
    new Audio("./sounds/player_injury.mp3").play();

    ctx.rect(0, 0, 1280, 720);
    ctx.fillStyle = "red";
    ctx.fill();
    await sleep(350);
    ctx.clearRect(0, 0, 1280, 720);
    ctx.fillStyle = "black";

    playerHealth--;
    imageHealth.setAttribute("src", `./images/health_${playerHealth}.png`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showGameDetailsInNavbar() {
    imageGun.style.display = imageHealth.style.display = "inline";
    textHeaderInfoBox.innerHTML = getTextTargetsRemaining(0);
}

function hideGameDetailsInNavbar() {
    imageGun.style.display = imageHealth.style.display = "none";
    textHeaderInfoBox.innerHTML = "";
}

function getTextTargetsRemaining(curr) {
    return `<strong>${("000" + (countEnemiesTotal - curr)).slice(-2)} / ${countEnemiesTotal} <img src="./images/enemy.png" width="45" height="45" /> | ${("000" + playerScore).slice(-2)} pts</strong>`;
}

function resetEnvironment() {
    ctx.clearRect(0, 0, 1280, 720);
    textHeaderInfoBox.innerHTML = "";
    textHeaderInfoBox.style.color = "white";
    canvasShooter.style.cursor = "crosshair";
}

function resetGameStats() {
    playerScore = 0;
    roundNumber = 0;
}

function resetPlayer() {
    isPlayerCurrentlyShot = false;
    resetGun();
    resetHealth();
}

function resetEnemy() {
    isEnemyOnStageKilled = false;
    enemyPositionX = enemyPositionY = 0;
}

function resetGun() {
    playerGun = 5;
    isPlayerGunLoaded = true;
    imageGun.setAttribute("src", "./images/gun_5.png");
}

function resetHealth() {
    playerHealth = 3;    
    imageHealth.setAttribute("src", "./images/health_3.png");
}

function resetCanvasCursor() {
    canvasShooter.style.cursor = "default";
}

function setEnemyAtRandomPositionOnCanvas() {
    enemyPositionX = 1230 - (Math.floor(Math.random() * 1181));
    enemyPositionY = 670 - (Math.floor(Math.random() * 621));
}

// ==================== Event Listeners ====================

// Play game (on pressed 'START' button):
buttonHeaderStart.addEventListener("click", () => {
    buttonHeaderStart.style.display = textHeaderTitle.style.display = "none";
    playGameAsync();
});

// Reload gun (on pressed 'Enter' keyboard key):
document.addEventListener("keypress", (event) => {
    if (isGameOn) {
        if (event.key === 'Enter') {
            playerGun = 5;
            isPlayerGunLoaded = true;
            imageGun.setAttribute("src", "./images/gun_5.png");
    
            new Audio("./sounds/gun_reload.wav").play();
        }
    }
});

// Shoot (on canvas click):
canvasShooter.addEventListener("click", () => {
    if (isGameOn) {
        if (playerGun === 0) {
            isPlayerGunLoaded = false;
            imageGun.setAttribute("src", "./images/gun_0.png");
    
            new Audio("./sounds/gun_empty.wav").play();
        } else {
            playerGun--;
            let imageGunPath = playerGun < 5 ? `./images/gun_${playerGun}.png` : "./images/gun_5.png"
            imageGun.setAttribute("src", imageGunPath);
    
            new Audio("./sounds/gun_shoot.wav").play();
        }
    }
});

// Update result if enemy is hit on click:
canvasShooter.addEventListener("click", (event) => {
    if (isGameOn && !isEnemyOnStageKilled && !isPlayerCurrentlyShot && isPlayerGunLoaded && playerGun >= 0
        && ((event.offsetX <= enemyPositionX + (difficultyByEnemySizeFull / 2)) && (event.offsetX >= enemyPositionX - (difficultyByEnemySizeFull / 2)))
        && ((event.offsetY <= enemyPositionY + (difficultyByEnemySizeFull / 2)) && (event.offsetY >= enemyPositionY - (difficultyByEnemySizeFull / 2)))) {
        isEnemyOnStageKilled = true;
        playerScore += 1;
        textHeaderInfoBox.innerHTML = getTextTargetsRemaining(roundNumber + 1);
        new Audio("./sounds/player_success.wav").play();
    }
});

// Change cursor (on mouse down on canvas):
canvasShooter.addEventListener("mousedown", () => {
    if (isGameOn) {
        canvasShooter.style.cursor = "move";
    }
});

// Change cursor (on mouse up on canvas):
canvasShooter.addEventListener("mouseup", () => {
    if (isGameOn) {
        canvasShooter.style.cursor = "crosshair";
    }
});
