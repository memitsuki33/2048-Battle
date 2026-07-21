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
  if (level === 0) return null; // level 0 = permanent, no auto-drop
  // Level 1 = 3000ms, each level subtracts 50ms
  return Math.max(50, 3000 - (level - 1) * 50);
}

export const MAX_LEVEL = 60; // level 60 -> 3000 - 59*50 = 50ms (minimum)
