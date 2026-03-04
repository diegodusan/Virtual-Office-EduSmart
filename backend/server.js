const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(cors({
    origin: "*" // Permite conexiones desde Github Pages
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Permite a Github Pages conectarse al socket
        methods: ["GET", "POST"]
    }
});

// Almacén en memoria de todos los jugadores conectados
const players = {};

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);

    // Cuando un jugador entra, guarda sus datos iniciales
    socket.on('playerJoined', (playerData) => {
        players[socket.id] = {
            id: socket.id,
            ...playerData
        };

        // Enviar al nuevo jugador la lista de todos los que ya estaban
        socket.emit('currentPlayers', players);

        // Avisar a todos los demás que entró alguien nuevo
        socket.broadcast.emit('newPlayer', players[socket.id]);
    });

    // Cuando un jugador se mueve
    socket.on('playerMoved', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            players[socket.id].frame = movementData.frame;
            players[socket.id].isWorking = movementData.isWorking;

            // Retransmitir esto a los demás, EXCEPTO al que lo envió (boradcast)
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    // Chat
    socket.on('chatMessage', (msgObj) => {
        io.emit('chatMessage', msgObj);
    });

    // WebRTC Signaling (Solo reenviar datos)
    socket.on('webrtcOffer', (data) => {
        io.to(data.to).emit('webrtcOffer', { offer: data.offer, from: socket.id });
    });

    socket.on('webrtcAnswer', (data) => {
        io.to(data.to).emit('webrtcAnswer', { answer: data.answer, from: socket.id });
    });

    socket.on('iceCandidate', (data) => {
        io.to(data.to).emit('iceCandidate', { candidate: data.candidate, from: socket.id });
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor multijugador corriendo en el puerto ${PORT}`);
});
