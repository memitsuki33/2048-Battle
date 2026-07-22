import React, { useEffect, useCallback, useState } from 'react';
import { useGameEngine } from '../hooks/useGameEngine.js';
import GameBoard from './GameBoard.jsx';
import InfoPanel from './InfoPanel.jsx';
import { playMove, playHardDrop } from '../utils/soundEffects.js';

function isMobile() {
  return (
    typeof window !== 'undefined' &&
    (navigator.maxTouchPoints > 0 || window.innerWidth < 768)
  );
}

export default function SinglePlayerGame({ onBack }) {
  if (isMobile()) {
    return (
      <div className="mobile-pc-block">
        <div className="mobile-pc-icon">🎮</div>
        <div className="mobile-pc-title">PC Only</div>
        <div className="mobile-pc-msg">
          Single Player (PC) uses keyboard controls.
          Use <strong>Single Player (Mobile)</strong> to play on your phone.
        </div>
        <button className="btn btn-ghost" onClick={onBack}>Back to Menu</button>
      </div>
    );
  }
  const { state, moveLeft, moveRight, softDrop, hardDrop, restart } = useGameEngine({
    startLevel: 0,
    mode: 'single',
  });

  const [animSpeed, setAnimSpeed] = useState('normal');

  // Checkpoint level: floor to nearest 10 (e.g. level 17 → continue from 10)
  const checkpointLevel = Math.floor(state.level / 10) * 10;

  const handleKey = useCallback(
    (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (state.gameOver) return;
      switch (e.key) {
        case 'ArrowLeft':
        case 'a': case 'A':
          playMove(); moveLeft(); break;
        case 'ArrowRight':
        case 'd': case 'D':
          playMove(); moveRight(); break;
        case 'ArrowDown':
        case 's': case 'S':
          softDrop(); break;
        case 'ArrowUp':
        case 'w': case 'W':
        case ' ':
        case 'r': case 'R':
          playHardDrop(); hardDrop(); break;
      }
    },
    [state.gameOver, moveLeft, moveRight, softDrop, hardDrop]
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
          {/* Inline animation toggle */}
          <div style={{ display: 'flex', gap: 4 }}>
            {['none', 'normal'].map(opt => (
              <button
                key={opt}
                className={`settings-opt${animSpeed === opt ? ' active' : ''}`}
                onClick={() => setAnimSpeed(opt)}
                style={{ fontSize: '0.65rem', padding: '3px 8px' }}
              >
                {opt === 'none' ? 'No Anim' : 'Anim'}
              </button>
            ))}
          </div>
        </div>

        <GameBoard state={state} animSpeed={animSpeed} />

        {state.gameOver && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={() => restart(0)}>
              Restart — Level 0
            </button>
            {checkpointLevel > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={() => restart(checkpointLevel)}>
                Continue — Level {checkpointLevel}
              </button>
            )}
          </div>
        )}
      </div>

      <InfoPanel state={state} mode="single" />
    </div>
  );
}
