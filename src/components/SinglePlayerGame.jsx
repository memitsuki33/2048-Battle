import React, { useEffect, useCallback, useState } from 'react';
import { useGameEngine } from '../hooks/useGameEngine.js';
import GameBoard from './GameBoard.jsx';
import InfoPanel from './InfoPanel.jsx';
import ColorSequenceModal from './ColorSequenceModal.jsx';
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

  const { state, moveLeft, moveRight, softDrop, hardDrop, hold, restart } = useGameEngine({
    startLevel: 0,
    mode: 'single',
  });

  const [showColorGuide, setShowColorGuide] = useState(true);

  const handleKey = useCallback(
    (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (showColorGuide || state.gameOver) return;
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
          playHardDrop(); hardDrop(); break;
        case 'r': case 'R':
          hold(); break;
      }
    },
    [showColorGuide, state.gameOver, moveLeft, moveRight, softDrop, hardDrop, hold]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // Show color guide again on restart
  const handleRestart = useCallback((level) => {
    restart(level ?? 0);
    setShowColorGuide(true);
  }, [restart]);

  return (
    <>
      <button
        className="btn btn-ghost btn-sm"
        style={{ position: 'fixed', top: 12, left: 12, zIndex: 50 }}
        onClick={onBack}
      >
        Back
      </button>

      <div className="game-wrapper">
        <div className="player-section">
          <GameBoard state={state} animSpeed={animSpeed} />
        </div>
        <InfoPanel state={state} mode="single" onRestart={() => handleRestart(0)} />
      </div>

      {showColorGuide && (
        <ColorSequenceModal onClose={() => setShowColorGuide(false)} actionLabel="Play!" />
      )}
    </>
  );
}
