const randomSpeed = Math.random() * 15 + 10;
const randomAngle = Math.random() * Math.PI * 7;

let dx = Math.cos(randomAngle) * randomSpeed;
let dy = Math.sin(randomAngle) * randomSpeed;

function moveBall(ball, paddle_1, paddle_2, map) {
  let ballTop = parseInt(ball.top);
  let ballLeft = parseInt(ball.left);
  const ballHeight = ball.diameter;
  
  const paddle_1Top = parseInt(paddle_1.top);
  const paddle_1Height = parseInt(paddle_1.height);
  const paddle_1Bottom = paddle_1Top + paddle_1Height;
  const paddle_1Right = parseInt(paddle_1.left) + parseInt(paddle_1.width);
  
  const paddle_2Top = parseInt(paddle_2.top);
  const paddle_2Height = parseInt(paddle_2.height);
  const paddle_2Bottom = paddle_2Top + paddle_2Height;
  const paddle_2Left = parseInt(paddle_2.left);

  const mapHeight = map.height;
  const mapWidth = map.width;
  
  ballTop += dy;
  ballLeft += dx;

  if (ballTop < 0) {
    ballTop = 0;
    dy = -dy;
  } else if (ballTop > mapHeight - ballHeight) {
    ballTop = mapHeight - ballHeight;
    dy = -dy;
  }

  if (ballLeft < 0) {
    ballLeft = 0;
    dx = -dx;
    // score1.innerText = parseInt(score1.innerText) + 1;
  } else if (ballLeft > mapWidth - ballHeight) {
    ballLeft = mapWidth - ballHeight;
    dx = -dx;
    // score2.innerText = parseInt(score2.innerText) + 1;
  }

  if (
    ballLeft <= paddle_1Right &&
    ballTop > paddle_1Top &&
    ballTop + ballHeight < paddle_1Bottom
  ) {
    ballLeft = paddle_1Right + 1;
    dx = -dx;
  }

  if (
    ballLeft + ballHeight >= paddle_2Left &&
    ballTop > paddle_2Top &&
    ballTop + ballHeight < paddle_2Bottom
  ) {
    ballLeft = paddle_2Left - ballHeight - 1;
    dx = -dx;
  }
  
  return {
    ball: {
      top: ballTop + "px",
      left: ballLeft + "px",
      diameter: ballHeight
    },
    paddle1: {
      top: paddle_1Top + "px",
      height: paddle_1Height + "px",
      left: paddle_1.left,
      width: paddle_1.width
    },
    paddle2: {
      top: paddle_2Top + "px",
      height: paddle_2Height + "px",
      left: paddle_2.left,
      width: paddle_2.width
    },
    map: {
      height: mapHeight,
      width: mapWidth
    }
  };
  
}

// setInterval(moveBall(),100)
module.exports = moveBall;
