import React, { useState } from 'react';
import { useGameEngine } from '../hooks/useGameEngine.js';
import GameBoard from './GameBoard.jsx';
import DPad from './DPad.jsx';
import ColorSequenceModal from './ColorSequenceModal.jsx';
import { getTileColor, formatScore } from '../utils/colors.js';

export default function MobileSinglePlayerGame({ onBack, animSpeed = 'normal' }) {
  const { state, moveLeft, moveRight, softDrop, hardDrop, restart } = useGameEngine({
    startLevel: 0,
    mode: 'single',
  });

  const [showColorGuide, setShowColorGuide] = useState(true);

  const nextColor = getTileColor(state.nextPieceValue);

  const handleRestart = () => {
    restart(0);
    setShowColorGuide(true);
  };

  return (
    <div className="mobile-battle">

      {/* Board */}
      <div className="mobile-game-area mobile-game-area-full">
        <GameBoard state={state} animSpeed={animSpeed} />
      </div>

      {/* Info row: back + score + level + next */}
      <div className="mobile-bottom-info">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>Back</button>
        <div className="mobile-info-strip">
          <div className="mobile-info-item">
            <span className="mobile-info-val">{formatScore(state.score)}</span>
            <span className="mobile-info-lbl">SCORE</span>
          </div>
          <div className="mobile-info-item">
            <span className="mobile-info-val red">{state.level}</span>
            <span className="mobile-info-lbl">LEVEL</span>
          </div>
          <div className="mobile-info-item">
            <div
              className="mobile-next-mini"
              style={{ backgroundColor: nextColor.bg }}
            />
            <span className="mobile-info-lbl">NEXT</span>
          </div>
        </div>
      </div>

      {/* Controls row */}
      <div className="mobile-controls-row">
        {state.gameOver ? (
          <button className="btn btn-primary mobile-restart-btn" onClick={handleRestart}>
            Restart
          </button>
        ) : (
          <DPad
            onLeft={moveLeft}
            onRight={moveRight}
            onSoftDrop={softDrop}
            onHardDrop={hardDrop}
          />
        )}
      </div>

      {showColorGuide && (
        <ColorSequenceModal onClose={() => setShowColorGuide(false)} actionLabel="Play!" />
      )}
    </div>
  );
}
