import { updateTotals } from './scoring.js';

// --- Render scorecard from state ---
export function renderScorecard(scorecard) {
  const rows = document.querySelectorAll('#score-rows .score');
  rows.forEach(cell => {
    const category = cell.dataset.category;
    cell.textContent = scorecard[category] || '';
  });
  updateTotals(scorecard);
}

// --- Clear scorecard (reset game) ---
export function clearScorecard() {
  const rows = document.querySelectorAll('#score-rows .score');
  rows.forEach(cell => {
    cell.textContent = '';
  });
  document.getElementById('total-score').textContent = '0';
}

// --- Update a single category ---
export function updateCategory(category, value) {
  const cell = document.querySelector(`.score[data-category="${category}"]`);
  if (cell) {
    cell.textContent = value;
  }
  // update totals after any change
  const scorecard = collectScorecard();
  updateTotals(scorecard);
}

// --- Collect current scorecard into object ---
export function collectScorecard() {
  const rows = document.querySelectorAll('#score-rows .score');
  const scorecard = {};
  rows.forEach(cell => {
    const category = cell.dataset.category;
    const val = parseInt(cell.textContent, 10);
    if (!isNaN(val)) {
      scorecard[category] = val;
    }
  });
  return scorecard;
}
