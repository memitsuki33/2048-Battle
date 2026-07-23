import React, { useState } from 'react';
import { useGameEngine } from '../hooks/useGameEngine.js';
import GameBoard from './GameBoard.jsx';
import DPad from './DPad.jsx';
import SettingsModal from './SettingsModal.jsx';
import { getTileColor, formatValue, formatScore } from '../utils/colors.js';

export default function MobileSinglePlayerGame({ onBack, animSpeed = 'normal', onAnimSpeed }) {
  const { state, moveLeft, moveRight, softDrop, hardDrop, restart } = useGameEngine({
    startLevel: 0,
    mode: 'single',
  });

  const [showSettings, setShowSettings] = useState(false);

  // Nearest multiple of 5, rounded down
  const checkpointLevel = Math.floor(state.level / 5) * 5;
  const nextColor = getTileColor(state.nextPieceValue);

  return (
    <div className="mobile-battle">

      {/* Board — fills all available vertical space */}
      <div className="mobile-game-area mobile-game-area-full">
        <GameBoard state={state} animSpeed={animSpeed} />
      </div>

      {/* Info row: back + score + level + next + settings */}
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
        <button className="btn btn-ghost btn-sm" onClick={() => setShowSettings(true)}>
          Settings
        </button>
      </div>

      {/* Controls row — DPad always visible; game-over handled via Settings */}
      <div className="mobile-controls-row">
        <DPad
          onLeft={moveLeft}
          onRight={moveRight}
          onSoftDrop={softDrop}
          onHardDrop={hardDrop}
        />
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
    </div>
  );
}
