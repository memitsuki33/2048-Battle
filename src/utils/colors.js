import { COLOR_LETTERS } from './constants.js';

// ROYGBIV palette — indices 1-7
const COLOR_PALETTE = [
  null,                                        // 0 unused
  { bg: '#e53935', text: '#fff' },             // 1 Red
  { bg: '#f57c00', text: '#fff' },             // 2 Orange
  { bg: '#fdd835', text: '#1a1a1a' },          // 3 Yellow
  { bg: '#43a047', text: '#fff' },             // 4 Green
  { bg: '#1e88e5', text: '#fff' },             // 5 Blue
  { bg: '#3949ab', text: '#fff' },             // 6 Indigo
  { bg: '#8e24aa', text: '#fff' },             // 7 Violet
];

export function getTileColor(value) {
  if (value === -1) return { bg: '#555', text: '#555' }; // garbage
  if (value <= 0 || value > 7) return { bg: 'transparent', text: 'transparent' };
  return COLOR_PALETTE[value];
}

export function formatValue(v) {
  if (v <= 0 || v > 7) return '';
  return COLOR_LETTERS[v];
}

// Format a score number with K / M / B / T / Q suffixes (1 decimal when useful).
export function formatScore(n) {
  if (n == null || isNaN(n)) return '0';
  const abs = Math.abs(n);
  const tiers = [
    { threshold: 1e15, suffix: 'Q' },
    { threshold: 1e12, suffix: 'T' },
    { threshold: 1e9,  suffix: 'B' },
    { threshold: 1e6,  suffix: 'M' },
    { threshold: 1e3,  suffix: 'K' },
  ];
  for (const { threshold, suffix } of tiers) {
    if (abs >= threshold) {
      const val = n / threshold;
      const formatted = val < 10 ? val.toFixed(1) : Math.floor(val).toString();
      return formatted + suffix;
    }
  }
  return String(n);
}
