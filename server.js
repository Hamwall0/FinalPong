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

io.on("connection", (socket) => {
  console.log("A user just connected.", socket.id);
  
  socket.on('gameState', (data) => {
    const ballPosition = data.ball;
    const paddle1Position = data.paddle1;
    const paddle2Position = data.paddle2;
    const mapDimensions = data.map;

    const updatedGameState = moveBall(ballPosition, paddle1Position, paddle2Position, mapDimensions);

    socket.broadcast.emit('gameStateUpdate', updatedGameState);
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected.");
  });
});
