import React, { useCallback } from 'react';

// Touch-friendly D-pad for mobile controls.
// Uses onTouchStart for zero-delay response on mobile.
export default function DPad({ onLeft, onRight, onSoftDrop, onHardDrop }) {
  const makeHandler = useCallback((fn) => (e) => {
    e.preventDefault();
    fn();
  }, []);

  return (
    <div className="dpad">
      {/* Top row: hard drop */}
      <div className="dpad-row">
        <div className="dpad-spacer" />
        <button
          className="dpad-btn dpad-up"
          onTouchStart={makeHandler(onHardDrop)}
          onClick={onHardDrop}
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
          onTouchStart={makeHandler(onLeft)}
          onClick={onLeft}
          aria-label="Move left"
        >
          ◀
        </button>
        <button
          className="dpad-btn dpad-center"
          onTouchStart={makeHandler(onSoftDrop)}
          onClick={onSoftDrop}
          aria-label="Soft drop"
        >
          ▼
        </button>
        <button
          className="dpad-btn dpad-right"
          onTouchStart={makeHandler(onRight)}
          onClick={onRight}
          aria-label="Move right"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
