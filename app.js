
const VERSION_NUMBER = "1.__BUILD_VERSION__A";
const STORAGE_KEY = "yahtzee-game-v1";
const BEST_SCORE_KEY = "yahtzee-best-v1";
const LEGACY_BEST_SCORE_KEY = "yahtzee-v1";

let dice = [1, 1, 1, 1, 1];
let held = [false, false, false, false, false];

let rollsRemaining = 3;
let turnsRemaining = 13;
let gameState = "ready";
let isRolling = false;
let yahtzeeBonus = 0;

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
  chance: "Chance",
};

const CATEGORIES = Object.keys(CATEGORY_NAMES);

let scores = {};
let bestScore =
  Number(localStorage.getItem(BEST_SCORE_KEY)) ||
  Number(localStorage.getItem(LEGACY_BEST_SCORE_KEY)) ||
  0;

let soundEnabled = true;

const sounds = {
  click: new Audio("sounds/click.mp3"),
  roll: new Audio("sounds/roll.mp3"),
  score: new Audio("sounds/score.mp3"),
  win: new Audio("sounds/win.mp3"),
  yahtzee: new Audio("sounds/yahtzee.mp3"),
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
      if (gameState !== "playing" || isRolling || rollsRemaining === 3) {
        return;
      }

      held[index] = !held[index];
      renderDice();
      saveGame();
      playSound("click");
    });
  });

  renderDice();
}

function rollDice() {
  if (
    isRolling ||
    gameState === "finished" ||
    gameState === "awaiting-score" ||
    rollsRemaining <= 0
  ) {
    return;
  }

  rollsRemaining--;
  gameState = "playing";
  isRolling = true;

  const diceElements = document.querySelectorAll(".die");

  diceElements.forEach(function (die, index) {
    if (!held[index]) {
      die.classList.add("rolling");
    }
  });

  updateRollButton();
  playSound("roll");

  const shuffleInterval = setInterval(function () {
    dice = dice.map(function (value, index) {
      return held[index] ? value : Math.floor(Math.random() * 6) + 1;
    });

    renderDice();
  }, 70);

  setTimeout(function () {
    clearInterval(shuffleInterval);

    dice = dice.map(function (value, index) {
      return held[index] ? value : Math.floor(Math.random() * 6) + 1;
    });

    diceElements.forEach(function (die) {
      die.classList.remove("rolling");
    });

    isRolling = false;
    renderDice();
    saveGame();
    updateRollButton();
  }, 560);
}

function renderDice() {
  const patterns = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9],
  };

  document.querySelectorAll(".die").forEach(function (die, index) {
    const value = dice[index];

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
    die.classList.remove("rolling");

    die.setAttribute(
      "aria-label",
      "Die " + (index + 1) + ": " + value +
        (held[index] ? ", held" : ""),
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
    button.disabled = isRolling;
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
    sixes: 6,
  };

  if (upperValues[category]) {
    const value = upperValues[category];
    return counts[value] * value;
  }

  switch (category) {
    case "threeKind":
      return counts.some(function (count) {
        return count >= 3;
      }) ? total : 0;

    case "fourKind":
      return counts.some(function (count) {
        return count >= 4;
      }) ? total : 0;

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
      return getYahtzeeValue() !== 0 ? 50 : 0;

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

function getYahtzeeValue() {
  return dice.every(function (die) {
    return die === dice[0];
  }) ? dice[0] : 0;
}

function isUpperCategory(category) {
  return ["ones", "twos", "threes", "fours", "fives", "sixes"]
    .includes(category);
}

function getJokerScore(category) {
  switch (category) {
    case "fullHouse":
      return 25;

    case "smallStraight":
      return 30;

    case "largeStraight":
      return 40;

    default:
      return calculateScore(category);
  }
}

function updateScoreDisplay() {
  let upperTotal = 0;
  let totalScore = 0;

  CATEGORIES.forEach(function (category) {
    const score = scores[category];

    if (score !== null && score !== undefined) {
      totalScore += score;

      if (isUpperCategory(category)) {
        upperTotal += score;
      }
    }
  });

  const upperBonus = upperTotal >= 63 ? 35 : 0;
  totalScore += upperBonus + yahtzeeBonus;

  document.querySelectorAll(".score-row[data-category]").forEach(function (row) {
    const category = row.dataset.category;
    const value = row.querySelector(".score-value");

    if (!value || !CATEGORIES.includes(category)) return;

    value.textContent =
      scores[category] === null || scores[category] === undefined
        ? "—"
        : scores[category];

    row.classList.toggle("scored", scores[category] !== null);
    row.classList.toggle("available", scores[category] === null);
  });

  document.getElementById("bonus-score").textContent = upperBonus;
  document.getElementById("turns").textContent = turnsRemaining;
  document.getElementById("best-score").textContent =
    bestScore > 0 ? bestScore : "---";

  const yahtzeeBonusDisplay = document.getElementById("yahtzee-bonus-score");
  if (yahtzeeBonusDisplay) {
    yahtzeeBonusDisplay.textContent = yahtzeeBonus;
  }

  return totalScore;
}

function chooseScore(category) {
  if (gameState !== "playing" && gameState !== "awaiting-score") return;
  if (isRolling) return;
  if (!CATEGORIES.includes(category)) return;
  if (scores[category] !== null) return;

  const yahtzeeValue = getYahtzeeValue();

  // An additional Yahtzee earns a bonus only if the Yahtzee box
  // was previously scored as 50.
  const earnsBonus = scores.yahtzee === 50 && yahtzeeValue !== 0;
  let score;

  if (earnsBonus) {
    const matchingUpper = [
      "ones", "twos", "threes", "fours", "fives", "sixes",
    ][yahtzeeValue - 1];

    const lowerCategories = [
      "threeKind",
      "fourKind",
      "fullHouse",
      "smallStraight",
      "largeStraight",
      "chance",
    ];

    const upperAvailable = scores[matchingUpper] === null;
    const lowerAvailable = lowerCategories.some(function (name) {
      return scores[name] === null;
    });

    if (upperAvailable && category !== matchingUpper) {
      alert(
        "You must score this Yahtzee in " +
        CATEGORY_NAMES[matchingUpper] + ".",
      );
      return;
    }

    if (
      !upperAvailable &&
      lowerAvailable &&
      !lowerCategories.includes(category)
    ) {
      alert("Choose an available lower-section category for the Joker rule.");
      return;
    }

    if (
      !upperAvailable &&
      !lowerAvailable &&
      !isUpperCategory(category)
    ) {
      alert("Choose an available upper-section category.");
      return;
    }

    if (upperAvailable) {
      score = calculateScore(category);
    } else if (isUpperCategory(category)) {
      score = 0;
    } else {
      score = getJokerScore(category);
    }

    yahtzeeBonus += 100;
    playSound("yahtzee");
  } else {
    score = calculateScore(category);
  }

  scores[category] = score;
  turnsRemaining--;

  const totalScore = updateScoreDisplay();
  playSound("score");

  if (turnsRemaining === 0) {
    gameState = "finished";

    if (totalScore > bestScore) {
      bestScore = totalScore;
      localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
      document.getElementById("best-score").textContent = bestScore;
      playSound("win");
    }

    saveGame();
    updateRollButton();
    return;
  }

  held = [false, false, false, false, false];
  rollsRemaining = 3;
  gameState = "ready";

  renderDice();
  updateRollButton();
  saveGame();
}

function newGame() {
  dice = [1, 1, 1, 1, 1];
  held = [false, false, false, false, false];
  rollsRemaining = 3;
  turnsRemaining = 13;
  yahtzeeBonus = 0;
  gameState = "ready";
  isRolling = false;

  CATEGORIES.forEach(function (category) {
    scores[category] = null;
  });

  updateScoreDisplay();
  renderDice();
  updateRollButton();
  saveGame();
}

function saveGame() {
  const state = {
    dice: dice,
    held: held,
    rollsRemaining: rollsRemaining,
    turnsRemaining: turnsRemaining,
    gameState: gameState,
    scores: scores,
    yahtzeeBonus: yahtzeeBonus,
    bestScore: bestScore,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
  } catch (error) {
    console.warn("Unable to save game:", error);
  }
}

function loadGame() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return false;

  try {
    const state = JSON.parse(saved);

    if (!state || typeof state !== "object") return false;
    if (!Array.isArray(state.dice) || state.dice.length !== 5) return false;
    if (!state.dice.every(function (value) {
      return Number.isInteger(value) && value >= 1 && value <= 6;
    })) return false;

    if (!Array.isArray(state.held) || state.held.length !== 5) return false;
    if (!state.held.every(function (value) {
      return typeof value === "boolean";
    })) return false;

    if (!state.scores || typeof state.scores !== "object") return false;

    for (const category of CATEGORIES) {
      if (
        state.scores[category] !== null &&
        (!Number.isFinite(state.scores[category]) ||
          state.scores[category] < 0)
      ) {
        return false;
      }
    }

    if (!Number.isInteger(state.rollsRemaining) ||
        state.rollsRemaining < 0 || state.rollsRemaining > 3) return false;

    if (!Number.isInteger(state.turnsRemaining) ||
        state.turnsRemaining < 0 || state.turnsRemaining > 13) return false;

    if (!["ready", "playing", "awaiting-score", "finished"].includes(state.gameState)) {
      return false;
    }

    dice = state.dice;
    held = state.held;
    rollsRemaining = state.rollsRemaining;
    turnsRemaining = state.turnsRemaining;
    scores = {};

    CATEGORIES.forEach(function (category) {
      scores[category] = state.scores[category] ?? null;
    });

    yahtzeeBonus =
      Number.isFinite(state.yahtzeeBonus) && state.yahtzeeBonus >= 0
        ? state.yahtzeeBonus
        : 0;

    bestScore = Math.max(
      bestScore,
      Number.isFinite(state.bestScore) ? state.bestScore : 0,
    );

    // A page reload interrupts animations, so always resume settled.
    isRolling = false;

    // A finished game remains finished; other saved games can continue.
    if (gameState !== "finished" && rollsRemaining === 0) {
      gameState = "playing";
    }

    return true;
  } catch (error) {
    console.warn("Unable to load saved game:", error);
    return false;
  }
}

// Score selection
document.querySelectorAll(".score-row[data-category]").forEach(function (row) {
  row.addEventListener("click", function () {
    chooseScore(row.dataset.category);
  });
});

// Sound toggle
document.getElementById("soundToggle").addEventListener("click", function () {
  soundEnabled = !soundEnabled;
  this.textContent = soundEnabled ? "🔊" : "🔇";

  if (soundEnabled) playSound("click");
});

// Roll / New Game button
document.getElementById("rollButton").addEventListener("click", function () {
  if (gameState === "finished") {
    newGame();
  } else {
    rollDice();
  }
});

document.getElementById("versionNumber").textContent =
  "Version " + VERSION_NUMBER;

// Initialize the game
CATEGORIES.forEach(function (category) {
  scores[category] = null;
});

if (!loadGame()) {
  CATEGORIES.forEach(function (category) {
    scores[category] = null;
  });

  // Preserve a best score from the older version of the app.
  localStorage.setItem(BEST_SCORE_KEY, String(bestScore));
}

initializeDice();
updateScoreDisplay();
renderDice();
updateRollButton();

if( turnsRemaining == 0 ) newGame();
