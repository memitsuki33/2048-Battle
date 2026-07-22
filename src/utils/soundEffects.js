// Sound Effect
// Centralised audio module — import and call these functions anywhere in the game.

const sounds = {
  move:      new Audio('/sounds/move.wav'),
  hard_drop: new Audio('/sounds/hard_drop.wav'),
  combo_x1:  new Audio('/sounds/combo_x1.wav'),
  combo_x2:  new Audio('/sounds/combo_x2.wav'),
  combo_x3:  new Audio('/sounds/combo_x3.wav'),
  combo_x4:  new Audio('/sounds/combo_x4.wav'),
  combo_x5:  new Audio('/sounds/combo_x5plus.wav'),
  level_up:  new Audio('/sounds/level_up.wav'),
  click:     new Audio('/sounds/click.wav'),
  hover:     new Audio('/sounds/hover.wav'),
};

// Lower volume for frequent sounds so they don't overwhelm
sounds.move.volume      = 0.45;
sounds.hard_drop.volume = 0.6;
sounds.hover.volume     = 0.3;
sounds.click.volume     = 0.5;

function play(sound) {
  try {
    sound.currentTime = 0;
    sound.play().catch(() => {}); // suppress autoplay-policy errors silently
  } catch {}
}

/** Play the move left / right sound (desktop + mobile). */
export function playMove() {
  play(sounds.move);
}

/** Play the hard-drop lock sound (desktop + mobile). */
export function playHardDrop() {
  play(sounds.hard_drop);
}

/**
 * Play the appropriate combo sound based on the number of chain-merges
 * that occurred when a piece locked.
 * chainCount === 0  → no merge, no sound
 * chainCount === 1  → combo_x1
 * chainCount === 2  → combo_x2
 * chainCount === 3  → combo_x3
 * chainCount === 4  → combo_x4
 * chainCount >= 5   → combo_x5plus
 */
export function playCombo(chainCount) {
  if (chainCount <= 0) return;
  if (chainCount === 1) play(sounds.combo_x1);
  else if (chainCount === 2) play(sounds.combo_x2);
  else if (chainCount === 3) play(sounds.combo_x3);
  else if (chainCount === 4) play(sounds.combo_x4);
  else                       play(sounds.combo_x5);
}

/** Play the level-up fanfare. */
export function playLevelUp() {
  play(sounds.level_up);
}

/** Play the button-click sound. */
export function playClick() {
  play(sounds.click);
}

/** Play the button-hover sound. */
export function playHover() {
  play(sounds.hover);
}
