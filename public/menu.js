class Menu {
  constructor(mainElement) {
    this.mainElement = mainElement;
  }

  show() {
    this.mainElement.innerHTML = this.render();
    this.addEventListeners();
  }

  render() {
    return "";
  }

  addEventListeners() {}
}

class SignInMenu extends Menu {
  render() {
    return `
      <div>
        <h1>Sign In</h1>
        <form id="signInForm">
          <input type="text" id="username" placeholder="Username" required>
          <input type="password" id="password" placeholder="Password" required>
          <button type="submit">Sign In</button>
        </form>
        <button id="goToSignUp">Sign Up</button>
      </div>
    `;
  }

  addEventListeners() {
    document
      .getElementById("signInForm")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        let user = {
          username: username,
          password: password,
        };
        socket.emit("signInRequest", user);
        socket.on("check", (pass) => {
          if (pass) {
            mainMenu.showGameMenu();
          } else {
            alert("Wrong username or password");
          }
        });
      });

    document.getElementById("goToSignUp").addEventListener("click", () => {
      mainMenu.showSignUpMenu();
    });
  }
}

class SignUpMenu extends Menu {
  render() {
    return `
      <div>
        <h1>Sign Up</h1>
        <form id="signUpForm">
          <input type="text" id="newUsername" placeholder="Username" required>
          <input type="password" id="newPassword" placeholder="Password" required>
          <button type="submit">Sign Up</button>
        </form>
        <button id="goToSignIn">Sign In</button>
      </div>
    `;
  }

  addEventListeners() {
    document
      .getElementById("signUpForm")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        let username = document.getElementById("newUsername").value;
        let password = document.getElementById("newPassword").value;
        let user = {
          username: username,
          password: password,
        };
        socket.emit("signUpRequest", user);
        socket.on("check", (pass) => {
          if (pass) {
            mainMenu.showGameMenu();
          } else {
            alert("Username already exists");
          }
        });
      });

    document.getElementById("goToSignIn").addEventListener("click", () => {
      mainMenu.showSignInMenu();
    });
  }
}

class GameMenu extends Menu {
  render() {
    return `
      <div>
        <h1>Game Menu</h1>
        <button id="startGame">Start Game</button>
        <button id="viewScoreboard">Registered Players</button>
      </div>
    `;
  }

  addEventListeners() {
    document.getElementById("startGame").addEventListener("click", () => {
      document.querySelector(".map").style.display = "block";
      mainMenu.hide();
      socket.emit("ready");
      startGame();
    });

    document.getElementById("viewScoreboard").addEventListener("click", () => {
      mainMenu.showScoreboard();
    });
  }
}

class ScoreboardMenu extends Menu {
  constructor(mainElement) {
    super(mainElement);
    this.scoreboard = [];
  }

  render() {
    return `
      <div>
        <h1>Registered Players</h1>
        <button id="backToGameMenu">Back</button>
        <p id="scoreboard"></p>
      </div>
    `;
  }

  addEventListeners() {
    socket.emit("getUsers");
    socket.on("sendUsers", (result) => {
      this.scoreboard = result;
      this.updateScoreboard();
    });

    document.getElementById("backToGameMenu").addEventListener("click", () => {
      mainMenu.showGameMenu();
    });
  }

  updateScoreboard() {
    const scoreboardElement = document.getElementById("scoreboard");
    if (scoreboardElement) {
      scoreboardElement.innerHTML = this.scoreboard
        .map((user) => `<div>Name:${user.Name}</div>`)
        .join("");
    } else {
      console.error("Scoreboard element not found");
    }
  }
}

class MainMenu {
  constructor(mainElement) {
    this.mainElement = mainElement;
    this.signInMenu = new SignInMenu(mainElement);
    this.signUpMenu = new SignUpMenu(mainElement);
    this.gameMenu = new GameMenu(mainElement);
    this.scoreboardMenu = new ScoreboardMenu(mainElement);
  }

  showSignInMenu() {
    this.signInMenu.show();
  }

  showSignUpMenu() {
    this.signUpMenu.show();
  }

  showGameMenu() {
    this.gameMenu.show();
  }

  showScoreboard() {
    this.scoreboardMenu.show();
  }

  hide() {
    this.mainElement.innerHTML = "";
  }
}

const mainMenu = new MainMenu(document.getElementById("mainMenu"));
mainMenu.showSignInMenu();
