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
const mysql = require('mysql');

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pong_login'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// Function to update victories for a player
function updateVictories(playerId) {
  const query = `UPDATE players SET victories = victories + 1 WHERE id = ?`;
  console.log("Database!!")
  connection.query(query, [playerId], (err, results) => {
    if (err) {
      console.error('Error updating victories:', err);
      return;
    }
    console.log('Victories updated for player with id', playerId);
  });
}

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

let player1 = null;
let player2 = null;
let player1Ready = false;
let player2Ready = false;
let startGame = false;

setInterval(() => {
    gameState = moveBall(gameState.ball, gameState.paddle1, gameState.paddle2, gameState.map,startGame);
    startGame = false;
    if (gameState.score1 == 9 || gameState.score2 == 9) {
      console.log("Game Over");
      if (gameState.score1 === 9) {
        updateVictories(1); // Assuming player 1's ID is 1
      } else if (gameState.score2 === 9) {
        updateVictories(2); // Assuming player 2's ID is 2
      }
      io.emit('gameOver'); // Emit a signal indicating game over
      player1Ready = false
      player2Ready = false
      
    }
    io.emit('gameStateUpdate', gameState);
}, 25);

io.on("connection", (socket) => {
  console.log("A user just connected.", socket.id);

  let role;
  if (!player1) {
    player1 = socket.id;
    role = 'player1';
  } else if (!player2) {
    player2 = socket.id;
    role = 'player2';
  } else {
    role = 'spectator';
  }

  socket.emit('assignRole', role);

  socket.on('ready', () => {
    if (role === 'player1') {
      player1Ready = true;
      console.log("Player1 Ready");
    } else if (role === 'player2') {
      player2Ready = true;
      console.log("Player2 Ready");
    }

    if (player1Ready && player2Ready) {
      startGame = true;
      console.log("Players Ready, Game Starting");
      io.emit('startGame', startGame);
      
    }
  });

  socket.emit('gameStateUpdate', gameState);

  socket.on('gameState', (data) => {
    gameState = data;
    io.emit('gameStateUpdate', gameState);
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected.", socket.id);

    if (socket.id === player1) {
      player1 = null;
      player1Ready = false;
    } else if (socket.id === player2) {
      player2 = null;
      player2Ready = false;
    }

    // Remove from players array just in case
    players = players.filter(player => player !== socket.id);
    
    // Stop the game if a player disconnects
    startGame = false;
    io.emit('gameStateUpdate', gameState);
  });
});