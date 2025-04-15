class Boss {
    constructor(spritesheeturl, totalFrames, health, bulletImagePath , name , scaleX , scaleY) {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.name = name ;
        this.spritesheet = new Image();
        this.spritesheet.src = spritesheeturl;
        this.maxHealth = health;
        this.currentFrame = 0;
        this.width = 0; // À calculer
        this.height = 0; // À calculer
        this.bossBulletImage = new Image();
        this.bossBulletImage.src = bulletImagePath;
		this.explosiveBulletSprite = new Image();
		this.explosiveBulletSprite.src = 'media/explosive-bullet.png';
		this.fragmentSprite = new Image();
		this.fragmentSprite.src = 'media/fragment.png';
        this.totalFrames = totalFrames;
        this.frameDelay = 5;
        this.frameCounter = 0;
        this.spritesheet.onload = () => {
            this.width = (this.spritesheet.width / totalFrames) * this.scaleX; // Calculate the width of a frame and apply scaling
            this.height = this.spritesheet.height * this.scaleY; // Calculate the height and apply scaling
        };
        // variables à mettre à jour par le serveur
        this.health = health;
        this.positionh = 0;
        this.positionv = 0;
        this.bullets = []; // Projectiles du boss
        this.telegraphedZones = [];
    }


drawTelegraphedZones(ctx) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Rouge semi-transparent pour l'avertissement

    const now = Date.now();

    // Filtrer les zones expirées en fonction de leur expirationTime
    this.telegraphedZones = this.telegraphedZones.filter(zone => zone.expirationTime > now);

    // Dessiner les zones actives restantes
    this.telegraphedZones.forEach(zone => {
        ctx.save(); // Sauvegarder l'état actuel du contexte

        ctx.translate(zone.x * this.scaleX, zone.y * this.scaleY); // Déplacer le point de départ
        
        ctx.rotate(zone.angle || 0); // Appliquer l'angle si défini, sinon 0

        // Modifier la couleur en fonction de la zone : verte pour le téléport du Boss4, rouge sinon
        if (zone.isBoss4Teleport) {
            ctx.fillStyle = "rgba(0, 255, 0, 0.5)"; // Vert semi-transparent pour le téléport du Boss4
        } else {
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Rouge pour les autres zones
        }

        ctx.fillRect(- (zone.width * this.scaleX) / 2, - (zone.height * this.scaleY) / 2, zone.width * this.scaleX,       zone.height * this.scaleY);


        ctx.restore(); // Rétablir l'état du contexte
    });
}








    drawBossBullets(ctx) {
    this.bullets.forEach(bullet => {
        let bulletImage;

        // Choisir l'image en fonction du type de projectile
        if (bullet.isExplosive) {
            bulletImage = this.explosiveBulletSprite; // Sprite pour les projectiles explosifs
        } else if (bullet.size === this.fragmentSize) {
            bulletImage = this.fragmentSprite; // Sprite pour les fragments
        } else {
            bulletImage = this.bossBulletImage; // Sprite pour les projectiles normaux
        }

        // Dessiner le projectile avec le bon sprite
        ctx.drawImage(
            bulletImage,
            (bullet.x - bullet.size / 2) * this.scaleX,
            (bullet.y - bullet.size / 2) * this.scaleY,
            bullet.size * this.scaleX,
            bullet.size * this.scaleY
        );
    });
}



    drawHealthBar() {
        const barWidth = 300 * this.scaleX;
        const barHeight = 10 * this.scaleY;
        const x = (canvas.width / 2) - (barWidth / 2);
        const y = 35 ;

        ctx.fillStyle = "white";
        ctx.font = "38px 'Vermin Vibes'";
        ctx.textAlign = "center";
        ctx.fillText(this.name, canvas.width / 2, y - 3);

        ctx.fillStyle = "gray";
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = "#FF005F";
        ctx.fillRect(x, y, (barWidth * this.health) / this.maxHealth, barHeight);


    }



    drawBoss(ctx) {
        const frameWidth = this.spritesheet.width / this.totalFrames; // Largeur d'un frame original
        ctx.drawImage(
            this.spritesheet,
            this.currentFrame * frameWidth, 0, // Position du frame dans le spritesheet
            frameWidth, this.spritesheet.height, // Taille du frame original
            (this.positionh) * this.scaleX, (this.positionv) * this.scaleY, 
            this.width, this.height // Taille affichée sur le canvas
        );
    }

    

    animate() {
        this.frameCounter++;
        if (this.frameCounter >= this.frameDelay) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            this.frameCounter = 0;
        }
    }

    // Method called when boss is defeated
    defeated() {
        togglePause() ;
        showDialog("EZ TU AS BATTU LE BOSS !");
    }

}

