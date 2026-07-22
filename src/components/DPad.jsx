import React, { useCallback, useRef } from 'react';

const COOLDOWN_MS = 100;

// Touch-friendly D-pad for mobile controls.
// Uses onTouchStart for zero-delay response on mobile.
// Each button has a 100ms cooldown to prevent accidental double-fires.
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
    <div className="dpad">
      {/* Top row: hard drop */}
      <div className="dpad-row">
        <div className="dpad-spacer" />
        <button
          className="dpad-btn dpad-up"
          onTouchStart={makeHandler(onHardDrop, 'up')}
          onClick={makeHandler(onHardDrop, 'up')}
          aria-label="Hard drop"
        >
          ▲▲
        </button>
        <div className="dpad-spacer" />
      </div>

      {/* Middle row: left, soft drop, right */}
      <div className="dpad-row">
        <button
          className="dpad-btn dpad-left"
          onTouchStart={makeHandler(onLeft, 'left')}
          onClick={makeHandler(onLeft, 'left')}
          aria-label="Move left"
        >
          ◀
        </button>
        <button
          className="dpad-btn dpad-center"
          onTouchStart={makeHandler(onSoftDrop, 'down')}
          onClick={makeHandler(onSoftDrop, 'down')}
          aria-label="Soft drop"
        >
          ▼
        </button>
        <button
          className="dpad-btn dpad-right"
          onTouchStart={makeHandler(onRight, 'right')}
          onClick={makeHandler(onRight, 'right')}
          aria-label="Move right"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
