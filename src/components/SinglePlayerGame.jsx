import React, { useEffect, useCallback } from 'react';
import { useGameEngine } from '../hooks/useGameEngine.js';
import GameBoard from './GameBoard.jsx';
import InfoPanel from './InfoPanel.jsx';

export default function SinglePlayerGame({ onBack }) {
  const { state, moveLeft, moveRight, softDrop, hardDrop, restart } = useGameEngine({
    startLevel: 0,
    mode: 'single',
  });

  // Keyboard controls
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
        case 'a':
        case 'A':
          moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          moveRight();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          softDrop();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          hardDrop();
          break;
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
        </div>
        <GameBoard state={state} />
        {state.gameOver && (
          <button className="btn btn-primary btn-sm" onClick={() => restart(0)}>
            Play Again (R)
          </button>
        )}
      </div>

      <InfoPanel state={state} mode="single" />
    </div>
  );
}
