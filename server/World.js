const PlayerServ = require('./PlayerServ');
const BossServ = require('./BossServ.js')



class World {
    constructor(io) {
        // resolution de reference
        this.WIDTH = 1920;
        this.HEIGHT = 1080;
        this.io = io;
        this.players = {};
        this.revivalProgress = {};
        this.bosses = [
            {
                spritesheet: 'media/Necro.png', totalFrames: 8, width: 1960, height: 245, health: 5000, patterns: ['boss1', 'boss1p2'],
                bulletImagePath: "media/boss2_bullet.png", name: 'Necromancer', healthchange: 3000, healthchange2: 0
            },
            {
                spritesheet: 'media/Demon.png', totalFrames: 6, width: 1629, height: 278, health: 8000, patterns: ['boss2', 'boss2p2'],
                bulletImagePath: "media/boss3_bullet.png", name: 'Hell Guardian', healthchange: 4000, healthchange2: 0
            },
            {
                spritesheet: 'media/Agis.png', totalFrames: 15, width: 3360, height: 240, health: 12000, patterns: ['boss3', 'boss3p2'],
                bulletImagePath: "media/boss_bullet.png", name: 'Void Entity', healthchange: 6000, healthchange2: 0
            },
            {
                spritesheet: 'media/Death.png', totalFrames: 8, width: 2052, height: 248, health: 15000, patterns: ['boss4', 'boss4p2', 'boss4p3'],
                bulletImagePath: "media/boss4_bullet.png", name: 'Death', healthchange: 10000, healthchange2: 2000
            }
        ];
        this.playerUpgrades = { // ameliorations possible dans le jeu
            gris: [
                { description: "+10% atk, +10% atk speed", buffs: { atk: 1.1, atkSpeed: 1.1 } },
                { description: "+15% atk speed", buffs: { atkSpeed: 1.15 } },
                { description: "Tous les troisièmes coups infligent +60% dmg", buffs: { thirdHitBonus: 1.6 } },
                { description: "+33% atk quand les pv sont au max", buffs: { FullHPDmg: 1.33 } },
                { description: "+50% atk quand à 1 pv", buffs: { lowHPDmg: 1.5 } },
                { description: "Quand vous prenez des dégâts, tous les projectiles à l’écran sont détruits", buffs: { destroyAllBullets: true } },
                { description: "+33% atk spéciale dmg", buffs: { specialDmg: 1.33 } },
                { description: "+15% atk spéciale dmg et +15% atk", buffs: { atk: 1.1, specialDmg: 1.33 } },
            ],
            bleu: [
                { description: "L’attaque spéciale se charge 30% plus vite", buffs: { specialMaxCharge: 0.7 } },
                { description: "+25% atk, +25% atk speed", buffs: { atk: 1.25, atkSpeed: 1.25 } },
                { description: "+100% atk quand à 1 pv", buffs: { lowHPDmg: 2.0 } },
                { description: "+2 pv", buffs: { maxHp: 2, health: 2 } },
                { description: "-20% atk, +4 pv", buffs: { atk: 0.8, health: 4 } },
                { description: "+45% atk", buffs: { atk: 1.45 } },
                { description: "+45% atk speed", buffs: { atkSpeed: 1.45 } },
                { description: "+1 pv, +10% atk speed, +10% atk", buffs: { maxHp: 1, health: 1, atk: 1.1, atkSpeed: 1.1 } }
            ],
            or: [
                { description: "+35% atk, +35% atk speed", buffs: { atk: 1.35, atkSpeed: 1.35 } },
                { description: "+4 pv", buffs: { maxHp: 4, health: 4 } },
                { description: "+100% atk quand à 1 pv", buffs: { lowHPDmg: 2.0 } },
                { description: "+50% atk spéciale dmg", buffs: { specialDmg: 1.5 } },
                { description: "Quand vous utilisez votre attaque spéciale, vous êtes invulnérable", buffs: { specialInvulnerability: true } },
                { description: "+60% atk", buffs: { atk: 1.6 } },
                { description: "+60% atk speed", buffs: { atkSpeed: 1.6 } },
                { description: "L’attaque spéciale se charge 50% plus vite", buffs: { specialMaxCharge: 0.5 } }
            ], rouge: [
                { description: "L’attaque spéciale se charge 200% plus vite, -50% atk speed, -50% atk", buffs: { specialMaxCharge: 0.33, atkSpeed: 0.5, atk: 0.5 } },
                { description: "+80% atk, -40% atk speed", buffs: { atk: 1.8, atkSpeed: 0.6 } },
                { description: "+80% atk speed, -40% atk", buffs: { atkSpeed: 1.8, atk: 0.6 } },
                { description: "+100% atk, -2 pv", buffs: { atk: 2.0, health: -2 } },
                { description: "+5 pv, -40% dmg", buffs: { maxHp: 5, health: 5, atk: 0.6 } },
                { description: "+200% atk speed, -4 pv", buffs: { atkSpeed: 3.0, health: -4 } },
                { description: "+100% atk, -100% atk spéciale dmg", buffs: { atk: 2.0, specialDmg: 0 } },
                { description: "+100% atk spéciale dmg, +100% atk", buffs: { specialDmg: 2.0, atk: 2.0 } }
            ]
        };
        this.upgradesChosen = {};
        this.playAgain = {};
        this.boss = null;
        this.currentBossIndex = 0;
        this.canvasWidth = null;
        this.canvasHeight = null;
        this.paused = true;
    }

    addPlayer(playerId) {
        this.players[playerId] = new PlayerServ(playerId, this.WIDTH, this.HEIGHT);
    }

    removePlayer(playerId) {
        delete this.players[playerId];
    }

    updatePlayerKeys(playerId, keys) {
        let player = this.players[playerId];
        player.keys = keys;
    }

    updatePlayerUpgrades(playerId, buffs) {
        let player = this.players[playerId];
        if (this.upgradesChosen[playerId]) {
            console.log("This player already chose his upgrades");
            return;
        } else {
            for (let buff in buffs) {
                switch (typeof buffs[buff]) {
                    case 'number':
                        if (buff === "maxHp" || buff === "health") {
                            player[buff] += buffs[buff];
                            if (player.health <= 0) {
                                player.health = 1;
                            }
                        } else {
                            player[buff] *= buffs[buff];
                            console.log(buff + ' is now = ' + player[buff]);
                        }
                        break;
                    case 'boolean':
                        player[buff] = buffs[buff];
                        console.log(buff + 'is now ' + player[buff]);
                        break;
                    default:
                        console.log('erreur au niveau des upgrades');
                }
            }
            this.upgradesChosen[playerId] = true;
        }
    }

    killPlayer(playerId) {
        let player = this.players[playerId];
        if (player) {
            player.isDead = true;
            this.io.emit('playerDeath', playerId); // Notify the client
        }
    }

    loadBoss() {
        this.togglePause();
        const bossData = this.bosses[this.currentBossIndex];
        if (bossData) {
            this.boss = new BossServ(bossData.health,
                bossData.patterns, bossData.name, bossData.healthchange, bossData.healthchange2, bossData.width, bossData.height, bossData.totalFrames,
                this.WIDTH, this.HEIGHT
            );
            // le reste des infos du tableau non utilisé sur le serveur vont vers le client
            this.io.emit('loadBoss', bossData);
            this.currentBossIndex++;
        }
    }

    gameStart() {
        this.gameInterval = setInterval(() => this.updateGame(), 1000 / 60); // ajuster ici la vitesse de jeu
    }

    resetGame() {
        for (let playerId in this.players) {
            this.players[playerId] = new PlayerServ(playerId, this.WIDTH, this.HEIGHT);
        }
        this.upgradesChosen = {};
        this.boss = null;
        this.currentBossIndex = 0;
        clearInterval(this.gameInterval);
    }

    checkPlayAgain() {
        let allPlayersReady = true;
        for (let playerId in this.players) {
            if (!this.playAgain[playerId]) {
                allPlayersReady = false;
            }
        }
        return allPlayersReady;
    }

    trackGameOver() {
        let allPlayersDead = true;
        for (let playerId in this.players) {
            const player = this.players[playerId];
            if (!player.isDead) {
                allPlayersDead = false;
            }
        }
        if (allPlayersDead) {
            this.io.emit("gameOver");
            this.paused = true;
        }
        return allPlayersDead;
    }

    checkRevival(rescuer, deadPlayer) {
        const distance = Math.hypot(rescuer.x - deadPlayer.x, rescuer.y - deadPlayer.y);

        // Initialize revival progress if it doesn't exist
        if (!this.revivalProgress[deadPlayer.id]) {
            this.revivalProgress[deadPlayer.id] = {
                progress: 0,
                reviveTimer: null
            };
        }

        // If the rescuer is within range
        if (distance <= 50) {
            console.log(`Player ${rescuer.id} is reviving ${deadPlayer.id}...`);

            // Start a timer if revival has not been started
            if (!this.revivalProgress[deadPlayer.id].reviveTimer) {
                const revivalDuration = 3000; // Total revival time in milliseconds (3 seconds)
                const startTime = Date.now() - (this.revivalProgress[deadPlayer.id].progress / 100) * revivalDuration;

                this.revivalProgress[deadPlayer.id].reviveTimer = setInterval(() => {
                    const elapsedTime = Date.now() - startTime;
                    const progress = Math.min((elapsedTime / revivalDuration) * 100, 100);

                    this.revivalProgress[deadPlayer.id].progress = progress;

                    this.io.emit("revivalProgress", {
                        rescuerId: rescuer.id,
                        deadPlayerId: deadPlayer.id,
                        progress: progress
                    });

                    if (progress >= 100) {
                        clearInterval(this.revivalProgress[deadPlayer.id].reviveTimer);
                        delete this.revivalProgress[deadPlayer.id];
                        deadPlayer.revive();
                        this.io.emit("playerRevived", deadPlayer.id);
                        console.log(`Player ${deadPlayer.id} has been revived.`);
                    }
                }, 50);
            }
        } else {
            // Pause instead of resetting the progress
            if (this.revivalProgress[deadPlayer.id]?.reviveTimer) {
                clearInterval(this.revivalProgress[deadPlayer.id].reviveTimer);
                this.revivalProgress[deadPlayer.id].reviveTimer = null; // Just pause, keep progress
                console.log(`Revival paused for Player ${deadPlayer.id}.`);
            }
        }
    }



    togglePause() {
        if (this.paused) {
            this.paused = false;
        } else {
            this.paused = true;
            console.log('game is paused');
        }
    }

    updateGame() {
        if (this.paused) {
            return;
        }

        const playersDead = this.trackGameOver();
        if (playersDead) {
            return;
        }

        if (this.boss) {
            if (this.boss.health == 0) {
                if (this.currentBossIndex >= 4) {
                    this.gameInterval = clearInterval;
                    this.io.emit('victory');
                } else {
                    this.upgradesChosen = {};
                    const upgradesData = this.getUpgradesData();
                    this.io.emit('chooseUpgrades', upgradesData); // je peux egalement dire ici au joueur qu'il doit reinitialiser le canvas
                    this.togglePause();
                }
                return;
            }
            // le boss
            this.boss.patterns();
            this.boss.updateBossBullets(this.players);
            this.boss.updateBullets();

            const alivePlayers = Object.values(this.players).filter(p => !p.isDead);
            const deadPlayers = Object.values(this.players).filter(p => p.isDead);
            if (deadPlayers.length > 0 && alivePlayers.length > 0) {
                for (let dead of deadPlayers) {
                    for (let alive of alivePlayers) {
                        this.checkRevival(alive, dead);
                    }
                }
            }
            // concernant les joueurs
            const newPlayerData = {};
            for (let playerId in this.players) {
                // faire un truc si les DEUX JOUEURS sont morts
                const player = this.players[playerId];
                if (player.isDead) {
                    continue;
                }
                if (player.health <= 0) {
                    this.killPlayer(playerId);
                }
                player.move();
                player.shoot();
                player.activateSpecial();
                player.updateProjectiles();
                player.updateSpecialProjectiles();
                player.checkSpecialCollisions(this.boss.bullets);
                player.checkCollisions(this.boss);
                player.checkSpecialCollisionsWithBoss(this.boss);
                player.calcDmgMultiplyer();
                newPlayerData[playerId] = {
                    x: player.x,
                    y: player.y,
                    projectiles: player.projectiles,
                    angle: player.angle,
                    maxHp: player.maxHp,
                    health: player.health,
                    isOverheated: player.isOverheated,
                    messageTime: player.messageTime,
                    overheatMessage: player.overheatMessage,
                    isSpecialActive: player.isSpecialActive,
                    specialCharge: player.specialCharge,
                    specialMaxCharge: player.specialMaxCharge,
                    specialProjectiles: player.specialProjectiles
                }
            }

            const newBossData = {
                health: this.boss.health,
                positionh: this.boss.positionh,
                positionv: this.boss.positionv,
                bullets: this.boss.bullets,
                telegraphedZones: this.boss.telegraphedZones
            }

            // l'état des joueurs (morts ou en vie ?)
            this.io.emit('updateGame', { newBossData, newPlayerData });
        }
    }

    getUpgradesData() {
        const currentTier = Object.keys(this.playerUpgrades)[this.currentBossIndex];
        const currentUpgrades = this.playerUpgrades[currentTier];

        let upgradesByPlayer = {};

        Object.keys(this.players).forEach(playerId => {
            let randBuffs = new Set();
            while (randBuffs.size < 3) {
                let rand = Math.floor(Math.random() * 8);
                randBuffs.add(rand);
            }
            upgradesByPlayer[playerId] = [...randBuffs];
        });

        const upgradesData = {
            tier: currentTier,
            upgrades: currentUpgrades,
            upgradesByPlayer
        }
        return upgradesData;
    }

}

module.exports = World;
