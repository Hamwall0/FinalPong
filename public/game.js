const socket = io();

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

let role;

socket.on('assignRole', (assignedRole) => {
  role = assignedRole;
  console.log(`Assigned role: ${role}`);
});

let score1 = 0
let score2 = 0
socket.on('gameStateUpdate', (data) => {
  updateGameState(data);
  // Update score display dynamically
  score1 = data.score1
  score2 = data.score2
  // console.log(score1, score2)
  document.getElementById('score_2').innerText = parseInt(score2);
  document.getElementById('score_1').innerText = parseInt(score1);
});


const map = document.querySelector(".map");
const mapHeight = map.clientHeight;
const mapWidth = map.clientWidth;

let paddle_1 = document.createElement("div");
paddle_1.classList.add("paddle", "paddle_1");
paddle_1.style.position = "absolute";
paddle_1.style.top = "50%";
paddle_1.style.left = "100px";
map.appendChild(paddle_1);

let paddle_2 = document.createElement("div");
paddle_2.classList.add("paddle", "paddle_2");
paddle_2.style.position = "absolute";
paddle_2.style.top = "50%";
paddle_2.style.left = mapWidth - 100 + "px";
map.appendChild(paddle_2);

document.addEventListener("keydown", handleKeyDown);

const ball = document.querySelector(".ball");
ball.style.position = "absolute";

const initialTop = Math.random() * (mapHeight - ball.clientHeight);
const initialLeft = Math.random() * (mapWidth - ball.clientWidth);
ball.style.top = initialTop + "px";
ball.style.left = initialLeft + "px";

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
    height: mapHeight,
    width: mapWidth
  }
});

function handleKeyDown(event) {
  if (role === 'spectator') return;

  const key = event.key;
  const paddle_1Style = getComputedStyle(paddle_1);
  const paddle_1Height = paddle_1.clientHeight;
  const paddle_2Style = getComputedStyle(paddle_2);
  const paddle_2Height = paddle_2.clientHeight;

  if (role === 'player1') {
    if (key.toLowerCase() === "w") {
      const currentTop = parseInt(paddle_1Style.top);
      const newTop = Math.max(0, currentTop - mapHeight * 0.06);
      paddle_1.style.top = newTop + "px";
    }

    if (key.toLowerCase() === "s") {
      const currentTop = parseInt(paddle_1Style.top);
      const newTop = Math.min(mapHeight - paddle_1Height, currentTop + mapHeight * 0.06);
      paddle_1.style.top = newTop + "px";
    }
  }

  if (role === 'player2') {
    if (key === "ArrowUp") {
      const currentTop = parseInt(paddle_2Style.top);
      const newTop = Math.max(0, currentTop - mapHeight * 0.06);
      paddle_2.style.top = newTop + "px";
    }

    if (key === "ArrowDown") {
      const currentTop = parseInt(paddle_2Style.top);
      const newTop = Math.min(mapHeight - paddle_2Height, currentTop + mapHeight * 0.06);
      paddle_2.style.top = newTop + "px";
    }
  }

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
      height: mapHeight,
      width: mapWidth
    }
  });
}


function updateGameState(data) {
  const ballData = data.ball;
  const paddle1Data = data.paddle1;
  const paddle2Data = data.paddle2;

  ball.style.top = ballData.top;
  ball.style.left = ballData.left;

  paddle_1.style.top = paddle1Data.top;
  paddle_1.style.left = paddle1Data.left;

  paddle_2.style.top = paddle2Data.top;
  paddle_2.style.left = paddle2Data.left;
  // console.log(data.score1, data.score2)
  
}

