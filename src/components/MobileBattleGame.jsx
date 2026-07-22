import React, { useEffect, useRef, useCallback } from 'react';
import { useGameEngine } from '../hooks/useGameEngine.js';
import GameBoard from './GameBoard.jsx';
import InfoPanel from './InfoPanel.jsx';
import DPad from './DPad.jsx';
import { formatValue, formatScore } from '../utils/colors.js';
import { playGarbageSend, playGarbageReceive } from '../utils/soundEffects.js';

export default function MobileBattleGame({ ws, level, playerIndex, onBack }) {
  const engine = useGameEngine({ startLevel: level, mode: 'battle' });
  const garbageSentRef = useRef(0);

  // Track opponent state
  const [oppState, setOppState] = React.useState({ score: 0, gameOver: false, pendingIncoming: 0 });

  // Send garbage to opponent when we generate some
  useEffect(() => {
    const sent = engine.state.totalGarbageSent;
    const newRows = sent - garbageSentRef.current;
    if (newRows > 0 && ws && ws.readyState === 1) {
      playGarbageSend();
      ws.send(JSON.stringify({ type: 'garbage', rows: newRows }));
      garbageSentRef.current = sent;
    }
  }, [engine.state.totalGarbageSent, ws]);

  // Send game over to opponent when we die
  const gameOverSentRef = useRef(false);
  useEffect(() => {
    if (engine.state.gameOver && !gameOverSentRef.current && ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'game_over', score: engine.state.score }));
      gameOverSentRef.current = true;
    }
  }, [engine.state.gameOver, engine.state.score, ws]);

  // Send score updates periodically
  const prevScoreRef = useRef(0);
  useEffect(() => {
    const s = engine.state.score;
    if (s !== prevScoreRef.current && ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'score', score: s }));
      prevScoreRef.current = s;
    }
  }, [engine.state.score, ws]);

  // Receive messages from opponent
  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }

      if (msg.type === 'garbage') {
        playGarbageReceive();
        engine.addIncomingGarbage(msg.rows);
        setOppState(s => ({ ...s, pendingIncoming: s.pendingIncoming + msg.rows }));
      }
      if (msg.type === 'game_over') {
        setOppState(s => ({ ...s, gameOver: true, score: msg.score ?? s.score }));
        if (!engine.state.gameOver) {
          engine.forceGameOver();
        }
      }
      if (msg.type === 'score') {
        setOppState(s => ({ ...s, score: msg.score }));
      }
      if (msg.type === 'opponent_left') {
        setOppState(s => ({ ...s, gameOver: true }));
        engine.forceGameOver();
      }
    };
  }, [ws, engine]);

  const handleRestart = useCallback(() => {
    garbageSentRef.current = 0;
    gameOverSentRef.current = false;
    setOppState({ score: 0, gameOver: false, pendingIncoming: 0 });
    engine.restart(level);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'restart' }));
    }
  }, [engine, level, ws]);

  const myDead = engine.state.gameOver;
  const oppDead = oppState.gameOver;
  const gameEnded = myDead || oppDead;

  let resultText = null;
  if (gameEnded) {
    if (myDead && oppDead) resultText = 'DRAW';
    else if (oppDead) resultText = 'YOU WIN';
    else resultText = 'YOU LOSE';
  }

  return (
    <div className="mobile-battle">
      {/* Header */}
      <div className="mobile-battle-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>Back</button>
        <span className="mobile-battle-title">
          {playerIndex === 0 ? 'P1' : 'P2'} — Level {level}
        </span>
        <div className="mobile-opp-status">
          <span className="mobile-opp-label">Opp</span>
          <span className={`mobile-opp-score ${oppDead ? 'red' : ''}`}>
            {oppDead ? 'OUT' : formatValue(oppState.score)}
          </span>
        </div>
      </div>

      {/* Result banner — fixed so it doesn't shift the board */}
      {resultText && (
        <div className={`win-banner ${resultText === 'YOU WIN' ? '' : resultText === 'DRAW' ? 'draw' : 'lose'}`}
          style={{ position: 'fixed', top: 52, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
          {resultText}
        </div>
      )}

      {/* Game area */}
      <div className="mobile-game-area">
        <InfoPanel
          state={engine.state}
          mode="battle"
          pendingGarbage={engine.state.pendingIncoming}
        />
        <GameBoard state={engine.state} animSpeed="normal" />
      </div>

      {/* D-pad / rematch — fixed height so the board never shifts */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 148 }}>
        {gameEnded ? (
          <button className="btn btn-primary mobile-restart-btn" onClick={handleRestart}>
            Rematch
          </button>
        ) : (
          <DPad
            onLeft={engine.moveLeft}
            onRight={engine.moveRight}
            onSoftDrop={engine.softDrop}
            onHardDrop={engine.hardDrop}
          />
        )}
      </div>
    </div>
  );
}
