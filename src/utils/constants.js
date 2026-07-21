export const COLS = 6;
export const ROWS = 15;
export const SPAWN_COL = 2; // center-left

// All powers of 2 the game uses
export const ALL_VALUES = [
  2, 4, 8, 16, 32, 64, 128, 256, 512, 1024,
  2048, 4096, 8192, 16384, 32768, 65536, 131072,
];

// Score thresholds for single-player level ups
// threshold[n] = cumulative score needed to reach level n
export function levelThreshold(n) {
  if (n === 0) return 0;
  // Each level needs 300 * 2^(n-1) more points than previous
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += 300 * Math.pow(2, i - 1);
  }
  return total;
}

export function getDropInterval(level) {
  if (level === 0) return null; // no auto-drop at level 0
  const ms = Math.max(1000, 10000 - level * 250);
  return ms;
}

export const MAX_LEVEL = 36; // level 36 -> 10 - 36*0.25 = 1s (minimum)
