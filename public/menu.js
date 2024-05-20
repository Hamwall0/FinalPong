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
        mainMenu.showGameMenu();
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

        fetch("users.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `username=${username}&password=${password}`,
        })
          .then((response) => response.text())
          .then((data) => {
            console.log(data);
            if (data === "New record created successfully") {
              mainMenu.showGameMenu();
            } else {
              alert("Error signing up: " + data);
            }
          })
          .catch((error) => console.error("Error:", error));
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
        <button id="viewScoreboard">Scoreboard</button>
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
  render() {
    return `
      <div>
        <h1>Scoreboard</h1>
        <div id="scoreboard">
          <!-- Scoreboard content goes here -->
        </div>
        <button id="backToGameMenu">Back</button>
      </div>
    `;
  }

  addEventListeners() {
    document.getElementById("backToGameMenu").addEventListener("click", () => {
      mainMenu.showGameMenu();
    });
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
