import React, { useState } from 'react';
import { playClick, playHover } from '../utils/soundEffects.js';

export default function MenuScreen({
  onSinglePlayerPC, onSinglePlayerMobile, onBattlePC, onBattleMobile, onTutorial,
  animSpeed, onAnimSpeed,
}) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="menu">
      <div className="menu-title">
        <span>2048</span> Battle
      </div>
      <div className="menu-subtitle">Merge — Combo — Dominate</div>
      <div className="menu-buttons">
        <button className="btn btn-primary" onMouseEnter={playHover} onClick={() => { playClick(); onSinglePlayerPC(); }}>
          Single Player (PC)
        </button>
        <button className="btn btn-mobile" onMouseEnter={playHover} onClick={() => { playClick(); onSinglePlayerMobile(); }}>
          Single Player (Mobile)
        </button>
        <button className="btn btn-secondary" onMouseEnter={playHover} onClick={() => { playClick(); onBattlePC(); }}>
          Battle (PC)
        </button>
        <button className="btn btn-mobile" onMouseEnter={playHover} onClick={() => { playClick(); onBattleMobile(); }}>
          Battle (Mobile)
        </button>
        <button className="btn btn-ghost" onMouseEnter={playHover} onClick={() => { playClick(); onTutorial(); }}>
          How to Play
        </button>
        <button
          className="btn btn-ghost"
          onMouseEnter={playHover}
          onClick={() => { playClick(); setShowSettings(s => !s); }}
        >
          Settings
        </button>
      </div>

      {showSettings && (
        <div className="settings-panel" style={{ marginTop: 4 }}>
          <span className="settings-label">Animation</span>
          <div className="settings-options">
            {['none', 'normal'].map(opt => (
              <button
                key={opt}
                className={`settings-opt${animSpeed === opt ? ' active' : ''}`}
                onClick={() => onAnimSpeed(opt)}
              >
                {opt === 'none' ? 'No Anim' : 'Anim'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
