import React from 'react';
import { playClick, playHover } from '../utils/soundEffects.js';

export default function MenuScreen({ onSinglePlayerPC, onSinglePlayerMobile, onBattlePC, onBattleMobile, onTutorial }) {
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
      </div>
    </div>
  );
}
