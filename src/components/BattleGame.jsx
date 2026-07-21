import React, { useEffect, useCallback, useRef } from 'react';
import { useGameEngine } from '../hooks/useGameEngine.js';
import GameBoard from './GameBoard.jsx';
import InfoPanel from './InfoPanel.jsx';

export default function BattleGame({ p1Level, p2Level, onBack }) {
  const p1 = useGameEngine({ startLevel: p1Level, mode: 'battle' });
  const p2 = useGameEngine({ startLevel: p2Level, mode: 'battle' });

  const p1GarbageProcessed = useRef(0);
  const p2GarbageProcessed = useRef(0);

  // P1 sends garbage to P2
  useEffect(() => {
    const sent = p1.state.totalGarbageSent;
    const newRows = sent - p1GarbageProcessed.current;
    if (newRows > 0 && !p2.state.gameOver) {
      p2.receiveGarbage(newRows);
      p1GarbageProcessed.current = sent;
    }
  }, [p1.state.totalGarbageSent]);

  // P2 sends garbage to P1
  useEffect(() => {
    const sent = p2.state.totalGarbageSent;
    const newRows = sent - p2GarbageProcessed.current;
    if (newRows > 0 && !p1.state.gameOver) {
      p1.receiveGarbage(newRows);
      p2GarbageProcessed.current = sent;
    }
  }, [p2.state.totalGarbageSent]);

  const p1Dead = p1.state.gameOver;
  const p2Dead = p2.state.gameOver;
  const gameEnded = p1Dead || p2Dead;
  const winner = p1Dead && p2Dead ? 'Draw' : p1Dead ? 'Player 2' : p2Dead ? 'Player 1' : null;

  const handleKey = useCallback(
    (e) => {
      const key = e.key;
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(key)) {
        e.preventDefault();
      }

      // Rematch on Enter when game ended
      if ((key === 'Enter') && gameEnded) {
        p1GarbageProcessed.current = 0;
        p2GarbageProcessed.current = 0;
        p1.restart(p1Level);
        p2.restart(p2Level);
        return;
      }

      // P1: WASD + R for hard drop
      if (!p1.state.gameOver) {
        switch (key) {
          case 'a': case 'A': p1.moveLeft(); break;
          case 'd': case 'D': p1.moveRight(); break;
          case 's': case 'S': p1.softDrop(); break;
          case 'w': case 'W': p1.hardDrop(); break;
          case 'r': case 'R': p1.hardDrop(); break;
        }
      }

      // P2: Arrow keys + Spacebar for hard drop
      if (!p2.state.gameOver) {
        switch (key) {
          case 'ArrowLeft':  p2.moveLeft(); break;
          case 'ArrowRight': p2.moveRight(); break;
          case 'ArrowDown':  p2.softDrop(); break;
          case 'ArrowUp':    p2.hardDrop(); break;
          case ' ':          p2.hardDrop(); break;
        }
      }
    },
    [p1, p2, gameEnded, p1Level, p2Level]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const handleRestart = () => {
    p1GarbageProcessed.current = 0;
    p2GarbageProcessed.current = 0;
    p1.restart(p1Level);
    p2.restart(p2Level);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div className="back-row">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>Back</button>
        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
          Battle
        </span>
        {gameEnded && (
          <button className="btn btn-primary btn-sm" onClick={handleRestart}>
            Rematch (Enter)
          </button>
        )}
      </div>

      {winner && (
        <div style={{
          background: '#0a180a', border: '2px solid #4a7c2f',
          borderRadius: 8, padding: '10px 28px',
          fontWeight: 900, fontSize: '1.2rem', color: '#ee4035', letterSpacing: 1,
        }}>
          {winner === 'Draw' ? 'DRAW' : `${winner.toUpperCase()} WINS`}
        </div>
      )}

      <div className="battle-wrapper">
        {/* Player 1 */}
        <div className="player-section p1-section">
          <span className="player-label p1">Player 1 — A/D S/W/R</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <InfoPanel
              state={p1.state}
              mode="battle"
              pendingGarbage={p2.state.totalGarbageSent - p1GarbageProcessed.current}
            />
            <GameBoard state={p1.state} animSpeed="normal" />
          </div>
        </div>

        <div className="battle-vs">
          <div className="vs-label">VS</div>
        </div>

        {/* Player 2 */}
        <div className="player-section p2-section">
          <span className="player-label p2">Player 2 — Arrows / Space</span>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <GameBoard state={p2.state} animSpeed="normal" />
            <InfoPanel
              state={p2.state}
              mode="battle"
              pendingGarbage={p1.state.totalGarbageSent - p2GarbageProcessed.current}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
