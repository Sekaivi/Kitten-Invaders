const playButton = document.getElementById('playButton');
const startGameMenu = document.getElementById("startGameMenu") ;
let selectedOption = 0; // 0 = Play, 1 = Continue, 2 = Credits, 3 = Option, 4 = Exit
const options = document.querySelectorAll('.selectable');
const arrow = document.getElementById('arrow');
const exitButtons = document.querySelectorAll(".exit");
const play2players = document.getElementById("player2button") ;
exitButtons.forEach(button => {
    button.addEventListener("click", function() {
        if (confirm('Voulez-vous vraiment quitter le jeu?')) {
            window.close(); 
        }
    });
});

play2players.addEventListener("click", function() {
    displayConnecting("Choisir une action") ;
});


// Initialiser l'état au début
highlightOption();
updateArrow();
// Focus automatique sur le bouton au chargement
playButton.focus();

// Ajout d'interactions à la souris (optionnel)
options.forEach((option, index) => {
    option.addEventListener('click', function () {
        selectedOption = index;
        highlightOption();
        updateArrow();
    });

    option.addEventListener('mouseenter', function () {
        selectedOption = index;
        highlightOption();
        updateArrow();
    });
});

// Événement clic
playButton.addEventListener('click', function () {
    enterGame() ;
});
// Événement clavier global
document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        enterGame();
    }

    switch (e.key) {
        case 'ArrowDown':
            selectedOption = (selectedOption + 1) % options.length;
            break;
        case 'ArrowUp':
            selectedOption = (selectedOption - 1 + options.length) % options.length;
            break;
    }

    highlightOption();
    updateArrow();
});


// Fonction pour démarrer le jeu
function enterGame() {
    displayStartGame() ;
}
    
// Mettre à jour la position de la flèche
function updateArrow() {
    const selectedDiv = options[selectedOption];
    if (selectedDiv) {
        const rect = selectedDiv.getBoundingClientRect();
        // Placer la flèche à gauche de l'élément sélectionné
        arrow.style.top = selectedDiv.offsetTop + rect.height / 4 + 'px'; // Ajusté avec un multiplicateur plus grand
        arrow.style.left = selectedDiv.offsetLeft - 100 + 'px';  // Placer à gauche de l'image
        arrow.style.display = 'block';
    }
}

// Mettre en surbrillance l'option sélectionnée
function highlightOption() {
    options.forEach((option, index) => {
        if (index === selectedOption) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

function navigateTo(page) {
    console.log('Navigation vers: ' + page);
    // Décommenter pour activer la navigation réelle
    // window.location.href = page;
}

function displayMenu() {
    hideModals();
    menuModal.style.display = 'flex';
}

function displayStartGame() {
    hideModals();
    startGameMenu.style.display = 'flex';
}