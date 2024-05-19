const socket = io();

let role;
let paddle_1, paddle_2, ball;

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('assignRole', (assignedRole) => {
  role = assignedRole;
  console.log(`Assigned role: ${role}`);
});

//let gameActive = true; // Initialize gameActive as true

socket.on('gameOver', () => {
  document.querySelector('.map').style.display = 'none'; // Hide the map
  // document.querySelector('paddel_1').style.display = 'none';
  mainMenu.showSignInMenu(); // Show the main menu when game over signal is received
  //gameActive = false; // Set gameActive to false when game is over
});

socket.on('gameStateUpdate', (data) => {
  updateGameState(data);
  document.getElementById('score_1').innerText = parseInt(data.score1);
  document.getElementById('score_2').innerText = parseInt(data.score2);
});

function startGame() {
  const map = document.querySelector(".map");
  const mapHeight = map.clientHeight;
  const mapWidth = map.clientWidth;

  paddle_1 = document.createElement("div");
  paddle_1.classList.add("paddle", "paddle_1");
  paddle_1.style.position = "absolute";
  paddle_1.style.top = "50%";
  paddle_1.style.left = "100px"; // Adjust this value as needed
  map.appendChild(paddle_1);

  paddle_2 = document.createElement("div");
  paddle_2.classList.add("paddle", "paddle_2");
  paddle_2.style.position = "absolute";
  paddle_2.style.top = "50%";
  paddle_2.style.left = mapWidth - 100 + "px"; // Adjust this value as needed
  map.appendChild(paddle_2);

  // Ensure that the paddles are visible
  paddle_1.style.display = "block";
  paddle_2.style.display = "block";
}

function handleKeyDown(event) {
  if (role === 'spectator') return;

  const key = event.key.toLowerCase();
  const paddle_1Style = getComputedStyle(paddle_1);
  const paddle_1Height = paddle_1.clientHeight;
  const paddle_2Style = getComputedStyle(paddle_2);
  const paddle_2Height = paddle_2.clientHeight;
  const mapHeight = document.querySelector(".map").clientHeight;

  if (role === 'player1') {
    if (key === "w") {
      const currentTop = parseInt(paddle_1Style.top);
      const newTop = Math.max(0, currentTop - mapHeight * 0.06);
      paddle_1.style.top = newTop + "px";
    }

    if (key === "s") {
      const currentTop = parseInt(paddle_1Style.top);
      const newTop = Math.min(mapHeight - paddle_1Height, currentTop + mapHeight * 0.06);
      paddle_1.style.top = newTop + "px";
    }
  }

  if (role === 'player2') {
    if (key === "arrowup") {
      const currentTop = parseInt(paddle_2Style.top);
      const newTop = Math.max(0, currentTop - mapHeight * 0.06);
      paddle_2.style.top = newTop + "px";
    }

    if (key === "arrowdown") {
      const currentTop = parseInt(paddle_2Style.top);
      const newTop = Math.min(mapHeight - paddle_2Height, currentTop + mapHeight * 0.06);
      paddle_2.style.top = newTop + "px";
    }
  }

  emitGameState();
}

function emitGameState() {
  socket.emit('gameState', {
    ball: {
      top: ball.style.top,
      left: ball.style.left,
      diameter: ball.clientHeight
    },
    paddle1: {
      top: paddle_1.style.top,
      height: paddle_1.clientHeight,
      left: paddle_1.style.left,
      width: paddle_1.clientWidth
    },
    paddle2: {
      top: paddle_2.style.top,
      height: paddle_2.clientHeight,
      left: paddle_2.style.left,
      width: paddle_2.clientWidth
    },
    map: {
      height: document.querySelector(".map").clientHeight,
      width: document.querySelector(".map").clientWidth
    }
  });
}

function updateGameState(data) {
  ball.style.top = data.ball.top;
  ball.style.left = data.ball.left;

  paddle_1.style.top = data.paddle1.top;
  paddle_1.style.left = data.paddle1.left;

  paddle_2.style.top = data.paddle2.top;
  paddle_2.style.left = data.paddle2.left;
}