import React from 'react';

export default function MenuScreen({ onSinglePlayer, onBattle }) {
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
        <button className="btn btn-secondary" onClick={onBattle}>
          Battle (2 Players)
        </button>
      </div>
      <div className="controls-hint" style={{ maxWidth: 320, lineHeight: 1.9 }}>
        <strong>Merging:</strong> Connect 2+ same tiles to merge them<br />
        2 tiles = double &nbsp; 3 tiles = 4x &nbsp; 4 tiles = 8x &nbsp; 5 tiles = 16x<br />
        <strong>Battle:</strong> Chain combos send garbage to opponent
      </div>
    </div>
  );
}
