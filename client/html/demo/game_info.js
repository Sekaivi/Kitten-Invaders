document.addEventListener('DOMContentLoaded', function() {
    // Animation pour les projectiles dans les illustrations pixel art
    function animatePixelArt() {
        const artElements = document.querySelectorAll('.pixel-art');
        
        artElements.forEach(element => {
            // Ajouter une classe pour l'animation
            element.classList.add('animated');
        });
    }
    
    // Animation pour les cartes d'amélioration
    function setupUpgradeCards() {
        const cards = document.querySelectorAll('.upgrade-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 10px 0 rgba(0, 0, 0, 0.3)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 5px 0 rgba(0, 0, 0, 0.3)';
            });
        });
    }
    
    // Animation pour les touches
    function setupKeyAnimation() {
        const keys = document.querySelectorAll('.key');
        
        keys.forEach(key => {
            key.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(4px)';
                this.style.boxShadow = '0 0 0 rgba(0, 0, 0, 0.3)';
            });
            
            key.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 4px 0 rgba(0, 0, 0, 0.3)';
            });
        });
    }
    
    // Gestion des onglets principaux
    function setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        const sections = document.querySelectorAll('.game-section');
        
        // Afficher seulement la première section au chargement
        sections.forEach((section, index) => {
            if (index !== 0) {
                section.style.display = 'none';
            }
        });
        
        // Activer le premier onglet
        if (tabs.length > 0) {
            tabs[0].classList.add('active-tab');
        }
        
        // Ajouter les événements de clic sur les onglets
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', function() {
                // Masquer toutes les sections
                sections.forEach(section => {
                    section.style.display = 'none';
                });
                
                // Afficher la section correspondante
                sections[index].style.display = 'block';
                
                // Mettre à jour la classe active
                tabs.forEach(t => t.classList.remove('active-tab'));
                tab.classList.add('active-tab');
                
                // Effet sonore de clic (optionnel)
                playTabSound();
            });
        });
    }
    
    // Gestion des onglets de rareté
    function setupRarityTabs() {
        const rarityTabs = document.querySelectorAll('.rarity-tab');
        const rarityContents = document.querySelectorAll('.rarity-content');
        
        rarityTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const rarity = this.getAttribute('data-rarity');
                
                // Masquer tous les contenus
                rarityContents.forEach(content => {
                    content.style.display = 'none';
                });
                
                // Afficher le contenu correspondant
                document.getElementById(rarity + '-upgrades').style.display = 'block';
                
                // Mettre à jour la classe active
                rarityTabs.forEach(t => t.classList.remove('active-rarity'));
                this.classList.add('active-rarity');
                
                // Effet sonore
                playTabSound();
            });
        });
    }
    
    // Gestion des onglets de boss
    function setupBossTabs() {
        const bossTabs = document.querySelectorAll('.boss-tab');
        const bossContents = document.querySelectorAll('.boss-content');
        
        bossTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const boss = this.getAttribute('data-boss');
                
                // Masquer tous les contenus
                bossContents.forEach(content => {
                    content.style.display = 'none';
                });
                
                // Afficher le contenu correspondant
                document.getElementById(boss + '-content').style.display = 'block';
                
                // Mettre à jour la classe active
                bossTabs.forEach(t => t.classList.remove('active-boss'));
                this.classList.add('active-boss');
                
                // Effet sonore
                playTabSound();
            });
        });
    }
    
    // Effet sonore simple pour les onglets
    function playTabSound() {
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19TAEFWRSBmbXQgEAAAAAEAAQBAHwAAQB8AAAABAAEAQ0RJUiAAAABJTkZPSUNSRAAAAAAA');
        audio.volume = 0.2;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
    
    // Ajoutez cette fonction dans votre fichier JavaScript
    function setupBossAnimations() {
        const bossImages = document.querySelectorAll('.boss-image');
        
        bossImages.forEach(image => {
            // Effet de glitch aléatoire
            setInterval(() => {
                const random = Math.random();
                if (random > 0.9) {
                    image.style.transform = `translateX(${(random * 10) - 5}px)`;
                    setTimeout(() => {
                        image.style.transform = '';
                    }, 100);
                }
            }, 2000);
            
            // Effet de pulsation
            let scale = 1;
            let growing = true;
            setInterval(() => {
                if (growing) {
                    scale += 0.005;
                    if (scale >= 1.05) growing = false;
                } else {
                    scale -= 0.005;
                    if (scale <= 0.95) growing = true;
                }
                image.style.transform = `scale(${scale}) translateY(${Math.sin(Date.now() / 500) * 5}px)`;
            }, 50);
        });
    }
    
    // Initialiser les animations et les onglets
    animatePixelArt();
    setupUpgradeCards();
    setupKeyAnimation();
    setupTabs();
    setupRarityTabs();
    setupBossTabs();
    setupBossAnimations();
}); 