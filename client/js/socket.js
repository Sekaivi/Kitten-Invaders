const socket = io();

let boss;
let players = {}; // faut faire en sorte d'ajouter le joueur 2 en tant qu'objet !!!! Par contre il ne faut pas pouvoir le controler >:(
let player1Id = null;
let player2Id = null;
let gameIsRunning = false;
let paused = false;
let revivalEffects = {};
let currentTheme = null;

pauseButton.onclick = function () {
    if (gameIsRunning) {
        socket.emit("pauseGame");
    }
};

function stopMenuMusic() {
    const menuMusic = document.getElementById('menuMusic');
    if (menuMusic) {
        menuMusic.pause();  // Pause la musique
        menuMusic.currentTime = 0;  // Remet la musique au début
    }
};

continueButton.onclick = function () {
    if (!gameIsRunning) {
        socket.emit("continueGame");
    }
}

createRoomButton.onclick = function () {
    hideModals();
    socket.emit("createRoom");
};

joinRoomButton.onclick = function () {
    const roomCode = roomCodeInput.value.trim()
    if (roomCode === "") {
        alert("Veuillez entrer un code valide !");
        return;
    }
    socket.emit('joinRoom', roomCode);
};

playAgain.onclick = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('restartGame');
};

quit.onclick = function () {
    paused = true;
    socket.emit('quit');
    console.log("you disconnected");
    boss = null;
    delete players[player2Id];
    player2Id = null;
    gameIsRunning = false;
    revivalEffects = {};
    restartGame();
    displayConnecting("Bienvenue sur Kitten invaders !");
};

socket.on("pauseGame", () => {
    paused = true;
    gameIsRunning = false;
    displayMenu() ;
});

socket.on("continueGame", () => {
    paused = false;
    gameIsRunning = true;
    hideModals();
});

socket.on("connect", () => {
    player1Id = socket.id;
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    players[player1Id] = new Player(x, y, "media/player1.webp", scaleX, scaleY);
});

socket.on("waiting", (message) => { // assembler ça avec la communication suivante ?
    displayDialog(message);
});

socket.on("restartGame", () => {
    restartGame();
});

socket.on("victory", () => {
    // Stopper la musique du boss
    if (currentTheme) {
        currentTheme.pause();
        currentTheme.currentTime = 0;
        currentTheme = null;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameIsRunning = false ;
    paused = true ;
    document.getElementById("victory").style.display = 'block' ;
}) ;


socket.on('roomCreated', (roomCode) => {
    displayDialog(`Room <span style="color:#F27581;">${roomCode}</span> created successfully. Now waiting for player 2`);
});

socket.on('roomError', (errorMessage) => {
    displayJoining(errorMessage);
    // faire disparaitre le message au bout de quelques instants
});

socket.on('roomJoined', (roomName) => {
    console.log(`Successfully joined room: ${roomName}`);
});

socket.on("playerDisconnected", (playerId) => {
    delete players[playerId];
    paused = true;
    console.log("you disconnected");
    boss = null;
    player2Id = null;
    gameIsRunning = false;
    revivalEffects = {};
    restartGame();
    roomCode = socket.roomCode;
    displayConnecting(
        "Un joueur s'est deconnecté." +
        "Vous pouvez rejoindre une nouvelle room, en créer une nouvelle, ou attendre que quelqu'un vous rejoigne."
    );
    console.log(players);

});

socket.on("chooseUpgrades", (upgradesData) => {
    console.log(upgradesData);
    upgradesTier = upgradesData.tier;
    currentUpgrades = upgradesData.upgrades;
    randBuffs = upgradesData.upgradesByPlayer[player1Id];
    displayUpgrades();
});

socket.on("currentPlayers", (serverPlayers) => {
    if (Object.keys(serverPlayers).length < 2) {
    } else {
        Object.keys(serverPlayers).forEach((newPlayer) => {
            if (newPlayer != player1Id) {
                player2Id = newPlayer;
                let x = canvas.width / 2 - 200;
                let y = canvas.height / 2 - 200;
                players[player2Id] = new Player(x, y, "media/player2.webp", scaleX, scaleY);
            }
        });
    }
});

socket.on('startGame', () => {
    paused = false;
    hideModals();
	stopMenuMusic();
    if (!gameIsRunning) {
        gameLoop();
        gameIsRunning = true;
    }

});

socket.on("updateBullets", (updatedBullets) => {
    player.projectiles = updatedBullets;
});

socket.on("updateSpecial", (updatedSpecial) => {
    player.specialProjectiles = updatedSpecial;
});

socket.on("updateGame", (newGameData) => {
    // mettre à jour le boss
    const newBossData = newGameData.newBossData;
    boss.health = newBossData.health,
        boss.positionh = newBossData.positionh,
        boss.positionv = newBossData.positionv,
        boss.bullets = newBossData.bullets,
        boss.telegraphedZones = newBossData.telegraphedZones
    // mettre à jour les joueurs
    let newPlayer1Data = newGameData.newPlayerData[player1Id];
    let newPlayer2Data = newGameData.newPlayerData[player2Id];
    let player1 = players[player1Id];
    let player2 = players[player2Id];
    if (player1 && newPlayer1Data) {
        for (data in newPlayer1Data) {
            player1[data] = newPlayer1Data[data];
        }
    }
    if (player2 && newPlayer2Data) {
        for (data in newPlayer2Data) {
            player2[data] = newPlayer2Data[data];
        }
    }

});

socket.on("revivalProgress", (revivalProgress) => {
    rescuerId = revivalProgress.rescuerId;
    deadPlayerId = revivalProgress.deadPlayerId;
    progress = revivalProgress.progress;
    revivalEffects[deadPlayerId] = {
        rescuer: rescuerId,
        progress: progress
    }
    console.log(revivalEffects);
});

socket.on("playerRevived", (playerId) => {
    players[playerId].revive();
    delete revivalEffects[playerId]; // Remove revival effect when player is revived
});


socket.on("gameOver", () => {
    if (currentTheme) {
        currentTheme.pause();
        currentTheme.currentTime = 0;
    }
    displayGameOver();
    paused = true;
});

socket.on("victory", () => {
    if (currentTheme) {
        currentTheme.pause();
        currentTheme.currentTime = 0;
        paused = true;
    }

});


socket.on("loadBoss", (bossInfo) => {
    boss = new Boss(
        bossInfo.spritesheet,
        bossInfo.totalFrames,
        bossInfo.health,
        bossInfo.bulletImagePath,
        bossInfo.name,
        scaleX,
        scaleY
    );

    // Arrêter la musique précédente si elle existe
    if (currentTheme) {
        currentTheme.pause();
        currentTheme.currentTime = 0; // Revenir au début
    }

    // Choisir la musique selon le boss
    let themeKey = ""; // correspondra à boss1, boss2, etc.

    switch (boss.name) {
        case "Necromancer": // Remplace avec les vrais noms de tes boss
            themeKey = "boss1";
            break;
        case "Hell Guardian":
            themeKey = "boss2";
            break;
        case "Void Entity":
            themeKey = "boss3";
            break;
        case "Death":
            themeKey = "boss4";
            break;
        default:
            themeKey = "menu";
    }

    if (themeKey && bossThemes[themeKey]) {
        currentTheme = bossThemes[themeKey];
        currentTheme.play().catch(err => console.log("Erreur musique : ", err));
    }
});


function handleKeyChange(key, isPressed) {
    let player = players[player1Id];
    // s'il bouge
    if (["z", "s", "q", "d"].includes(key.toLowerCase())) {
        keys[key] = isPressed;
    }

    // s'il tire
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
        keys[key] = isPressed;
        console.log("shooting");
    }

    // s'il tire son SPECIAL
    if (["e"].includes(key.toLowerCase())) {
        keys[key] = isPressed;
    }

    socket.emit("updatePlayerKeys", keys);
}

function addUpgrade(upgrades) {
    socket.emit("addUpgrade", upgrades);
    displayDialog("En attente du choix du joueur 2");
}


// Charger les sons
const explosionSound = new Audio('media/audio/explode.mp3');
const slashSound = new Audio('media/audio/slash.mp3');

// Fonction pour jouer le son avec un pitch aléatoire
function playSound(soundName) {
    let sound;

    // Choisir le son en fonction du nom reçu
    if (soundName === 'explosion') {
        sound = explosionSound;
    } else if (soundName === 'slash') {
        sound = slashSound;
    }

    if (sound) {
        const randomPitch = 0.8 + Math.random() * 0.4; // Random entre 0.8 et 1.2 pour le pitch
        sound.playbackRate = randomPitch; // Applique le pitch randomisé
        sound.play().catch(e => {
            console.error(`Erreur de lecture du son ${soundName}:`, e);
        });
    }
}

// Écoute l'événement 'playSound' envoyé par le serveur
socket.on('playSound', (data) => {
    // Appelle la fonction playSound avec le type de son
    playSound(data.sound);
});

