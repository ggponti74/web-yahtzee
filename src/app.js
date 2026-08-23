import { rollDice, toggleHold } from './dice.js';
import { calculateScore, updateTotals } from './scoring.js';
import { saveState, loadState, clearState } from './storage.js';
import { playSound, toggleSound } from './sound.js';

// --- DOM references ---
const diceEls = document.querySelectorAll('.dice');
const rollBtn = document.getElementById('roll-btn');
const rollCountEl = document.getElementById('roll-count');
const scoreCells = document.querySelectorAll('.score');
const resetBtn = document.getElementById('reset-btn');
const soundToggleBtn = document.getElementById('sound-toggle');

// --- Game state ---
let dice = [0, 0, 0, 0, 0];
let held = [false, false, false, false, false];
let rollCount = 3;
let scorecard = {};
let soundOn = true;

// --- Init ---
function init() {
  const saved = loadState();
  if (saved) {
    ({ dice, held, rollCount, scorecard, soundOn } = saved);
    renderDice();
    renderScorecard();
    updateTotals(scorecard);
    rollCountEl.textContent = `Rolls left: ${rollCount}`;
    soundToggleBtn.textContent = soundOn ? '🔊' : '🔇';
  }
}
init();

// --- Dice interactions ---
diceEls.forEach((el, i) => {
  el.addEventListener('click', () => {
    held[i] = !held[i];
    toggleHold(el, held[i]);
    saveState({ dice, held, rollCount, scorecard, soundOn });
  });
});

rollBtn.addEventListener('click', () => {
  if (rollCount > 0) {
    dice = rollDice(dice, held);
    rollCount--;
    renderDice();
    rollCountEl.textContent = `Rolls left: ${rollCount}`;
    if (soundOn) playSound('roll');
    saveState({ dice, held, rollCount, scorecard, soundOn });
  }
});

// --- Scorecard interactions ---
scoreCells.forEach(cell => {
  cell.addEventListener('click', () => {
    const category = cell.dataset.category;
    if (!scorecard[category]) {
      scorecard[category] = calculateScore(category, dice);
      cell.textContent = scorecard[category];
      updateTotals(scorecard);
      if (soundOn) playSound('tap');
      saveState({ dice, held, rollCount, scorecard, soundOn });
      rollCount = 3; // reset rolls for next turn
      rollCountEl.textContent = `Rolls left: ${rollCount}`;
    }
  });
});

// --- Reset ---
resetBtn.addEventListener('click', () => {
  dice = [0, 0, 0, 0, 0];
  held = [false, false, false, false, false];
  rollCount = 3;
  scorecard = {};
  renderDice();
  renderScorecard();
  updateTotals(scorecard);
  rollCountEl.textContent = `Rolls left: 3`;
  clearState();
});

// --- Sound toggle ---
soundToggleBtn.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggleBtn.textContent = soundOn ? '🔊' : '🔇';
  saveState({ dice, held, rollCount, scorecard, soundOn });
});

// --- Render helpers ---
function renderDice() {
  diceEls.forEach((el, i) => {
    el.textContent = dice[i] || '-';
    el.classList.toggle('held', held[i]);
  });
}

function renderScorecard() {
  scoreCells.forEach(cell => {
    const category = cell.dataset.category;
    cell.textContent = scorecard[category] || '';
  });
}
