import React from 'react';

export default function MenuScreen({ onSinglePlayer, onBattlePC, onBattleMobile, onTutorial }) {
  return (
    <div className="menu">
      <div className="menu-title">
        <span>2048</span> Battle
      </div>
      <div className="menu-subtitle">Merge — Combo — Dominate</div>
      <div className="menu-buttons">
        <button className="btn btn-primary" onClick={onSinglePlayer}>
          Single Player
        </button>
        <button className="btn btn-secondary" onClick={onBattlePC}>
          Battle (PC)
        </button>
        <button className="btn btn-mobile" onClick={onBattleMobile}>
          Battle (Mobile)
        </button>
        <button className="btn btn-ghost" onClick={onTutorial}>
          How to Play
        </button>
      </div>
    </div>
  );
}
