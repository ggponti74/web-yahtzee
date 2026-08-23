// --- Preload sounds ---
const sounds = {
  roll: new Audio('/public/sounds/roll.mp3'),
  tap: new Audio('/public/sounds/tap.mp3')
};

// --- Play sound by key ---
export function playSound(key) {
  if (sounds[key]) {
    // rewind to start so it plays fresh each time
    sounds[key].currentTime = 0;
    sounds[key].play().catch(err => {
      console.warn('Sound playback failed:', err);
    });
  }
}

// --- Toggle mute/unmute ---
export function toggleSound(on) {
  Object.values(sounds).forEach(audio => {
    audio.muted = !on;
  });
}
