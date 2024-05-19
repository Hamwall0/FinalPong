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
const { score1, score2 } = require('./ball.js');

let players = [];

let gameState = {
  ball: { top: "0px", left: "0px", diameter: 20 },
  paddle1: { top: "50%", height: 100, left: "20px", width: 10 },
  paddle2: { top: "50%", height: 100, left: "570px", width: 10 },
  map: { height: 600, width: 800 },
  score1: score1,
  score2: score2
};

setInterval(() => {
  gameState = moveBall(gameState.ball, gameState.paddle1, gameState.paddle2, gameState.map);
  if (gameState.score1 == 9 || gameState.score2 == 9 ){
    console.log("game Over")
    io.emit('gameOver'); // Emit a signal indicating game over
  }
  io.emit('gameStateUpdate', gameState);
}, 25);

io.on("connection", (socket) => {
  console.log("A user just connected.", socket.id);

  let role;
  if (players.length < 2) {
    role = players.length === 0 ? 'player1' : 'player2';
    players.push(socket.id);
  } else {
    role = 'spectator';
  }

  socket.emit('assignRole', role);

  socket.emit('gameStateUpdate', gameState);

  socket.on('gameState', (data) => {
    gameState = data;
    io.emit('gameStateUpdate', gameState);
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected.", socket.id);
    players = players.filter(player => player !== socket.id);
  });
});
