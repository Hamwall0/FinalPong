socket = io();

let role;
let paddle_1, paddle_2, ball;

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("assignRole", (assignedRole) => {
  role = assignedRole;
  console.log(`Assigned role: ${role}`);
});

socket.on("gameOver", () => {
  console.log("Received Game Over");
  hideGameObjects();
  mainMenu.showSignInMenu(); // Show the main menu when game over signal is received
});

socket.on("gameStateUpdate", (data) => {
  if (ball && paddle_1 && paddle_2) {
    updateGameState(data);
  }
  document.getElementById("score_1").innerText = parseInt(data.score1);
  document.getElementById("score_2").innerText = parseInt(data.score2);
});

let gameExist = false; //variable to check if the game exists

// function to start the game, if the game alrady exists the game will show if previusly hidden
function startGame() {
  if (!gameExist) {
    const map = document.querySelector(".map");
    const mapHeight = map.clientHeight;
    const mapWidth = map.clientWidth;

    paddle_1 = document.createElement("div");
    paddle_1.classList.add("paddle", "paddle_1");
    paddle_1.style.position = "absolute";
    paddle_1.style.top = "50%";
    paddle_1.style.left = "100px";
    map.appendChild(paddle_1);

    paddle_2 = document.createElement("div");
    paddle_2.classList.add("paddle", "paddle_2");
    paddle_2.style.position = "absolute";
    paddle_2.style.top = "50%";
    paddle_2.style.left = mapWidth - 100 + "px";
    map.appendChild(paddle_2);

    document.addEventListener("keydown", handleKeyDown);

    ball = document.querySelector(".ball");
    ball.style.position = "absolute";
    ball.style.top = initialTop + "px";
    ball.style.left = initialLeft + "px";

    gameExist = true;
    emitGameState();
  } else {
    showGameObjects();
  }
}
// This function handle key down events and moves the paddels. It also makes sure that player1 only move paddle1 and player2 can move paddle 2.
function handleKeyDown(event) {
  if (role === "spectator") return; // If you are a spectator you can't do anything

  const key = event.key.toLowerCase();
  const paddle_1Style = getComputedStyle(paddle_1);
  const paddle_1Height = paddle_1.clientHeight;
  const paddle_2Style = getComputedStyle(paddle_2);
  const paddle_2Height = paddle_2.clientHeight;
  const mapHeight = document.querySelector(".map").clientHeight;

  if (role === "player1") {
    if (key === "w") {
      const currentTop = parseInt(paddle_1Style.top);
      const newTop = Math.max(0, currentTop - mapHeight * 0.06);
      paddle_1.style.top = newTop + "px";
    }

    if (key === "s") {
      const currentTop = parseInt(paddle_1Style.top);
      const newTop = Math.min(
        mapHeight - paddle_1Height,
        currentTop + mapHeight * 0.06
      );
      paddle_1.style.top = newTop + "px";
    }
  }

  if (role === "player2") {
    if (key === "arrowup") {
      const currentTop = parseInt(paddle_2Style.top);
      const newTop = Math.max(0, currentTop - mapHeight * 0.06);
      paddle_2.style.top = newTop + "px";
    }

    if (key === "arrowdown") {
      const currentTop = parseInt(paddle_2Style.top);
      const newTop = Math.min(
        mapHeight - paddle_2Height,
        currentTop + mapHeight * 0.06
      );
      paddle_2.style.top = newTop + "px";
    }
  }

  emitGameState();
}
// emitGameState sends all game data from the client to the server
function emitGameState() {
  socket.emit("gameState", {
    ball: {
      top: ball.style.top,
      left: ball.style.left,
      diameter: ball.clientHeight,
    },
    paddle1: {
      top: paddle_1.style.top,
      height: paddle_1.clientHeight,
      left: paddle_1.style.left,
      width: paddle_1.clientWidth,
    },
    paddle2: {
      top: paddle_2.style.top,
      height: paddle_2.clientHeight,
      left: paddle_2.style.left,
      width: paddle_2.clientWidth,
    },
    map: {
      height: document.querySelector(".map").clientHeight,
      width: document.querySelector(".map").clientWidth,
    },
  });
}

function updateGameState(data) {
  if (ball && paddle_1 && paddle_2) {
    ball.style.top = data.ball.top;
    ball.style.left = data.ball.left;

    paddle_1.style.top = data.paddle1.top;
    paddle_1.style.left = data.paddle1.left;

    paddle_2.style.top = data.paddle2.top;
    paddle_2.style.left = data.paddle2.left;
  } else {
    console.error("Ball or paddles are not defined.");
  }
}

function hideGameObjects() {
  if (paddle_1) paddle_1.style.display = "none";
  if (paddle_2) paddle_2.style.display = "none";
  // if (ball) ball.style.display = 'none';
}

function showGameObjects() {
  if (paddle_1) paddle_1.style.display = "block";
  if (paddle_2) paddle_2.style.display = "block";
  // if (ball) ball.style.display = 'block';
}
