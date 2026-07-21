import React, { useState } from 'react';
import { getDropInterval, MAX_LEVEL } from '../utils/constants.js';

function LevelStepper({ label, value, onChange }) {
  const interval = getDropInterval(value);
  const speedLabel =
    value === 0 ? 'No auto-drop' : `Drop every ${(interval / 1000).toFixed(2)}s`;

  return (
    <div className="level-player-col">
      <h3>{label}</h3>
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
  const [p1Level, setP1Level] = useState(0);
  const [p2Level, setP2Level] = useState(0);

  return (
    <div className="level-select-screen">
      <div className="back-row">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>Back</button>
        <h2>{mode === 'battle' ? 'Battle — Choose Levels' : 'Single Player'}</h2>
      </div>

      <div className="level-players">
        {mode === 'battle' ? (
          <>
            <LevelStepper label="Player 1" value={p1Level} onChange={setP1Level} />
            <LevelStepper label="Player 2" value={p2Level} onChange={setP2Level} />
          </>
        ) : (
          <div className="level-player-col">
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 700, textAlign: 'center', maxWidth: 240 }}>
              Start at Level 0. Level increases automatically as your score grows.
            </p>
          </div>
        )}
      </div>

      <button
        className="btn btn-primary"
        onClick={() =>
          mode === 'battle'
            ? onStart({ p1Level, p2Level })
            : onStart({ p1Level: 0 })
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
          <strong>Controls:</strong> Left / Right = move &nbsp; Down = soft drop &nbsp; Up = hard drop
        </div>
      )}
    </div>
  );
}
