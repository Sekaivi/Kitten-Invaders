const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menuModal = document.getElementById("menu-container") ;
const pauseButton = document.getElementById("pauseGame") ;
const continueButton = document.getElementById("continueDiv") ;

const dialogBox = document.getElementById('DialogBox');
const dialogText = document.getElementById("dialogText");
const upgradesBox = document.getElementById('UpgradesBox');
const upgradesText = document.getElementById("upgradesText");
const connectingBox = document.getElementById("connectingToGame");
const connectingText = document.getElementById("connectingText") ;
const createRoomButton = document.getElementById("createRoom");
const joinRoomButton = document.getElementById("joinRoom");

const joinModal = document.getElementById("joiningRoom");
const joiningText = document.getElementById("joiningText");
const roomCodeInput = document.getElementById("roomCodeInput");
const displayJoinButton = document.getElementById("displayJoinRoom");
const cancelJoin = document.getElementById("cancelJoin");

// Game over
const gameOverScreen = document.getElementById('gameOverScreen');
const playAgain = document.getElementById('playAgain');
const quit = document.getElementById('quit');

const bossThemes = {
    "boss1": new Audio('media/audio/boss_theme1.mp3'),
    "boss2": new Audio('media/audio/boss_theme2.mp3'),
    "boss3": new Audio('media/audio/boss_theme3.mp3'),
    "boss4": new Audio('media/audio/boss_theme4.mp3'),
	"menu": new Audio('media/audio/menu.mp3'),
};


// Configurer les musiques pour qu'elles bouclent
for (let theme in bossThemes) {
    bossThemes[theme].loop = true;
    bossThemes[theme].volume = 0.6; // Ajuste le volume selon besoin
}


displayJoinButton.onclick = function () {
    displayJoining("Entrez un code: ");
};
cancelJoin.onclick = function () {
    hideModals();
    displayConnecting("Bienvenue sur Kitten Invaders !");
};

let scaleX = canvas.width / 1920;  // resolution de reference 1920 * 1080
let scaleY = canvas.height / 1080;
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let upgradesTier = null;
let currentUpgrades = null;
let randBuffs;
let selectedUpgradeID;

const keys = {};
window.addEventListener("keydown", (e) => handleKeyChange(e.key, true));
window.addEventListener("keyup", (e) => handleKeyChange(e.key, false));

// à ajuster
const confirmButton = document.getElementById('confirmButton');
const upgradeButtons = document.querySelectorAll('.upgradeButton');

upgradeButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Désélectionner les autres boutons
        upgradeButtons.forEach(btn => btn.classList.remove('selected'));

        // Sélectionner l'upgrade actuelle
        button.classList.add('selected');
        selectedUpgradeID = button.id; // Garder une trace de l'upgrade choisie
        // Activer le bouton "Confirmer" si une upgrade a été choisie
        confirmButton.disabled = false;
        confirmButton.classList.add('active');
    });
});

confirmButton.onclick = function () {
    upgradeButtons.forEach(btn => btn.classList.remove('selected'));
    confirmButton.disabled = true;
    dialogBox.style.display = 'none';
    addUpgrade(currentUpgrades[selectedUpgradeID].buffs); // pour ajouter l'upgrade selectionnée
};


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scaleX = canvas.width / 1920;
    scaleY = canvas.height / 1080;
}

function displayUpgrades() {
    hideModals();
    upgradesBox.style.display = 'block';
    upgradesText.textContent = "Choisissez vos améliorations !";

    for (let i = 0; i < 3; i++) {
        upgradeButtons[i].textContent = currentUpgrades[randBuffs[i]].description;
        upgradeButtons[i].style.backgroundColor = upgradesTier;
        upgradeButtons[i].id = randBuffs[i];
    }
}

function displayDialog(text) {
    hideModals();
    dialogBox.style.display = 'flex';
    dialogText.innerHTML = text;
}

function displayConnecting(text) {
    hideModals();
    connectingText.innerHTML = text ;
    connectingBox.style.display = 'flex';
}

function displayJoining(text) {
    hideModals();
    joiningText.textContent = text;
    roomCodeInput.value = "";
    joinModal.style.display = "flex";
}

function displayGameOver() {
    console.log("game over :D");
    hideModals();
    gameOverScreen.style.display = "flex";
}

function hideModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function restartGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    for(let playerId in players){
        players[playerId] = new Player(x, y, "media/player.png", scaleX, scaleY);
    }
}

function drawRevivalCircle(x, y, progress) {
    const radius = 30; // Radius of the revival effect
    const startAngle = -Math.PI / 2; // Start at the top
    const endAngle = startAngle + (Math.PI * 2 * (progress / 100)); // Progress-based arc

    ctx.strokeStyle = "#4A6FDC"; 
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.stroke();
}

function gameLoop() {
    if (!paused) {
        // Initialiser le contexte du canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const playerId in players) {
            const player = players[playerId];
            if (player.isDead) {
                ctx.beginPath();
                ctx.arc(player.x * scaleX, player.y * scaleY, 20, 0, Math.PI * 2);
                ctx.fillStyle = "#FB478A";
                ctx.fill();
                if (revivalEffects[playerId]) {
                    const progress = revivalEffects[playerId].progress;
                    drawRevivalCircle(player.x * scaleX, player.y * scaleY, progress);
                }
                continue;
            }
            if (player.health <= 0) {
                player.isDead = true;
                if (playerId == player1Id && players[player2Id.health > 0]) {
                    displayDialog('you died TT');
                    setTimeout(() => {
                        hideModals();
                    }, 2000);
                }
            }
            player.draw(ctx);
            player.drawProjectiles(ctx);
            player.drawSpecialProjectiles(ctx);

        }
        const player = players[player1Id];
        player.drawPlayerHealth(ctx, canvas);
        player.drawChargeBar(ctx, canvas);
        // Mettre à jour et dessiner le boss 
        if (boss) {
            boss.drawHealthBar();
            boss.drawTelegraphedZones(ctx);
            boss.drawBossBullets(ctx);
            boss.drawBoss(ctx);
            boss.animate();
        }

    };

    requestAnimationFrame(gameLoop);
}


