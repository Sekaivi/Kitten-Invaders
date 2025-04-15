class PlayerServ {
    constructor(id , canvasWidth , canvasHeight) {
        this.canvaswidth = canvasWidth ;
        this.canvasHeight = canvasHeight ;
        this.id = id ;
        this.keys = {} ;
        this.x = this.canvaswidth / 2;
        this.y = this.canvasHeight / 2;
        this.speed = 6;
        this.size = 32;
        this.projectiles = [];
        this.atk = 10;
        this.atkSpeed = 10; // Nombre de tirs par seconde
        this.thirdHitBonus = 1;
        this.dmgMultiplyer = 1;
        this.angle = 0;
        this.maxHp = 15;
        this.health = 15;
        this.isDead = false ;
        this.invulnerable = false;
        this.specialInvulnerability = false ;
        // Gestion de la surcharge du tir
        this.fireRate = 1000 / this.atkSpeed;
        this.lastShot = 0;
        this.shotCount = 0; // Compteur de tirs
        this.shootDuration = 0; // Temps total de tir en continu
        this.overheatLimit = 5000; // 5 secondes max de tir
        this.cooldownTime = 2000; // 2 secondes de cooldown
        this.isOverheated = false;
        this.overheatTime = 0;
        this.overheatMessage = '';  // Message affiché pendant la surcharge ou cooldown
        this.messageTime = 2000;

        // Capacité spéciale
        this.specialCharge = 0;
        this.specialMaxCharge = 30;
        this.isSpecialActive = false;
        this.specialProjectiles = [];
        this.specialDmg = 3;
        this.specialAtkSpeed = 50;
        this.specialFireRate = 1000 / this.specialAtkSpeed;
        this.lastSpecialShot = 0;
        this.specialMaxProjectiles = 100; // Maximum de projectiles pouvant être tirés
        this.specialProjectileCount = 0;
        // Upgrades possibles
        this.destroyAllBullets = false; // Détruire tous les projectiles du boss si collision
        this.FullHPDmg = 1;
        this.lowHPDmg = 1;
    }

    move() {
        if (this.keys["z"]) this.y -= this.speed;
        if (this.keys["s"]) this.y += this.speed;
        if (this.keys["q"]) this.x -= this.speed;
        if (this.keys["d"]) this.x += this.speed;

        this.x = Math.max(0, Math.min(this.canvaswidth, this.x));
        this.y = Math.max(0, Math.min(this.canvasHeight, this.y));
    }

    shoot() {
        const directions = {
            ArrowUp: { x: 0, y: -1, angle: 270 },
            ArrowDown: { x: 0, y: 1, angle: 90 },
            ArrowLeft: { x: -1, y: 0, angle: 180 },
            ArrowRight: { x: 1, y: 0, angle: 0 }
        };

        const now = Date.now();
        let direction = null;

        if (this.keys["ArrowUp"]) direction = "ArrowUp";
        if (this.keys["ArrowDown"]) direction = "ArrowDown";
        if (this.keys["ArrowLeft"]) direction = "ArrowLeft";
        if (this.keys["ArrowRight"]) direction = "ArrowRight";

        // Vérification de l'état de surchauffe et cooldown
        if (this.isOverheated) {
            // Vérifier si le cooldown est terminé
            if (now - this.overheatTime >= this.cooldownTime) {
                this.isOverheated = false;
                this.shootDuration = 0; // Réinitialiser le temps de tir
                this.messageTime = now + 2000; // Afficher "Tir prêt !" pendant 2 secondes
                this.overheatMessage = ''; // Afficher "Tir prêt !"
            } 
             else {
                return; // Ne pas tirer pendant le cooldown
            }
        }

        // Si la touche est appuyée et que le tir est possible
        if (direction && now - this.lastShot >= this.fireRate) {
            this.shotCount++; // Incrémentation du compteur de tirs
            let damage = this.atk * this.dmgMultiplyer;
            if (this.shotCount % 3 === 0) {
                damage *= this.thirdHitBonus; // Bonus tous les 3 tirs
            }

            this.projectiles.push({
                x: this.x,
                y: this.y,
                dx: directions[direction].x * 6,
                dy: directions[direction].y * 6,
                angle: directions[direction].angle,
                speed: this.atkSpeed / 5,
                size: 16,
                damage: damage
            });

            this.angle = directions[direction].angle;
            this.lastShot = now;
            this.shootDuration += this.fireRate; // Ajouter le temps de tir

            // Vérifier si on atteint la limite de surcharge
            if (this.shootDuration >= this.overheatLimit && !this.isOverheated) {
                this.isOverheated = true;
                this.overheatTime = now; // Démarrer le cooldown
                this.overheatMessage = 'Tir surchargé !'; // Afficher "Tir surchargé"
                this.messageTime = now + 2000; // Maintenir le message affiché pendant 2 secondes
            }
        }
    }

    activateSpecial() {
        if (this.keys["e"] && this.specialCharge >= this.specialMaxCharge && !this.isSpecialActive) {
            this.isSpecialActive = true;
            this.specialCharge = 0; // Réinitialiser la charge
            this.specialProjectileCount = 0; // Réinitialiser le compteur de projectiles
        }
    }

    updateSpecialProjectiles() {
        if (this.isSpecialActive) {
            if (this.specialInvulnerability) {this.invulnerable = true ; console.log('currently IMMORTAAAL')} ;
            const now = Date.now();
            if (now - this.lastSpecialShot >= this.specialFireRate && this.specialProjectileCount < this.specialMaxProjectiles) {
                // Tirer plusieurs projectiles avec un effet "shotgun"
                const numProjectiles = 3; // Nombre de projectiles par salve
                const spreadAngle = 30; // Angle de dispersion en degrés

                for (let i = 0; i < numProjectiles; i++) {
                    // Calculer un angle aléatoire dans la plage de dispersion
                    const angleOffset = (Math.random() - 0.5) * spreadAngle; // Variation aléatoire
                    const angle = this.angle + angleOffset; // Angle final du projectile

                    // Calculer une vitesse légèrement aléatoire
                    const speedVariation = Math.random() * 0.5 + 0.75; // Entre 75% et 125% de la vitesse de base
                    const speed = 2 * speedVariation;

                    // Ajouter le projectile
                    this.specialProjectiles.push({
                        x: this.x,
                        y: this.y,
                        dx: Math.cos((angle * Math.PI) / 180) * 6,
                        dy: Math.sin((angle * Math.PI) / 180) * 6,
                        angle: angle,
                        speed: speed,
                        size: 32, // Taille augmentée des projectiles spéciaux
                        damage: this.specialDmg * this.dmgMultiplyer
                    });
                }

                this.lastSpecialShot = now;
                this.specialProjectileCount += numProjectiles; // Incrémenter le compteur de projectiles
            }

            // Arrêter la capacité spéciale après le maximum de projectiles
            if (this.specialProjectileCount >= this.specialMaxProjectiles) {
                this.isSpecialActive = false; // Arrêter de générer de nouveaux projectiles
                if (this.specialInvulnerability) {this.invulnerable = false} ;
            }
        }

        // Mettre à jour la position des projectiles (même après la fin de la capacité spéciale)
        this.specialProjectiles = this.specialProjectiles.filter((p) => {
            p.x += p.dx * p.speed;
            p.y += p.dy * p.speed;

            return p.x >= 0 && p.x <= this.canvaswidth && p.y >= 0 && p.y <= this.canvasHeight;
        });
    }

    updateProjectiles() {
        this.projectiles = this.projectiles.filter((p) => {
            p.x += p.dx * p.speed;
            p.y += p.dy * p.speed;

            return p.x >= 0 && p.x <= this.canvaswidth && p.y >= 0 && p.y <= this.canvasHeight;
        });
    }

    // verifie les collisions
    checkSpecialCollisions(bossBullets) {
        this.specialProjectiles.forEach((sp) => {
            bossBullets.forEach((bb, index) => {
                if (
                    sp.x > bb.x - bb.size / 2 &&
                    sp.x < bb.x + bb.size / 2 &&
                    sp.y > bb.y - bb.size / 2 &&
                    sp.y < bb.y + bb.size / 2
                ) {
                    bossBullets.splice(index, 1); // Détruire le projectile du boss
                }
            });
        });
    }


    checkCollisions(boss) {
        this.projectiles.forEach((p) => {
            if (
                p.x > boss.positionh &&
                p.x < boss.positionh + boss.width &&
                p.y > boss.positionv &&
                p.y < boss.positionv + boss.height
            ) {
                boss.takeDamage(Math.round(p.damage)); // Infliger des dégâts au boss
                this.projectiles = this.projectiles.filter((proj) => proj !== p); // Supprimer le projectile normal

                // Augmenter la charge de la capacité spéciale (uniquement pour les projectiles normaux)
                if (!this.isSpecialActive) {
                    this.specialCharge += 1;
                    if (this.specialCharge >= this.specialMaxCharge) {
                        this.specialCharge = this.specialMaxCharge;
                    }
                }
            }
        });
    }


    checkSpecialCollisionsWithBoss(boss) {
        this.specialProjectiles.forEach((sp) => {
            if (
                sp.x > boss.positionh &&
                sp.x < boss.positionh + boss.width &&
                sp.y > boss.positionv &&
                sp.y < boss.positionv + boss.height
            ) {
                boss.takeDamage(Math.round(sp.damage));
                this.specialProjectiles = this.specialProjectiles.filter((proj) => proj !== sp); // Supprimer le projectile spécial
            }
        });
    }

    calcDmgMultiplyer() {
        this.dmgMultiplyer = 1;
        if (this.health == this.maxHp) {
            this.dmgMultiplyer *= this.FullHPDmg;
        }
        if (this.health == 1) {
            this.dmgMultiplyer *= this.lowHPDmg;
        }
    }

    revive(){
        this.isDead = false ;
        this.health = 7 ;
    }

    takeDamage(amount) {
        if (this.invulnerable) {
            console.log("Damage ignored: Cooldown active.");
            return;
        }
        this.health -= amount;
        if (this.health <= 0) {
            return
        }
        this.invulnerable = true;
        setTimeout(() => {
            this.invulnerable = false;
            console.log("Cooldown over: Player can take damage again.");
        }, 1000);
    }
}

module.exports = PlayerServ ;
