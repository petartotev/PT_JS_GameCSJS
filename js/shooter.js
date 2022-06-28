// ==================== Game Variables ====================

var pointsWon = 0;
var gunValue = 5;
var isGunLoaded = true;
var healthValue = 3;
var countEnemiesTotal = 12;
var isStageEnemyKilled = false;
var difficultyBySize = 100;
var difficultyByTime = 50;

// ==================== HTML Elements ====================

var textHeaderTitle = document.getElementById("textHeaderTitle");
var textHeaderInfoBox = document.getElementById("textHeaderInfoBox");
var buttonHeaderStart = document.getElementById("buttonHeaderStart");
var gun = document.getElementById("imageGun");
var health = document.getElementById("imageHealth");

var canvasShooter = document.getElementById("canvasShooter");
canvasShooter.width = 1280;
canvasShooter.height = 720;
canvasShooter.style.cursor = "crosshair";
var ctx = canvasShooter.getContext("2d");

// ==================== Main Functions ====================

async function playGameAsync() {
    resetGame();

    await playIntro321GoAsync();
    
    showNavbarDetails();

    // Loop through all the enemies:
    for (let i = 0; i < countEnemiesTotal; i++) {
        isStageEnemyKilled = false;
        textHeaderInfoBox.innerHTML = getTextTargetsRemaining(i);
        textHeaderInfoBox.style.color = countEnemiesTotal - i <= 3 ? "orange" : "white";

        await sleep((difficultyByTime * 2) + (countEnemiesTotal * 100) - (i * 50));

        var positionEnemyX = 1230 - (Math.floor(Math.random() * 1181));
        var positionEnemyY = 670 - (Math.floor(Math.random() * 621));

        // Update result if enemy is hit on click:
        canvasShooter.addEventListener("click", (event) => {
            if (((event.offsetX <= positionEnemyX + (difficultyBySize / 2)) && (event.offsetX >= positionEnemyX - (difficultyBySize / 2)))
            && ((event.offsetY <= positionEnemyY + (difficultyBySize / 2)) && (event.offsetY >= positionEnemyY - (difficultyBySize / 2)))
            && gunValue >= 0 && isGunLoaded === true) {
                isStageEnemyKilled = true;
                pointsWon += 1;
                textHeaderInfoBox.innerHTML = getTextTargetsRemaining(i - 1);

                new Audio("./sounds/player_success.wav").play();
            }
        });

        // Enemy grows on screen:
        for (let j = 0; j <= difficultyBySize; j++) {
            ctx.drawImage(imgEnemyIdle, (positionEnemyX - (j / 2)), (positionEnemyY - (j / 2)), j, j);

            await sleep(countEnemiesTotal - (i / 2));

            if (isStageEnemyKilled === true) {
                ctx.clearRect(0, 0, 1280, 720);
                break;
            }

            // If enemy grows to full size => shoots player and decreases their health:
            if (j === difficultyBySize) {
                new Audio("./sounds/gun_shoot.wav").play();

                ctx.drawImage(imgEnemyBang, (positionEnemyX - (j / 2)), (positionEnemyY - (j / 2)), j, j);
                
                await sleep(250);

                await decreaseHealthAsync();

                if (healthValue === 0) {
                    break;
                }
            }
        }

        if (healthValue === 0) {
            break;
        }
    }

    var isGameWon = healthValue === 0 ? false : true;
    await endGameAsync(isGameWon);

    buttonHeaderStart.innerHTML = "&nbsp;&nbsp;" + "<i class=\"fa-forward-step fa-solid fa-2x\"></i>" + "&nbsp;";
    buttonHeaderStart.style.display = "inline";
};

async function endGameAsync(isGameWon) {
    new Audio("./sounds/game_win_" + isGameWon ? "counter_terrorists.wav" : "terrorists.wav").play();

    await sleep(1000);

    textHeaderInfoBox.style.color = isGameWon ? "green" : "red";
    textHeaderInfoBox.innerHTML = isGameWon ? "You won!" : "Game over!";

    await sleep(2000);

    ctx.font = "100px Arial";
    ctx.fillStyle = isGameWon ? "green" : "red";
    ctx.fillText(isGameWon ? `Your points: ${pointsWon}` : "You lost! ", isGameWon ? 320 : 460, 360);

    hideNavbarDetails();
}

function resetGame() {
    resetEnvironment();
    resetGameStats();
    resetGun();
    resetHealth();
}

// ==================== Helper Functions ====================

async function playIntro321GoAsync() {
    new Audio("./sounds/game_start.wav").play();

    ctx.font = "100px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("3", 600, 360);
    await sleep(1000);
    ctx.clearRect(0, 0, 1280, 720);
    ctx.fillText("2", 600, 360);
    await sleep(1000);
    ctx.clearRect(0, 0, 1280, 720);
    ctx.fillText("1", 600, 360);
    await sleep(1000);
    ctx.clearRect(0, 0, 1280, 720);
    ctx.fillText("GO!", 540, 360);
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

    healthValue--;
    health.setAttribute("src", `./images/health_${healthValue}.png`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showNavbarDetails() {
    gun.style.display = health.style.display = "inline";
    textHeaderInfoBox.innerHTML = getTextTargetsRemaining(0);
}

function hideNavbarDetails() {
    gun.style.display = health.style.display = "none";
    textHeaderInfoBox.innerHTML = "";
}

function getTextTargetsRemaining(curr) {
    return `<strong>${("000" + (countEnemiesTotal - curr)).slice(-2)} / ${countEnemiesTotal} <img src="./images/enemy.png" width="45" height="45" /> | ${("000" + pointsWon).slice(-2)} pts</strong>`;
}

function resetEnvironment() {
    ctx.clearRect(0, 0, 1280, 720);
    textHeaderInfoBox.innerHTML = "";
    textHeaderInfoBox.style.color = "white";
}

function resetGameStats() {
    pointsWon = 0;
    isStageEnemyKilled = false;
}

function resetGun() {
    gunValue = 5;
    isGunLoaded = true;
    gun.setAttribute("src", "./images/gun_5.png");
}

function resetHealth() {
    healthValue = 3;    
    health.setAttribute("src", "./images/health_3.png");
}

// ==================== Event Listeners ====================

// Play game (on pressed 'START' button)
buttonHeaderStart.addEventListener("click", () => {
    buttonHeaderStart.style.display = textHeaderTitle.style.display = "none";
    playGameAsync();
});

// Reload gun (on pressed 'Enter' keyboard key)
document.addEventListener("keypress", (event) => {
    if (event.key === 'Enter') {
        gunValue = 5;
        isGunLoaded = true;
        gun.setAttribute("src", "./images/gun_5.png");

        new Audio("./sounds/gun_reload.wav").play();
    }
});

// Shoot (on canvas click)
canvasShooter.addEventListener("click", () => {
    if (gunValue === 0) {
        isGunLoaded = false;
        gun.setAttribute("src", "./images/gun_0.png");

        new Audio("./sounds/gun_empty.wav").play();
    } else {
        gunValue--;
        let imageGunPath = gunValue < 5 ? `./images/gun_${gunValue}.png` : "./images/gun_5.png"
        gun.setAttribute("src", imageGunPath);

        new Audio("./sounds/gun_shoot.wav").play();
    }
});

// Change cursor (on canvas hover)
canvasShooter.addEventListener("mousedown", () => canvasShooter.style.cursor = "move");

canvasShooter.addEventListener("mouseup", () => canvasShooter.style.cursor = "crosshair");