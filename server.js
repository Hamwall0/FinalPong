// Import required modules
const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

// Define port
const port = 3000;

// Create express app
let app = express();

// Create HTTP server using express app
let server = http.createServer(app);

// Create socket.io server using HTTP server
let io = socketIO(server);

// Define public directory path
const publicPath = path.join(__dirname, "/public");

// Serve static files from the public directory
app.use(express.static(publicPath));

// Listen to the server on the defined port
server.listen(port, () => {
  console.log(`Server is up on port ${port}.`);
});

// Import moveBall function and score variables from ball.js
const moveBall = require('./ball.js');
const { score1, score2 } = require('./ball.js');

// Initialize players array
let players = [];

// Define initial game state
const initialGameState = {
  ball: { top: "0px", left: "0px", diameter: 20 },
  paddle1: { top: "50%", height: 100, left: "20px", width: 10 },
  paddle2: { top: "50%", height: 100, left: "570px", width: 10 },
  map: { height: 600, width: 800 },
  score1: score1,
  score2: score2
};

// Initialize game state
let gameState = initialGameState;

// Variable to track game state
let gameActive = true;

// Update game state at regular intervals
setInterval(() => {
  if (!gameActive) return;

  // Update game state using moveBall function
  gameState = moveBall(gameState.ball, gameState.paddle1, gameState.paddle2, gameState.map);
  
  // Check win condition
  if (gameState.score1 == 9 || gameState.score2 == 9) {
    console.log("Game over");
    // Emit signal indicating game over
    io.emit('gameOver');
    // Set gameActive to false when win condition is met
    gameActive = false;
    // Reset the game state to its initial state
    gameState = initialGameState;
  }
  
  // Emit updated game state to all clients
  io.emit('gameStateUpdate', gameState);
}, 25);

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user just connected.", socket.id);

  // Determine role of the connected user
  let role;
  if (players.length < 2) {
    role = players.length === 0 ? 'player1' : 'player2';
    players.push(socket.id);
  } else {
    role = 'spectator';
  }

  // Assign role to the connected user
  socket.emit('assignRole', role);

  // Emit initial game state to the connected user
  socket.emit('gameStateUpdate', gameState);

  // Listen for playerReady event
  socket.on('playerReady', () => {
    // Mark the player as ready
    socket.ready = true;
  
    // Check if both player1 and player2 are ready
    const player1Ready = players.some(playerId => {
      const playerSocket = io.sockets.sockets[playerId];
      return playerSocket && playerSocket.ready && playerSocket.role === 'player1';
    });
  
    const player2Ready = players.some(playerId => {
      const playerSocket = io.sockets.sockets[playerId];
      return playerSocket && playerSocket.ready && playerSocket.role === 'player2';
    });
  
    if (player1Ready && player2Ready) {
      // Emit signal to the client to start the game
      io.emit('startGame');
    }
  });
  
  // Listen for gameState event
  socket.on('gameState', (data) => {
    // Update game state
    gameState = data;
    // Emit updated game state to all clients
    io.emit('gameStateUpdate', gameState);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user has disconnected.", socket.id);
    // Remove disconnected user from players array
    players = players.filter(player => player !== socket.id);
  });
});

