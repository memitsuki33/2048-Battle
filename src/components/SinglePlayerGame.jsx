import React, { useEffect, useCallback, useState } from 'react';
import { useGameEngine } from '../hooks/useGameEngine.js';
import GameBoard from './GameBoard.jsx';
import InfoPanel from './InfoPanel.jsx';

const ANIM_OPTIONS = [
  { value: 'none',   label: 'None' },
  { value: 'normal', label: 'Normal' },
  { value: '2x',     label: '2x Faster' },
  { value: '4x',     label: '4x Faster' },
];

export default function SinglePlayerGame({ onBack }) {
  const { state, moveLeft, moveRight, softDrop, hardDrop, restart } = useGameEngine({
    startLevel: 0,
    mode: 'single',
  });

  const [animSpeed, setAnimSpeed] = useState('normal');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleKey = useCallback(
    (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (state.gameOver) {
        if (e.key === 'r' || e.key === 'R') restart(0);
        return;
      }
      switch (e.key) {
        case 'ArrowLeft':
        case 'a': case 'A':
          moveLeft(); break;
        case 'ArrowRight':
        case 'd': case 'D':
          moveRight(); break;
        case 'ArrowDown':
        case 's': case 'S':
          softDrop(); break;
        case 'ArrowUp':
        case 'w': case 'W':
        case ' ':
        case 'r': case 'R':
          hardDrop(); break;
      }
    },
    [state.gameOver, moveLeft, moveRight, softDrop, hardDrop, restart]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className="game-wrapper">
      <div className="player-section">
        <div className="back-row">
          <button className="btn btn-ghost btn-sm" onClick={onBack}>Back</button>
          <span className="player-label">Single Player</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSettingsOpen(o => !o)}
          >
            Settings
          </button>
        </div>

        {settingsOpen && (
          <div className="settings-panel">
            <div className="settings-label">Merge Animation</div>
            <div className="settings-options">
              {ANIM_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`settings-opt${animSpeed === opt.value ? ' active' : ''}`}
                  onClick={() => setAnimSpeed(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <GameBoard state={state} animSpeed={animSpeed} />

        {state.gameOver && (
          <button className="btn btn-primary btn-sm" onClick={() => restart(0)}>
            Play Again
          </button>
        )}
      </div>

      <InfoPanel state={state} mode="single" />
    </div>
  );
}
