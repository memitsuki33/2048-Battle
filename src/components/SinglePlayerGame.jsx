import React, { useEffect, useCallback, useState } from 'react';
import { useGameEngine } from '../hooks/useGameEngine.js';
import GameBoard from './GameBoard.jsx';
import InfoPanel from './InfoPanel.jsx';
import SettingsModal from './SettingsModal.jsx';
import { playMove, playHardDrop } from '../utils/soundEffects.js';

function isMobile() {
  return (
    typeof window !== 'undefined' &&
    (navigator.maxTouchPoints > 0 || window.innerWidth < 768)
  );
}

export default function SinglePlayerGame({ onBack, animSpeed = 'normal', onAnimSpeed }) {
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

  const [showSettings, setShowSettings] = useState(false);

  // Checkpoint: nearest multiple of 5 (floor), min 5
  const checkpointLevel = Math.floor(state.level / 5) * 5;

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
    <>
      {/* Back — fixed top-left */}
      <button
        className="btn btn-ghost btn-sm"
        style={{ position: 'fixed', top: 12, left: 12, zIndex: 50 }}
        onClick={onBack}
      >
        Back
      </button>

      {/* Settings — fixed top-right */}
      <button
        className="btn btn-ghost btn-sm"
        style={{ position: 'fixed', top: 12, right: 12, zIndex: 50 }}
        onClick={() => setShowSettings(true)}
      >
        Settings
      </button>

      <div className="game-wrapper">
        <div className="player-section">
          <GameBoard state={state} animSpeed={animSpeed} />
        </div>
        <InfoPanel state={state} mode="single" />
      </div>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          animSpeed={animSpeed}
          onAnimSpeed={onAnimSpeed}
          onReset={() => restart(0)}
          checkpointLevel={checkpointLevel}
          onLoadLevel={(lv) => restart(lv)}
        />
      )}
    </>
  );
}
