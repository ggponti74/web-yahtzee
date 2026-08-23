// --- Roll dice ---
export function rollDice(currentDice, held) {
  return currentDice.map((value, i) => {
    if (held[i]) return value; // keep held dice unchanged
    return Math.floor(Math.random() * 6) + 1; // random 1–6
  });
}

// --- Toggle hold state visually ---
export function toggleHold(el, isHeld) {
  if (isHeld) {
    el.classList.add('held');
  } else {
    el.classList.remove('held');
  }
}
