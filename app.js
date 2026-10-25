const VERSION_NUMBER = "1.0.__BUILD_VERSION__A";
const STORAGE_KEY = "yahtzee-v1";

let dice = [1, 1, 1, 1, 1];
let held = [false, false, false, false, false];

let rollsRemaining = 3;
let turnsRemaining = 13;
let gameState = "ready";

const CATEGORY_NAMES = {
    ones: "Ones",
    twos: "Twos",
    threes: "Threes",
    fours: "Fours",
    fives: "Fives",
    sixes: "Sixes",
    threeKind: "3 of a Kind",
    fourKind: "4 of a Kind",
    fullHouse: "Full House",
    smallStraight: "Small Straight",
    largeStraight: "Large Straight",
    yahtzee: "Yahtzee",
    chance: "Chance"
};

let scores = {};

let bestScore = Number(localStorage.getItem(STORAGE_KEY)) || 0;
let soundEnabled = true;

const sounds = {
    click: new Audio("sounds/click.mp3"),
    roll: new Audio("sounds/roll.mp3"),
    score: new Audio("sounds/score.mp3"),
    win: new Audio("sounds/win.mp3"),
    yahtzee: new Audio("sounds/yahtzee.mp3")
};

function playSound(name) {
    if (!soundEnabled) return;

    const sound = sounds[name];
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(function () {});
}

function initializeDice() {
    document.querySelectorAll(".die").forEach(function (die, index) {
        die.addEventListener("click", function () {
            if (gameState !== "playing" || rollsRemaining === 3) return;

            held[index] = !held[index];
            renderDice();
            playSound("click");
        });
    });

    renderDice();
}

function rollDice() {
    if (gameState === "finished" ||
        gameState === "awaiting-score" ||
        rollsRemaining <= 0) return;

    rollsRemaining--;
    gameState = "playing";

    const diceElements = document.querySelectorAll(".die");

    // Animate only dice that aren't being held.
    diceElements.forEach(function (die, index) {
        if (!held[index]) {
            die.classList.add("rolling");
        }
    });

    updateRollButton();
    playSound("roll");

    // Shuffle through random faces, then settle on the final roll.
    const shuffleInterval = setInterval(function () {
        dice = dice.map(function (value, index) {
            return held[index] ? value : Math.floor(Math.random() * 6) + 1;
        });

        renderDice();

        // renderDice rebuilds the contents, but preserves the die classes.
    }, 70);

    setTimeout(function () {
        clearInterval(shuffleInterval);

        dice = dice.map(function (value, index) {
            return held[index] ? value : Math.floor(Math.random() * 6) + 1;
        });

        diceElements.forEach(function (die) {
            die.classList.remove("rolling");
        });

        renderDice();
    }, 560);
}

function renderDice() {
    document.querySelectorAll(".die").forEach(function (die, index) {
        const value = dice[index];

        const patterns = {
            1: [5],
            2: [1, 9],
            3: [1, 5, 9],
            4: [1, 3, 7, 9],
            5: [1, 3, 5, 7, 9],
            6: [1, 3, 4, 6, 7, 9]
        };

        die.innerHTML = "";

        for (let position = 1; position <= 9; position++) {
            const pip = document.createElement("span");
            pip.className = "pip";
            pip.style.gridColumn = String(((position - 1) % 3) + 1);
            pip.style.gridRow = String(Math.floor((position - 1) / 3) + 1);

            if (!patterns[value].includes(position)) {
                pip.style.visibility = "hidden";
            }

            die.appendChild(pip);
        }

        die.classList.toggle("held", held[index]);
        die.setAttribute(
            "aria-label",
            "Die " + (index + 1) + ": " + value +
            (held[index] ? ", held" : "")
        );
    });
}

function updateRollButton() {
    const button = document.getElementById("rollButton");

    if (gameState === "finished") {
        button.textContent = "New Game";
        button.disabled = false;
    } else if (rollsRemaining > 0) {
        button.textContent = "Roll (" + rollsRemaining + ")";
        button.disabled = false;
    } else {
        button.textContent = "Choose Score";
        button.disabled = true;
    }
}

function calculateScore(category) {
    const counts = [0, 0, 0, 0, 0, 0, 0];

    dice.forEach(function (die) {
        counts[die]++;
    });

    const total = dice.reduce(function (sum, die) {
        return sum + die;
    }, 0);

    const upperValues = {
        ones: 1,
        twos: 2,
        threes: 3,
        fours: 4,
        fives: 5,
        sixes: 6
    };

    if (upperValues[category]) {
        const value = upperValues[category];
        return counts[value] * value;
    }

    switch (category) {
        case "threeKind":
            return counts.some(count => count >= 3) ? total : 0;

        case "fourKind":
            return counts.some(count => count >= 4) ? total : 0;

        case "fullHouse":
            return counts.includes(3) && counts.includes(2) ? 25 : 0;

        case "smallStraight":
            return hasStraight([1, 2, 3, 4]) ||
                   hasStraight([2, 3, 4, 5]) ||
                   hasStraight([3, 4, 5, 6]) ? 30 : 0;

        case "largeStraight":
            return hasStraight([1, 2, 3, 4, 5]) ||
                   hasStraight([2, 3, 4, 5, 6]) ? 40 : 0;

        case "yahtzee":
            return counts.some(count => count === 5) ? 50 : 0;

        case "chance":
            return total;

        default:
            return 0;
    }
}

function hasStraight(sequence) {
    return sequence.every(function (value) {
        return dice.includes(value);
    });
}

function updateScoreDisplay() {
    let upperTotal = 0;
    let totalScore = 0;

    Object.keys(scores).forEach(function (category) {
        const score = scores[category];

        if (score !== null) {
            totalScore += score;

            if (["ones", "twos", "threes", "fours", "fives", "sixes"]
                .includes(category)) {
                upperTotal += score;
            }
        }
    });

    const bonus = upperTotal >= 63 ? 35 : 0;
    totalScore += bonus;

    document.querySelectorAll(".score-row[data-category]").forEach(function (row) {
        const category = row.dataset.category;
        const value = row.querySelector(".score-value");

        value.textContent = scores[category] === null
            ? "—"
            : scores[category];

        row.classList.toggle("scored", scores[category] !== null);
        row.classList.toggle("available", scores[category] === null);
    });

    document.getElementById("bonus-score").textContent = bonus;
    document.getElementById("turns").textContent = turnsRemaining;
    document.getElementById("best-score").textContent =
        bestScore > 0 ? bestScore : "---";

    return totalScore;
}

function chooseScore(category) {
    if (gameState !== "playing" && gameState !== "awaiting-score") return;
    if (scores[category] !== null) return;

    scores[category] = calculateScore(category);
    turnsRemaining--;

    const totalScore = updateScoreDisplay();
    playSound("score");

    if (turnsRemaining === 0) {
        gameState = "finished";

        if (totalScore > bestScore) {
            bestScore = totalScore;
            localStorage.setItem(STORAGE_KEY, String(bestScore));
            document.getElementById("best-score").textContent = bestScore;
            playSound("win");
        }

        updateRollButton();
        return;
    }

held = [false, false, false, false, false];
rollsRemaining = 3;
gameState = "ready";

renderDice();
updateRollButton();
}

function newGame() {
    dice = [1, 1, 1, 1, 1];
    held = [false, false, false, false, false];
    rollsRemaining = 3;
    turnsRemaining = 13;
    gameState = "ready";

    Object.keys(CATEGORY_NAMES).forEach(function (category) {
        scores[category] = null;
    });

    updateScoreDisplay();
    renderDice();
    updateRollButton();
}

document.querySelectorAll(".score-row[data-category]").forEach(function (row) {
    row.addEventListener("click", function () {
        chooseScore(row.dataset.category);
    });
});

document.getElementById("soundToggle").addEventListener("click", function () {
    soundEnabled = !soundEnabled;
    this.textContent = soundEnabled ? "🔊" : "🔇";

    if (soundEnabled) playSound("click");
});

document.getElementById("rollButton").addEventListener("click", function () {
    if (gameState === "finished") {
        newGame();
    } else {
        rollDice();
    }
});

document.getElementById("versionNumber").textContent =
    "Version " + VERSION_NUMBER;

Object.keys(CATEGORY_NAMES).forEach(function (category) {
    scores[category] = null;
});

initializeDice();
updateScoreDisplay();
updateRollButton();
