class Player {
    constructor(x, y, imagePath , scaleX , scaleY) {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.size = 32;
        // Image pour le sprite
        this.image = new Image();
        this.image.src = imagePath;

        // Image du projectile normal
        this.projectileImage = new Image();
        this.projectileImage.src = "media/projectile.png";

        // Image du projectile spécial
        this.specialProjectileImage = new Image();
        this.specialProjectileImage.src = "media/SpeBullet.png";
        
        // mettre à jour par le serveur
        this.x = x;
        this.y = y;
        this.projectiles = [];
        this.angle = 0;
        this.maxHp = 5;
        this.health = 5;
        this.isDead = false ;
        this.isOverheated = false ;
        this.overheatMessage = '';  // Message affiché pendant la surcharge ou cooldown
        this.messageTime = 2000;
        // Capacité spéciale
        this.isSpecialActive = false ;
        this.specialCharge = 0;
        this.specialMaxCharge = 30;
        this.specialProjectiles = [];
    }


    drawMessages(ctx) {
        if (this.overheatMessage) {
            ctx.fillStyle = "#FB478A"; 
            ctx.font = `${20 * this.scaleY}px Pixels`;
            ctx.textAlign = "center";
            ctx.fillText(this.overheatMessage, this.x * this.scaleX, (this.y - this.size - 10) * this.scaleY);
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x * this.scaleX, this.y * this.scaleY);
        ctx.rotate((this.angle * Math.PI) / 180);

        // Scale the player image based on scaleX and scaleY
        ctx.drawImage(
            this.image,
            -(this.size * this.scaleX) / 2,
            -(this.size * this.scaleY) / 2,
            this.size * this.scaleX,
            this.size * this.scaleY
        );

        ctx.restore();

        // Dessiner les messages
        this.drawMessages(ctx);
    }

    drawProjectiles(ctx) {
        this.projectiles.forEach((p) => {
            ctx.save();
            ctx.translate(p.x * this.scaleX, p.y * this.scaleY);
            ctx.rotate((p.angle * Math.PI) / 180);

            // Scale the projectile size with scaleX and scaleY
            ctx.drawImage(
                this.projectileImage,
                -(p.size * this.scaleX) / 2,
                -(p.size * this.scaleY) / 2,
                p.size * this.scaleX,
                p.size * this.scaleY
            );

            ctx.restore();
        });
    }


    drawSpecialProjectiles(ctx) {
        this.specialProjectiles.forEach((p) => {
            ctx.save();
            ctx.translate(p.x * this.scaleX, p.y * this.scaleY);
            ctx.rotate((p.angle * Math.PI) / 180);

            // Scale the special projectile size with scaleX and scaleY
            ctx.drawImage(
                this.specialProjectileImage,
                -(p.size * this.scaleX) / 2,
                -(p.size * this.scaleY) / 2,
                p.size * this.scaleX,
                p.size * this.scaleY
            );

            ctx.restore();
        });
    }
    

    drawChargeBar(ctx, canvas) {
        const barWidth = 200 * this.scaleX; // Scale bar width
        const barHeight = 20 * this.scaleY; // Scale bar height
        const barX = (canvas.width - barWidth) / 2; // Center the bar horizontally
        const barY = canvas.height - 40 * this.scaleY; // Vertical position with scale
    
        // Draw the background of the charge bar
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(barX, barY, barWidth, barHeight);
    
        // Ensure charge width does not exceed bar width
        const chargePercentage = Math.min(this.specialCharge / this.specialMaxCharge, 1); // Clamp between 0 and 1
        const chargeWidth = chargePercentage * barWidth;
    
        // Draw the charge fill based on the charge percentage
        ctx.fillStyle = this.specialCharge >= this.specialMaxCharge ? "#4A6FDC" : "#856FDB";
        ctx.fillRect(barX, barY, chargeWidth, barHeight);
    
        // Draw the border of the charge bar
        ctx.strokeStyle = "white";
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    
        // Draw the charge bar text
        ctx.fillStyle = "white";
        ctx.font = `${24 * this.scaleY}px Pixels`; // Scale font size
        ctx.textAlign = "center";
        ctx.fillText(
            this.specialCharge >= this.specialMaxCharge ? "Capacité prête (Appuyez sur E)" : "Chargement...",
            canvas.width / 2,
            barY - 10 * this.scaleY
        );
    }
    revive(){
        this.isDead = false ;
        this.health = 3 ;
    }

    drawPlayerHealth(ctx, canvas) {
        const circleRadius = 10 * this.scaleX; // Scale circle radius
        const spacing = 5 * this.scaleX; // Scale spacing between circles
        const totalWidth = this.maxHp * (circleRadius * 2 + spacing) - spacing;
        let startX = canvas.width - totalWidth - 10 * this.scaleX; // 10px padding from the right edge, scaled
        const y = canvas.height - 20 * this.scaleY; // 20px from the bottom, scaled

        for (let i = 0; i < this.maxHp; i++) {
            ctx.beginPath();
            ctx.arc(startX + circleRadius, y, circleRadius, 0, Math.PI * 2);
        
            if (i < this.health) {
                ctx.fillStyle = '#4A6FDC'; // Filled for current HP
                ctx.fill();
            } else {
                ctx.fillStyle = '#FD8D7F'; // Fill color for lost HP
                ctx.fill();
            }
            ctx.stroke();
        
            startX += circleRadius * 2 + spacing;
        }
    }

}
