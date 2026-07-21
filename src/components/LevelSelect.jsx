import React, { useState } from 'react';
import { getDropInterval, MAX_LEVEL } from '../utils/constants.js';

function LevelStepper({ value, onChange }) {
  const interval = getDropInterval(value);
  const speedLabel =
    value === 0 ? 'No auto-drop' : `Drop every ${(interval / 1000).toFixed(2)}s`;

  return (
    <div className="level-player-col">
      <div className="level-stepper">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          -
        </button>
        <div className="level-value">{value}</div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onChange(Math.min(MAX_LEVEL, value + 1))}
        >
          +
        </button>
      </div>
      <div className="level-speed-label">{speedLabel}</div>
    </div>
  );
}

export default function LevelSelect({ mode, onStart, onBack }) {
  const [level, setLevel] = useState(0);

  return (
    <div className="level-select-screen">
      <div className="back-row">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>Back</button>
        <h2>{mode === 'battle' ? 'Battle Mode' : 'Single Player'}</h2>
      </div>

      <div className="level-players">
        {mode === 'battle' ? (
          <div className="level-player-col">
            <h3>Starting Level</h3>
            <LevelStepper value={level} onChange={setLevel} />
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', maxWidth: 220, marginTop: 4 }}>
              Both players start at the same level.
            </p>
          </div>
        ) : (
          <div className="level-player-col">
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center', maxWidth: 240 }}>
              Always starts at Level 0.<br />
              Level rises automatically as your score grows.
            </p>
          </div>
        )}
      </div>

      <button
        className="btn btn-primary"
        onClick={() =>
          mode === 'battle'
            ? onStart({ level })
            : onStart({})
        }
      >
        Start Game
      </button>

      {mode === 'battle' && (
        <div className="controls-hint" style={{ lineHeight: 1.9 }}>
          <strong>Player 1:</strong> A / D = move &nbsp; S = soft drop &nbsp; W = hard drop<br />
          <strong>Player 2:</strong> Left / Right = move &nbsp; Down = soft drop &nbsp; Up = hard drop
        </div>
      )}
      {mode === 'single' && (
        <div className="controls-hint" style={{ lineHeight: 1.9 }}>
          <strong>Controls:</strong> Left / Right (or A/D) = move &nbsp; Down/S = soft drop &nbsp; Up/W/Space = hard drop
        </div>
      )}
    </div>
  );
}
