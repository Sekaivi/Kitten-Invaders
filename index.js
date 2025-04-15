const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const World = require('./server/World');
const path = require("path");

const PORT = 3333;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Gestion du jeu virtuel
const rooms = {};

app.use(express.static(path.join(__dirname, "client")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "html/Testgame.html"));
});

// instructions sockets

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on('createRoom', () => {
        let roomCode;
        do {
            roomCode = generateRoomCode();
        } while (io.sockets.adapter.rooms.has(roomCode));

        socket.join(roomCode);
        console.log(`${socket.id} created and joined room: ${roomCode}`);

        rooms[roomCode] = new World(io.to(roomCode));
        const world = rooms[roomCode];
        world.gameStart();
        world.addPlayer(socket.id);

        socket.roomCode = roomCode; 
        io.to(roomCode).emit("currentPlayers", world.players);
        socket.emit("roomCreated", roomCode);
    });

    socket.on('joinRoom', (JoinRoomCode) => {
        if (io.sockets.adapter.rooms.has(JoinRoomCode)) {
            const roomCode = JoinRoomCode;
            const roomSize = io.sockets.adapter.rooms.get(roomCode).size;

            if (roomSize < 2) {
                socket.join(roomCode);
                console.log(`${socket.id} joined room: ${roomCode}`);
                socket.emit("roomJoined", roomCode);

                const world = rooms[roomCode];
                world.addPlayer(socket.id);
                socket.roomCode = roomCode; 

                io.to(roomCode).emit("currentPlayers", world.players);

                if (roomSize + 1 === 2) {  // ✅ Ajout du +1 car roomSize est l'état AVANT d'ajouter le joueur
                    const upgradesData = world.getUpgradesData();
                    io.to(roomCode).emit('chooseUpgrades', upgradesData);
                }
            } else {
                socket.emit("roomError", "Room is full.");
            }
        } else {
            socket.emit("roomError", "Room does not exist.");
        }
    });
    
    socket.on("pauseGame" , ()=>{
        if (!socket.roomCode) return; 
        const world = rooms[socket.roomCode];
        if(world.paused) return ;
        world.togglePause() ;
        world.io.emit("pauseGame") ;
    });

    socket.on("continueGame" , ()=>{
        if (!socket.roomCode) return; 
        const world = rooms[socket.roomCode];
        if(!world.paused) return ;
        world.togglePause() ;
        world.io.emit("continueGame") ;
    })

    socket.on("quit" , ()=>{
        const roomCode = socket.roomCode;
        const world = rooms[socket.roomCode];
        socket.leave(roomCode) ;
        world.removePlayer(socket.id);
        world.io.emit("playerDisconnected", socket.id);
        world.resetGame() ; // reinitialiser tout
        world.gameStart() ;
    }) ;

    socket.on('addUpgrade', (upgrades) => {
        if (!socket.roomCode) return;  // 🔥 Vérifier si socket a une room
        const world = rooms[socket.roomCode];
        world.updatePlayerUpgrades(socket.id, upgrades);
        
        if (
            Object.keys(world.upgradesChosen).length === 2 &&
            Object.values(world.upgradesChosen).every(value => value === true)
        ) {
            world.loadBoss();
            io.to(socket.roomCode).emit('startGame');
        }
    });

    socket.on('updatePlayerKeys', (keys) => {
        if (!socket.roomCode) return; 
        const world = rooms[socket.roomCode];
        if(!world.players[socket.id]) return ;
        world.updatePlayerKeys(socket.id, keys);
    });

    socket.on('restartGame', () => {
        const world = rooms[socket.roomCode];
        world.playAgain[socket.id] = true ;
        if(world.checkPlayAgain()){
            io.emit('restartGame') ; // joueur reinitialise le jeu de son coté
            world.resetGame() ; // reinitialiser tout
            world.gameStart() ; // relancer le jeu
            const upgradesData = world.getUpgradesData();
            world.io.emit('chooseUpgrades', upgradesData);
        }else{
            socket.emit('waiting' ,  "En attente de la confirmation de l'ensemble des joueurs") ;
        }
    });

    socket.on('quit', () => {
        console.log('Player wants to leave') ;
    });

    socket.on("disconnect", () => {
        console.log("Un joueur s'est déconnecté : " + socket.id);
        
        if (!socket.roomCode) return;
        
        const world = rooms[socket.roomCode];
        world.togglePause();
        world.removePlayer(socket.id);
        world.resetGame() ; // reinitialiser tout
        world.gameStart() ;
        world.io.emit("playerDisconnected", socket.id);
        // Supprimer la room si elle est vide
        if (io.sockets.adapter.rooms.get(socket.roomCode)?.size === 0) {
            delete rooms[socket.roomCode];
            console.log(`Room ${socket.roomCode} supprimée.`);
        }
    });
});



server.listen(PORT, () => {
    console.log("Server running on http://localhost:" + PORT);
});

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}
