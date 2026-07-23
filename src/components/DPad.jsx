import React, { useCallback, useRef } from 'react';
import { playMove, playHardDrop } from '../utils/soundEffects.js';

const COOLDOWN_MS = 150;

// Touch-friendly D-pad for mobile controls.
// Single horizontal row: [Hard Drop] [Left] [Soft Drop] [Right]
export default function DPad({ onLeft, onRight, onSoftDrop, onHardDrop }) {
  const lastFired = useRef({});

  const makeHandler = useCallback((fn, key) => (e) => {
    e.preventDefault();
    const now = Date.now();
    if (lastFired.current[key] && now - lastFired.current[key] < COOLDOWN_MS) return;
    lastFired.current[key] = now;
    fn();
  }, []);

  return (
    <div className="dpad dpad-horizontal">
      <button
        className="dpad-btn dpad-up"
        onTouchStart={makeHandler(() => { playHardDrop(); onHardDrop(); }, 'up')}
        onClick={makeHandler(() => { playHardDrop(); onHardDrop(); }, 'up')}
        aria-label="Hard drop"
      >
        ▲▲
      </button>
      <button
        className="dpad-btn"
        onTouchStart={makeHandler(() => { playMove(); onLeft(); }, 'left')}
        onClick={makeHandler(() => { playMove(); onLeft(); }, 'left')}
        aria-label="Move left"
      >
        ◀
      </button>
      <button
        className="dpad-btn"
        onTouchStart={makeHandler(onSoftDrop, 'down')}
        onClick={makeHandler(onSoftDrop, 'down')}
        aria-label="Soft drop"
      >
        ▼
      </button>
      <button
        className="dpad-btn"
        onTouchStart={makeHandler(() => { playMove(); onRight(); }, 'right')}
        onClick={makeHandler(() => { playMove(); onRight(); }, 'right')}
        aria-label="Move right"
      >
        ▶
      </button>
    </div>
  );
}
