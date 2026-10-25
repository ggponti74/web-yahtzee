
const VERSION_NUMBER = "1.0.__BUILD_VERSION__A";
const STORAGE_KEY = "yahtzee-v1";

// ========================
// Game configuration
// ========================

let dice = [1, 1, 1, 1, 1];
let held = [false, false, false, false, false];

let rollsRemaining = 3;
let turnsRemaining = 13;
let gameState = "ready";

let scores = {
    ones: null,
    twos: null,
    threes: null,
    fours: null,
    fives: null,
    sixes: null,
    threeKind: null,
    fourKind: null,
    fullHouse: null,
    smallStraight: null,
    largeStraight: null,
    yahtzee: null,
    chance: null
};

let bestScore = 0;
let soundEnabled = true;

// ========================
// Sound
// ========================

const sounds = {
    click: new Audio("sounds/click.mp3"),
    roll: new Audio("sounds/roll.mp3"),
    score: new Audio("sounds/score.mp3"),
    win: new Audio("sounds/win.mp3"),
    yahtzee: new Audio("sounds/yahtzee.mp3")
};

function playSound(name) {
    if (!soundEnabled) {
        return;
    }

    const sound = sounds[name];

    if (!sound) {
        return;
    }

    sound.currentTime = 0;

    sound.play().catch(function (error) {
        console.log("Sound playback failed:", error);
    });
}

// ========================
// Initialization
// ========================

function initializeDice() {
    document.querySelectorAll(".die").forEach(function (die, index) {
        die.addEventListener("click", function () {
            if (gameState !== "playing" || rollsRemaining === 3) {
                return;
            }

            held[index] = !held[index];

            renderDice();
            playSound("click");
        });
    });

    renderDice();
}

// ========================
// Dice
// ========================

function rollDice() {
    if (gameState === "finished" ||
        gameState === "awaiting-score" ||
        rollsRemaining <= 0) {
        return;
    }

    dice = dice.map(function (value, index) {
        if (held[index]) {
            return value;
        }

        return Math.floor(Math.random() * 6) + 1;
    });

    rollsRemaining--;
    gameState = "playing";

    renderDice();
    updateRollButton();
    playSound("roll");
}

function renderDice() {
    document.querySelectorAll(".die").forEach(function (die, index) {
        const value = dice[index];

        // Grid positions for the pips on a 3 x 3 die.
        const patterns = {
            1: [5],
            2: [1, 9],
            3: [1, 5, 9],
            4: [1, 3, 7, 9],
            5: [1, 3, 5, 7, 9],
            6: [1, 3, 4, 6, 7, 9]
        };

        const visiblePips = patterns[value];

        die.innerHTML = "";

        for (let position = 1; position <= 9; position++) {
            const pip = document.createElement("span");

            pip.className = "pip";
            pip.style.gridColumn = String(((position - 1) % 3) + 1);
            pip.style.gridRow = String(Math.floor((position - 1) / 3) + 1);

            if (!visiblePips.includes(position)) {
                pip.style.visibility = "hidden";
            }

            die.appendChild(pip);
        }

        die.classList.toggle("held", held[index]);
        die.setAttribute("aria-label", "Die " + (index + 1) +
            ": " + value + (held[index] ? ", held" : ""));
    });
}

function updateRollButton() {
    const button = document.getElementById("rollButton");

    if (rollsRemaining > 0) {
        button.textContent = "Roll (" + rollsRemaining + ")";
        button.disabled = false;
    } else {
        button.textContent = "Choose Score";
        button.disabled = true;
        gameState = "awaiting-score";
    }
}

// ========================
// Event handlers
// ========================

document.getElementById("soundToggle").addEventListener("click", function () {
    soundEnabled = !soundEnabled;

    this.textContent = soundEnabled ? "🔊" : "🔇";

    if (soundEnabled) {
        playSound("click");
    }
});

document.getElementById("rollButton").addEventListener("click", function () {
    rollDice();
});

// ========================
// Main
// ========================

document.getElementById("versionNumber").textContent =
    "Version " + VERSION_NUMBER;

document.getElementById("turns").textContent = turnsRemaining;
document.getElementById("best-score").textContent = bestScore;

initializeDice();

console.log(
    "Dice:", document.querySelectorAll(".die").length,
    "Pips:", document.querySelectorAll(".die .pip").length,
    "First pip:", document.querySelector(".die .pip")?.outerHTML
);
