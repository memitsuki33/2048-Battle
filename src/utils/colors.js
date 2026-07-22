// Colors cycle after 131072 (back to same color as 2)
const COLOR_PALETTE = [
  { bg: '#ee4035', text: '#fff' },   // 2
  { bg: '#f37736', text: '#fff' },   // 4
  { bg: '#8a9c2f', text: '#fff' },   // 8
  { bg: '#6b7a1e', text: '#fff' },   // 16
  { bg: '#4a7c2f', text: '#fff' },   // 32
  { bg: '#2d5a27', text: '#fff' },   // 64
  { bg: '#3d8a80', text: '#fff' },   // 128
  { bg: '#4a9ab0', text: '#fff' },   // 256
  { bg: '#1a5fa8', text: '#fff' },   // 512
  { bg: '#3535b0', text: '#fff' },   // 1024
  { bg: '#7b2d8b', text: '#fff' },   // 2048
  { bg: '#5a1a7a', text: '#fff' },   // 4096
  { bg: '#7a2030', text: '#fff' },   // 8K
  { bg: '#5a1020', text: '#fff' },   // 16K
  { bg: '#3a0a10', text: '#fff' },   // 32K
  { bg: '#0a0a0a', text: '#fff' },   // 65K
  { bg: '#ee4035', text: '#fff' },   // 131K (cycles back to 2's color)
];

export function getTileColor(value) {
  if (value === -1) return { bg: '#888', text: '#555' }; // garbage
  if (value <= 0) return { bg: 'transparent', text: 'transparent' };
  const log2 = Math.round(Math.log2(value));
  const idx = (log2 - 1) % COLOR_PALETTE.length;
  return COLOR_PALETTE[idx];
}

export function formatValue(v) {
  if (v <= 0) return '';
  if (v < 1000) return String(v);
  return `${Math.floor(v / 1000)}K`;
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
      // Show one decimal only when it adds info (e.g. 1.2K, not 10.0K)
      const formatted = val < 10 ? val.toFixed(1) : Math.floor(val).toString();
      return formatted + suffix;
    }
  }
  return String(n);
}
