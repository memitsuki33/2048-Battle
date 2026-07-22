import React, { useState } from 'react';
import { useGameEngine } from '../hooks/useGameEngine.js';
import GameBoard from './GameBoard.jsx';
import InfoPanel from './InfoPanel.jsx';
import DPad from './DPad.jsx';

export default function MobileSinglePlayerGame({ onBack }) {
  const { state, moveLeft, moveRight, softDrop, hardDrop, restart } = useGameEngine({
    startLevel: 0,
    mode: 'single',
  });

  const checkpointLevel = Math.floor(state.level / 10) * 10;

  return (
    <div className="mobile-battle">
      {/* Header */}
      <div className="mobile-battle-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>Back</button>
        <span className="mobile-battle-title">Single Player</span>
        <div className="mobile-opp-status">
          <span className="mobile-opp-label">Level</span>
          <span className="mobile-opp-score">{state.level}</span>
        </div>
      </div>

      {/* Game area */}
      <div className="mobile-game-area">
        <InfoPanel state={state} mode="single" />
        <GameBoard state={state} animSpeed="normal" />
      </div>

      {/* D-pad / restart — fixed height so the board never shifts */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 148 }}>
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
