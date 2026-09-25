const VERSION_NUMBER = "1.0.__BUILD_VERSION__.A";
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

// ========================
// Event handlers
// ========================

document.getElementById("soundToggle").addEventListener("click", function () {
    soundEnabled = !soundEnabled;

    if(soundEnabled) {
         playSound("click");
    }
});

document.getElementById("rollButton").addEventListener("click", function () {
    playSound("click");
});

// ========================
// Game state
// ========================

// ========================
// Initialization
// ========================

// ========================
// Game management
// ========================

// ========================
// Dice
// ========================

// ========================
// Scoring
// ========================

// ========================
// Rendering
// ========================

// ========================
// Sound
// ========================

let soundEnabled = true;

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
// Settings / localStorage
// ========================

// ========================
// Main
// ========================

document.getElementById("versionNumber").innerHTML = "Version " + VERSION_NUMBER;

console.log(sounds.win);
console.log(sounds.win.src);
console.log(sounds.win.readyState);

playSound("win");

