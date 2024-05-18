const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const port = 3000;

let app = express();
let server = http.createServer(app);
let io = socketIO(server);

const publicPath = path.join(__dirname, "/public");
app.use(express.static(publicPath));

server.listen(port, () => {
  console.log(`Server is up on port ${port}.`);
});

const moveBall = require('./ball.js');

let gameState = {
  ball: { top: "0px", left: "0px", diameter: 20 },
  paddle1: { top: "50%", height: 100, left: "100px", width: 10 },
  paddle2: { top: "50%", height: 100, left: "500px", width: 10 },
  map: { height: 600, width: 800 }
};

setInterval(() => {
  gameState = moveBall(gameState.ball, gameState.paddle1, gameState.paddle2, gameState.map);
  io.emit('gameStateUpdate', gameState);
}, 100);

io.on("connection", (socket) => {
  console.log("A user just connected.", socket.id);

  socket.emit('gameStateUpdate', gameState);

  socket.on('gameState', (data) => {
    console.log('Received gameStateUpdate', data);
    gameState = data; // Update the server's game state with received data
    io.emit('gameStateUpdate', gameState);
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected.");
  });
});
