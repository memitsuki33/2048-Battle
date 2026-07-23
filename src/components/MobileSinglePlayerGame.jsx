import React from 'react';
import { useGameEngine } from '../hooks/useGameEngine.js';
import GameBoard from './GameBoard.jsx';
import DPad from './DPad.jsx';
import { getTileColor, formatValue, formatScore } from '../utils/colors.js';

export default function MobileSinglePlayerGame({ onBack }) {
  const { state, moveLeft, moveRight, softDrop, hardDrop, restart } = useGameEngine({
    startLevel: 0,
    mode: 'single',
  });

  const checkpointLevel = Math.floor(state.level / 10) * 10;
  const nextColor = getTileColor(state.nextPieceValue);

  return (
    <div className="mobile-battle">

      {/* Board — fills all available vertical space */}
      <div className="mobile-game-area mobile-game-area-full">
        <GameBoard state={state} animSpeed="normal" />
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
              style={{ backgroundColor: nextColor.bg, color: nextColor.text }}
            >
              {formatValue(state.nextPieceValue)}
            </div>
            <span className="mobile-info-lbl">NEXT</span>
          </div>
        </div>
      </div>

      {/* Controls row */}
      <div className="mobile-controls-row">
        {state.gameOver ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => restart(0)}>
              Restart — Lv 0
            </button>
            {checkpointLevel > 0 && (
              <button className="btn btn-secondary btn-sm" onClick={() => restart(checkpointLevel)}>
                Continue — Lv {checkpointLevel}
              </button>
            )}
          </div>
        ) : (
          <DPad
            onLeft={moveLeft}
            onRight={moveRight}
            onSoftDrop={softDrop}
            onHardDrop={hardDrop}
          />
        )}
      </div>
    </div>
  );
}
