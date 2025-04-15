class BossServ {
constructor(health, attackPatterns, name, healthchange, healthchange2, width, height, totalFrames, canvasWidth, canvasHeight) {
    this.canvaswidth = canvasWidth;
    this.canvasHeight = canvasHeight;
        this.name = name;
        this.health = health;
        this.maxHealth = health;
        this.attackPatterns = attackPatterns;
        this.positionh = canvasWidth / 2; 
        this.positionv = canvasHeight / 2; 
        this.goesright = true;
        this.goesbottom = true;
        this.attackPattern = 0;
        this.healthchange = healthchange;
        this.healthchange2 = healthchange2;
        this.rorl = Math.random();
        this.width = width / totalFrames;
        this.height = height;
        this.bullets = []; // Projectiles du boss
        this.telegraphedZones = []; // Zones télégraphiées
        this.teleportCooldown = 3000; // Temps entre chaque téléportation (en ms)
        this.lastTeleportTime = 0; // Temps du dernier téléportation

        this.dashTrail = [];


        // Variables pour le mouvement circulaire et en ∞
        this.angle = 0; // Angle pour les mouvements circulaires ou en ∞

        // Variables pour le dash
        this.dashDirection = 0; // Direction du dash (en radians)
        this.isDashing = false; // Indique si le boss est en train de dash
        this.dashSpeed = 0; // Vitesse du dash
        this.dashDuration = 0; // Durée restante du dash (en frames)

        // Variables pour les déplacements aléatoires
        this.targetX = canvasWidth / 2; 
        this.targetY = canvasHeight / 2; 
    }


    // Méthode pour choisir le pattern d'attaque en fonction de l'index
    patterns() {
        // Récupère le pattern actuel à partir de attackPatterns
        const currentPattern = this.attackPatterns[this.attackPattern];
    
        switch (currentPattern) {
            case 'boss1':
                this.Boss1P1();
                break;

            case 'boss1p2':
                this.Boss1P2();
                break;
    
            case 'boss2':
                this.Boss2P1();
                break;

            case 'boss2p2':
                this.Boss2P2();
                break;
			case 'boss3':
                this.Boss3P1();
                break;

            case 'boss3p2':
                this.Boss3P2();
                break;
			case 'boss4':
                this.Boss4P1();
                break;

            case 'boss4p2':
                this.Boss4P2();
                break;
			case 'boss4p3':
                this.Boss4P3();
                break;
    
            default:
                console.log("Pattern d'attaque inconnu. ");
        }
    
        // Conditions pour changer de pattern en fonction de la santé ou autres critères
        if (this.health <= this.healthchange && this.attackPattern === 0) {
            console.log("Changement de pattern");
            this.attackPattern = 1;  
        }
		else if (this.health <= this.healthchange2 && this.attackPattern === 1) {
            console.log("Changement de pattern");
            this.attackPattern = 2;  
        }
    }



    Boss1P1() {
    const radiusX = this.canvaswidth * 0.35;
    const radiusY = this.canvasHeight * 0.25;
    const speed = 0.006;

    this.positionh = this.canvaswidth / 2 + Math.cos(this.angle) * radiusX - this.width / 2;
    this.positionv = this.canvasHeight / 2 + Math.sin(this.angle) * radiusY - this.height / 2;


    this.angle += speed;

    if (Math.random() < 0.1) {
        this.positionh += (Math.random() - 0.5) * 10;
        this.positionv += (Math.random() - 0.5) * 10;
    }

    if (Math.random() < 0.06) {
        if (Math.random() < 0.3) {
            this.shootCrossPattern(2, 32);
        } else {
            this.shootSpiralPattern(2, 64);
        }
    }
}

Boss1P2() {
    // Même logique que Boss1P1, mais avec des paramètres différents si nécessaire
    const radiusX = this.canvaswidth * 0.4; // 40% de la largeur de l'écran
    const radiusY = this.canvasHeight * 0.3; // 30% de la hauteur de l'écran
    const speed = 0.007; // Même vitesse réduite

    // Calcul des nouvelles positions (mouvement en ellipse centrée)
    this.positionh = this.canvaswidth / 2 + Math.cos(this.angle) * radiusX - this.width / 2;
    this.positionv = this.canvasHeight / 2 + Math.sin(this.angle) * radiusY - this.height / 2;

    // Incrémenter l'angle pour la rotation
    this.angle += speed;

    // Ajouter une petite variation aléatoire
    if (Math.random() < 0.1) {
        this.positionh += (Math.random() - 0.5) * 10;
        this.positionv += (Math.random() - 0.5) * 10;
    }

    // Tirer selon une probabilité
    if (Math.random() < 0.06) {
        if (Math.random() < 0.4) {
            this.shootSpinPattern(5, 32);
        } else if (Math.random() < 0.5) {
            this.shootCrossPattern(2, 64);
        } else {
            this.shootSpiralPattern(2, 64);
        }
    }
}


     Boss2P1() {
    // Déplacement horizontal aléatoire (bascule gauche/droite)
    if (this.positionh >= this.canvaswidth - this.width) {
        this.goesright = false;
    }
    if (this.positionh <= 5) {
        this.goesright = true;
    }
    this.positionh += this.goesright ? 2 : -2;

    // Déplacement vertical aléatoire (bascule haut/bas)
    if (this.positionv >= this.canvasHeight - this.height) {
        this.goesdown = false;
    }
    if (this.positionv <= 5) {
        this.goesdown = true;
    }
    this.positionv += this.goesdown ? 2 : -2;

    // Dash aléatoire (probabilité de 2%)
    if (Math.random() < 0.02) {
        this.dashDirection = Math.random() * 2 * Math.PI;
        this.isDashing = true;
        this.dashSpeed = 8;
        this.dashDuration = 30;
    }

    // Appliquer le dash + afterimage
    if (this.isDashing) {
        this.positionh += Math.cos(this.dashDirection) * this.dashSpeed;
        this.positionv += Math.sin(this.dashDirection) * this.dashSpeed;

        // Limiter à l'écran
        this.positionh = Math.max(0, Math.min(this.canvaswidth - this.width, this.positionh));
        this.positionv = Math.max(0, Math.min(this.canvasHeight - this.height, this.positionv));

        // Ajouter un effet d'afterimage
        this.dashTrail.push({ x: this.positionh, y: this.positionv, alpha: 1 });

        // Si la traînée dépasse 10 images, on supprime la plus ancienne
        if (this.dashTrail.length > 10) this.dashTrail.shift();

        // Diminuer la durée du dash
        this.dashDuration--;
        if (this.dashDuration <= 0) {
            this.isDashing = false;
        }
    }

    // Gestion des afterimages : on applique une réduction alpha au fur et à mesure
    for (let i = 0; i < this.dashTrail.length; i++) {
        // Appliquer une réduction progressive de l'alpha pour créer un effet de fondu
        const t = this.dashTrail[i];
        this.dashTrail[i].alpha = Math.max(0, t.alpha - (i / this.dashTrail.length) * 0.1);
    }

    // Patterns de tir (probabilité de 8.5%)
    if (Math.random() < 0.065) {
        if (Math.random() < 0.4) {
            this.shootSpinPattern(5, 32);
        } else if (Math.random() < 0.8) {
            this.shootCrossPattern(3, 64);
        } else {
            this.shootSpiralPattern(2, 64);
        }
    }
}

Boss2P2() {
    // Déplacement horizontal aléatoire (bascule gauche/droite)
    if (this.positionh >= this.canvaswidth - this.width) {
        this.goesright = false;
    }
    if (this.positionh <= 5) {
        this.goesright = true;
    }
    this.positionh += this.goesright ? 2 : -2;

    // Déplacement vertical aléatoire (bascule haut/bas)
    if (this.positionv >= this.canvasHeight - this.height) {
        this.goesdown = false;
    }
    if (this.positionv <= 5) {
        this.goesdown = true;
    }
    this.positionv += this.goesdown ? 2 : -2;

    // Dash aléatoire (probabilité de 2%)
    if (Math.random() < 0.02) {
        this.dashDirection = Math.random() * 2 * Math.PI;
        this.isDashing = true;
        this.dashSpeed = 8;
        this.dashDuration = 30;
    }

    // Appliquer le dash + afterimage
    if (this.isDashing) {
        this.positionh += Math.cos(this.dashDirection) * this.dashSpeed;
        this.positionv += Math.sin(this.dashDirection) * this.dashSpeed;

        // Limiter à l'écran
        this.positionh = Math.max(0, Math.min(this.canvaswidth - this.width, this.positionh));
        this.positionv = Math.max(0, Math.min(this.canvasHeight - this.height, this.positionv));

        // Ajouter un effet d'afterimage
        this.dashTrail.push({ x: this.positionh, y: this.positionv, alpha: 1 });

        // Si la traînée dépasse 10 images, on supprime la plus ancienne
        if (this.dashTrail.length > 10) this.dashTrail.shift();

        // Diminuer la durée du dash
        this.dashDuration--;
        if (this.dashDuration <= 0) {
            this.isDashing = false;
        }
    }

    // Gestion des afterimages : on applique une réduction alpha au fur et à mesure
    for (let i = 0; i < this.dashTrail.length; i++) {
        // Appliquer une réduction progressive de l'alpha pour créer un effet de fondu
        const t = this.dashTrail[i];
        this.dashTrail[i].alpha = Math.max(0, t.alpha - (i / this.dashTrail.length) * 0.1);
    }

    // Patterns de tir (probabilité de 8.5%)
    if (Math.random() < 0.065) {
        if (Math.random() < 0.2) {
            this.shootRainPattern(5, 32);
        } else if (Math.random() < 0.6) {
            this.shootCrossPattern(3, 64);
        } else {
            this.shootSpiralPattern(3, 64);
        }
    }
}










	Boss3P1() {
        this.positionv = this.canvasHeight * 0.2 - this.height / 2;

        if (this.positionh >= 1000) {
            this.goesright = false;
        }
        if (this.positionh <= 5) {
            this.goesright = true;
        }
    
        if (this.goesright) {
            this.positionh += 2;
        } else {
            this.positionh -= 2;
        }
    
        // Tirer selon une probabilité (croix ou spirale)
        if (Math.random() < 0.065) {
            if (Math.random() < 0.3) {
                this.shootExplodePattern(5, 32);
            } else if (Math.random() < 0.6){
                this.shootCrossPattern(3, 64);
            } else {
                this.shootSpiralPattern(3, 64);
            }
              
        }
    }
    
    Boss3P2() {
        // Déplacement horizontal aléatoire
        if (this.rorl < 0.5) {
            if (this.positionh >= 5) {
                this.positionh -= 2;
            }
        } else {
            if (this.positionh <= 1050) {
                this.positionh += 2;
            }
        }
    
        // Déplacement vertical
        if (this.goesbottom) {
            this.positionv += 2;
            if (this.positionv >= 550) {
                this.goesbottom = false;
            }
        } else {
            this.positionv -= 2;
            if (this.positionv <= 10) {
                this.goesbottom = true;
            }
        }
    
        // Tirer selon une probabilité (spirale ou boucle)
        if (Math.random() < 0.07) {
            if (Math.random() < 0.1) {
                this.shootRainPattern(5, 32);
            } else if (Math.random() < 0.2){
                this.shootExplodePattern(4, 64);
            } else if (Math.random() < 0.5){
                this.shootCrossPattern(3, 64);
            }
			else {
                this.shootSpiralPattern(2, 50);
            }
              
        }
    }


Boss4P1() {
    // Le boss reste immobile jusqu'à ce qu'il téléporte
    // On ne redéfinit pas sa position ici, il doit garder la position où il a été téléporté.

    // Télégraphier une nouvelle zone à intervalles réguliers
    this.telegraphZone();

    // Effectuer la téléportation et tirer après une courte attente
    this.teleportAndShoot();

    // Tirer selon une probabilité (croix, spirale, etc.)
    if (Math.random() < 0.08) {
        if (Math.random() < 0.3) {
            this.shootSpinPattern(5, 32);
        } else if (Math.random() < 0.5) {
            this.shootLinePattern(4, 64);
        } else {
            this.shootCrossPattern(3, 50);
        }
    }
}

Boss4P2() {
    // Le boss reste immobile jusqu'à ce qu'il téléporte
    // On ne redéfinit pas sa position ici, il doit garder la position où il a été téléporté.

    // Télégraphier une nouvelle zone à intervalles réguliers
    this.telegraphZone();

    // Effectuer la téléportation et tirer après une courte attente
    this.teleportAndShoot();

    // Tirer selon une probabilité (croix, pluie, explosion, etc.)
    if (Math.random() < 0.065) {
        if (Math.random() < 0.1) {
            this.shootLinePattern(5, 32);
        } else if (Math.random() < 0.2) {
            this.shootRainPattern(4, 64);
        } else if (Math.random() < 0.5) {
            this.shootExplodePattern(4, 64);
        } else {
            this.shootCrossPattern(3, 50);
        }
    }
}





    
	Boss4P3() {
    const targetX = this.canvaswidth / 2 - this.width / 2;
    const targetY = this.canvasHeight / 2 - this.height / 2;
 
    const speed = 5;

    const dx = targetX - this.positionh;
    const dy = targetY - this.positionv;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > speed) {
        this.positionh += (dx / distance) * speed;
        this.positionv += (dy / distance) * speed;
    } else {
        this.positionh = targetX;
        this.positionv = targetY;
    }

    if (Math.random() < 0.22) {
        if (Math.random() < 0.1) {
            this.shootLinePattern(5, 32);
        } else if (Math.random() < 0.2) {
            this.shootLinePattern(4, 64);
        } else if (Math.random() < 0.5) {
            this.shootLinePattern(4, 64);
        } else {
            this.shootLinePattern(3, 50);
        }
    }
}




telegraphZone() {
    const now = Date.now();

    // Si AUCUNE zone de téléport n'existe ET cooldown OK ➜ créer une zone
    if (!this.telegraphedZones.some(z => z.isBoss4Teleport) && (now - this.lastTeleportTime >= this.teleportCooldown)) {
        const zoneWidth = 100;
        const zoneHeight = 100;
        const randomX = Math.random() * (this.canvaswidth - zoneWidth);
        const randomY = Math.random() * (this.canvasHeight - zoneHeight);

        this.telegraphedZones.push({
            x: randomX,
            y: randomY,
            width: zoneWidth,
            height: zoneHeight,
            expirationTime: now + 2000, // Zone visible pendant 2s
            isBoss4Teleport: true
        });

        console.log("Zone télégraphée créée :", randomX, randomY);
    }
}







teleportAndShoot() {
    const now = Date.now();
    if (now - this.lastTeleportTime < this.teleportCooldown) return;

    const expiredZone = this.telegraphedZones.find(z => z.isBoss4Teleport && z.expirationTime <= now);
    if (!expiredZone) return;

    // Téléportation au centre de la zone
    this.positionh = expiredZone.x + expiredZone.width / 2 - this.width / 2;
    this.positionv = expiredZone.y + expiredZone.height / 2 - this.height / 2;


    console.log("Téléportation à :", this.positionh, this.positionv);

    this.lastTeleportTime = now; // Reset cooldown

    this.telegraphedZones = this.telegraphedZones.filter(z => z !== expiredZone);

    // Tir autour
    const numProjectiles = 12;
    const bulletSpeed = 3;
    const bulletSize = 33;

    for (let i = 0; i < numProjectiles; i++) {
        const angle = (i / numProjectiles) * 2 * Math.PI;
        this.bullets.push({
            x: this.positionh,
            y: this.positionv,
            dx: Math.cos(angle) * bulletSpeed,
            dy: Math.sin(angle) * bulletSpeed,
            size: bulletSize
        });
    }
}










    // Méthodes de tir des différents patterns
    shootCrossPattern(speed, size) {
        const bulletSpeed = speed;
        const bulletSize = size;
        this.bullets.push({ x: this.positionh + this.width / 2, y: this.positionv + this.height / 2, dx: 0, dy: -bulletSpeed, size: bulletSize });
        this.bullets.push({ x: this.positionh + this.width / 2, y: this.positionv + this.height / 2, dx: 0, dy: bulletSpeed, size: bulletSize });
        this.bullets.push({ x: this.positionh + this.width / 2, y: this.positionv + this.height / 2, dx: -bulletSpeed, dy: 0, size: bulletSize });
        this.bullets.push({ x: this.positionh + this.width / 2, y: this.positionv + this.height / 2, dx: bulletSpeed, dy: 0, size: bulletSize });
    }

    shootSpiralPattern(speed, size) {
        const bulletSpeed = speed;
        const bulletSize = size;
        const angleIncrement = (2 * Math.PI) / 8;

        for (let i = 0; i < 8; i++) {
            const angle = i * angleIncrement;
            const dx = Math.cos(angle) * bulletSpeed;
            const dy = Math.sin(angle) * bulletSpeed;
            this.bullets.push({ x: this.positionh + this.width / 2, y: this.positionv + this.height / 2, dx: dx, dy: dy, size: bulletSize });
        }
    }

    shootNoosePattern(speed, size) {
        const bulletSpeed = speed;
        const bulletSize = size;
        const centerX = this.positionh + this.width / 2;
        const centerY = this.positionv + this.height / 2;

        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const radius = 50;
            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;

            this.bullets.push({
                x: centerX + offsetX,
                y: centerY + offsetY,
                dx: Math.cos(angle) * bulletSpeed,
                dy: Math.sin(angle) * bulletSpeed,
                size: bulletSize
            });
        }

        for (let i = 0; i < 3; i++) {
            this.bullets.push({
                x: centerX,
                y: centerY + 50 + i * 20,
                dx: 0,
                dy: bulletSpeed,
                size: bulletSize
            });
        }
    }

    shootSpinPattern() {
        const bulletSpeed = 2;
        const bulletSize = 16;
        const spacing = 30; // Distance entre chaque projectile dans une ligne

        if (!this.crossAngle) this.crossAngle = 0;

        const numBulletsPerLine = 6; // Longueur de chaque bras de la croix

        for (let i = 0; i < 4; i++) {
            // Angle pour chaque bras de la croix (90° entre chaque)
            const angle = this.crossAngle + (i * Math.PI / 2);

            for (let j = 1; j <= numBulletsPerLine; j++) {
                // Positionner les projectiles progressivement le long du bras
                const xOffset = Math.cos(angle) * spacing * j;
                const yOffset = Math.sin(angle) * spacing * j;

                this.bullets.push({
                    x: this.positionh + this.width / 2 + xOffset,
                    y: this.positionv + this.height / 2 + yOffset,
                    dx: Math.cos(angle) * bulletSpeed,
                    dy: Math.sin(angle) * bulletSpeed,
                    size: bulletSize
                });
            }
        }

        // Faire tourner lentement la croix
        this.crossAngle += Math.PI / 30;
    }

    shootRainPattern() {
        const telegraphDuration = 1000; // Temps avant la pluie (1 seconde)
        const numWaves = 3; // Nombre de vagues de pluie
        const minWaveInterval = 50; // Temps minimum entre vagues (ms)
        const maxWaveInterval = 300; // Temps maximum entre vagues (ms)
        const rainWidth = 200; // Largeur de la zone télégraphiée
        const rainHeight = 50; // Hauteur de la pluie
        const bulletSpeed = 6; // Vitesse de chute
        const bulletSize = 16;
        const numProjectiles = 12; // Nombre de projectiles par vague

        // Déterminer une position aléatoire pour la pluie
        const targetX = Math.random() * (this.canvaswidth - rainWidth);
        const targetY = Math.random() * (this.canvasHeight / 2);

        // Stocker la zone télégraphiée avec un délai d'expiration
        const expirationTime = Date.now() + telegraphDuration + (numWaves * (minWaveInterval + Math.random() * (maxWaveInterval - minWaveInterval)));

        this.telegraphedZones.push({ x: targetX, y: targetY, width: rainWidth, height: rainHeight, expirationTime });

        // Lancer la pluie après le délai
        setTimeout(() => {
            // Supprimer la zone télégraphiée après la pluie
            this.telegraphedZones = this.telegraphedZones.filter(zone => zone.x !== targetX);

            const launchWave = (wave = 0) => {
                if (wave >= numWaves) return; // Stopper après le bon nombre de vagues

                for (let i = 0; i < numProjectiles; i++) {
                    const offsetX = Math.random() * rainWidth; // Dispersion horizontale aléatoire
                    const angle = Math.PI / 2 + (Math.random() * 0.3 - 0.15); // Angle légèrement dévié

                    this.bullets.push({
                        x: targetX + offsetX,
                        y: targetY - 50, // Spawn légèrement au-dessus
                        dx: Math.cos(angle) * bulletSpeed,
                        dy: Math.sin(angle) * bulletSpeed,
                        size: bulletSize
                    });
                }

                // Planifier la vague suivante avec un délai aléatoire
                setTimeout(() => launchWave(wave + 1), minWaveInterval + Math.random() * (maxWaveInterval - minWaveInterval));
            };

            launchWave(); // Lancer la première vague
        }, telegraphDuration);
    }


    shootExplodePattern() {
        const bulletSize = 100; // Taille du projectile principal
        const bulletSpeed = 2; // Vitesse du projectile principal
        const explosionDelay = 2000; // Temps avant explosion (ms)
        const numFragments = 8; // Nombre de projectiles secondaires
        const fragmentSpeed = 5; // Vitesse des fragments
        const fragmentSize = 20; // Taille des fragments


        // Position de départ (centre du boss)
        const startX = this.positionh + this.width / 2;
        const startY = this.positionv + this.height / 2;

        // Déterminer un angle aléatoire pour le tir
        const angle = Math.random() * Math.PI * 2;

        // Création du projectile principal
        const explosiveBullet = {
            x: startX,
            y: startY,
            dx: Math.cos(angle) * bulletSpeed,
            dy: Math.sin(angle) * bulletSpeed,
            size: bulletSize,
            explode: false, // Indique si le projectile doit exploser
            createdAt: performance.now(), // Temps de création pour gérer le délai d'explosion
            isExplosive: true // Flag pour identifier que c'est un projectile explosif
        };

        this.bullets.push(explosiveBullet);
    }

   shootLinePattern(ctx) {
    if (!ctx) {
        console.error("ctx is not defined");
        return;
    }

    const bulletSpeed = 5;
    const bulletSize = 16;
    const length = 600;
    const lineAngle = Math.random() * Math.PI * 2;
    const startX = Math.random() * (this.canvaswidth / 2);
    const startY = Math.random() * (this.canvasHeight / 2);

    // Ajouter la zone télégraphée sans lien avec le téléport du boss 4
    this.telegraphedZones.push({
        x: startX,
        y: startY,
        width: length,
        height: 5, // Une petite hauteur pour simuler une ligne
        angle: lineAngle, // L'angle de la ligne
        expirationTime: Date.now() + 700, // Moment où la zone doit disparaître
        isBoss4Teleport: false // Marque cette zone comme non liée au téléport du Boss 4
    });
    // Attendre un peu avant de tirer les projectiles
    setTimeout(() => {
        for (let i = 0; i < length; i += bulletSize) {
            const xOffset = Math.cos(lineAngle) * i;
            const yOffset = Math.sin(lineAngle) * i;

            this.bullets.push({
                x: startX + xOffset,
                y: startY + yOffset,
                dx: Math.cos(lineAngle) * bulletSpeed,
                dy: Math.sin(lineAngle) * bulletSpeed,
                size: bulletSize
            });
        }
    }, 500);
}



    updateBullets() {
    const currentTime = performance.now();
    const numFragments = 8; // Nombre de projectiles secondaires
    const fragmentSpeed = 5; // Vitesse des fragments
    const fragmentSize = 20; // Taille des fragments

    // On parcourt les projectiles
    for (let i = this.bullets.length - 1; i >= 0; i--) {
        const bullet = this.bullets[i];

        // Si ce n'est pas un projectile explosif, on le gère normalement
        if (!bullet.isExplosive) {
            // Déplacement des projectiles normaux
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;
            continue;
        }

        // Gestion du projectile explosif
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        // Détection des bords de l'écran
        if (bullet.x < 0 || bullet.x > this.canvaswidth || bullet.y < 0 || bullet.y > this.canvasHeight) {
            bullet.explode = true; // Explosion si le projectile sort de l'écran
        }

        // Vérification du délai d'explosion pour les projectiles explosifs
        if (!bullet.explode && currentTime - bullet.createdAt >= 2000) {
            bullet.explode = true; // Explosion après 2 secondes
        }

        // Gérer l'explosion
        if (bullet.explode) {
            // Retirer le projectile explosif
            this.bullets.splice(i, 1);

            // Générer des fragments (projectiles secondaires)
            for (let j = 0; j < numFragments; j++) {
                const fragmentAngle = (j / numFragments) * Math.PI * 2; // Répartition des fragments en cercle

                // Ajouter les fragments à la liste des projectiles
                this.bullets.push({
                    x: bullet.x,
                    y: bullet.y,
                    dx: Math.cos(fragmentAngle) * fragmentSpeed,
                    dy: Math.sin(fragmentAngle) * fragmentSpeed,
                    size: fragmentSize,
                    isExplosive: false // Les fragments ne sont pas explosifs
                });
            }
        }
    }
}



    

    updateBossBullets(players) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.x += bullet.dx;
            bullet.y += bullet.dy;

            // Retirer les projectiles qui sortent de l'écran
            if (bullet.y > this.canvasHeight || bullet.y < 0 || bullet.x < 0 || bullet.x > this.canvasWidth) {
                this.bullets.splice(i, 1);
                continue;
            }

            // Vérifier la collision avec chaque joueur
            for (const playerId in players) {
                const player = players[playerId];
                if (
                    bullet.x > player.x - player.size / 2 &&
                    bullet.x < player.x + player.size / 2 &&
                    bullet.y > player.y - player.size / 2 &&
                    bullet.y < player.y + player.size / 2
                ) {
                    player.takeDamage(1);

                    if (player.destroyAllBullets) {
                        this.bullets = [];
                        return; // Quitte la fonction pour éviter les erreurs
                    } else {
                        this.bullets.splice(i, 1);
                    }
                    break; // Sortir de la boucle des joueurs pour éviter d'affecter plusieurs à la fois
                }
            }
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
        }
    }

}

module.exports = BossServ;
