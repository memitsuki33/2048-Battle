// Sound Effect
// Centralised audio module — import and call these functions anywhere in the game.

const sounds = {
  move:      new Audio('/sounds/move.wav'),
  hard_drop: new Audio('/sounds/hard_drop.wav'),
  merge:     new Audio('/sounds/merge.wav'),
  combo_x2:  new Audio('/sounds/combo_x2.wav'),
  combo_x3:  new Audio('/sounds/combo_x3.wav'),
  combo_x4:  new Audio('/sounds/combo_x4.wav'),
  combo_x5:  new Audio('/sounds/combo_x5plus.wav'),
  level_up:  new Audio('/sounds/level_up.wav'),
  click:     new Audio('/sounds/click.wav'),
  hover:     new Audio('/sounds/hover.wav'),
};

// Volume adjustments
sounds.move.volume      = 0.45;
sounds.hard_drop.volume = 0.6;
sounds.merge.volume     = 0.55;
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

/** Play the merge sound — fires on every piece lock that causes any merge. */
export function playMerge() {
  play(sounds.merge);
}

/**
 * Play the combo sound based on the current mergeStreak (consecutive merging placements).
 * Only called when mergeStreak >= 2 (i.e. when the combo text is shown).
 * mergeStreak === 2  → combo_x2
 * mergeStreak === 3  → combo_x3
 * mergeStreak === 4  → combo_x4
 * mergeStreak >= 5   → combo_x5plus
 */
export function playCombo(mergeStreak) {
  if (mergeStreak < 2) return;
  if (mergeStreak === 2) play(sounds.combo_x2);
  else if (mergeStreak === 3) play(sounds.combo_x3);
  else if (mergeStreak === 4) play(sounds.combo_x4);
  else                        play(sounds.combo_x5);
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
