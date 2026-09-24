const VERSION_NUMBER = "1.0.__VERSION_NUMBER__.A";

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

function playScoreSound() {
    // TODO: category scored sound, if ever desired
}

// ========================
// Settings / localStorage
// ========================

// ========================
// Main
// ========================

document.getElementById("versionNumber").innerText = VERSION_NUMBER;
