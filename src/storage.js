// --- Keys ---
const STORAGE_KEY = 'yahtzee-game-state';

// --- Save current state ---
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state:', err);
  }
}

// --- Load saved state ---
export function loadState() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Error loading state:', err);
    return null;
  }
}

// --- Clear saved state ---
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error clearing state:', err);
  }
}
