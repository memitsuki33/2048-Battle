import React, { useState, useEffect, useRef } from 'react';

function getWsUrl() {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.host}/game-ws`;
}

export default function MobileLobby({ onBack, onStart }) {
  const [level, setLevel] = useState(0);
  const [phase, setPhase] = useState('menu'); // menu | creating | waiting | joining | error
  const [roomCode, setRoomCode] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const wsRef = useRef(null);

  // Clean up WS on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  function openWs(onMessage) {
    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;
    ws.onmessage = (e) => {
      let msg;
      try { msg = JSON.parse(e.data); } catch { return; }
      onMessage(ws, msg);
    };
    ws.onerror = () => {
      setPhase('error');
      setErrorMsg('Connection failed. Make sure you are online.');
    };
    ws.onclose = () => {
      if (phase === 'waiting') {
        setPhase('error');
        setErrorMsg('Disconnected. Please try again.');
      }
    };
    return ws;
  }

  function handleCreate() {
    setPhase('creating');
    setErrorMsg('');
    const ws = openWs((ws, msg) => {
      if (msg.type === 'created') {
        setRoomCode(msg.code);
        setPhase('waiting');
      }
      if (msg.type === 'start') {
        onStart({ ws, level, playerIndex: msg.playerIndex });
      }
      if (msg.type === 'error') {
        setPhase('error');
        setErrorMsg(msg.message);
      }
    });
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'create', level }));
    };
  }

  function handleJoin() {
    const code = joinInput.trim().toUpperCase();
    if (code.length !== 4) {
      setErrorMsg('Enter the 4-letter room code.');
      return;
    }
    setPhase('joining');
    setErrorMsg('');
    const ws = openWs((ws, msg) => {
      if (msg.type === 'joined') {
        setPhase('waiting');
        setRoomCode(code);
      }
      if (msg.type === 'start') {
        onStart({ ws, level: msg.level ?? level, playerIndex: msg.playerIndex });
      }
      if (msg.type === 'error') {
        setPhase('menu');
        setErrorMsg(msg.message);
        ws.close();
      }
    });
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', code }));
    };
  }

  function handleBack() {
    if (wsRef.current) wsRef.current.close();
    if (phase === 'menu' || phase === 'error') {
      onBack();
    } else {
      setPhase('menu');
      setRoomCode('');
      setJoinInput('');
      setErrorMsg('');
    }
  }

  return (
    <div className="mobile-lobby">
      <div className="back-row">
        <button className="btn btn-ghost btn-sm" onClick={handleBack}>Back</button>
        <span className="lobby-title">Battle (Mobile)</span>
      </div>

      {(phase === 'menu' || phase === 'creating' || phase === 'joining') && (
        <>
          <div className="lobby-level-row">
            <span className="lobby-label">Start Level</span>
            <div className="level-stepper">
              <button className="btn btn-ghost" onClick={() => setLevel(l => Math.max(0, l - 1))}>−</button>
              <span className="level-value">{level}</span>
              <button className="btn btn-ghost" onClick={() => setLevel(l => Math.min(36, l + 1))}>+</button>
            </div>
          </div>

          <div className="lobby-divider" />

          <div className="lobby-section">
            <button
              className="btn btn-primary lobby-wide-btn"
              onClick={handleCreate}
              disabled={phase !== 'menu'}
            >
              {phase === 'creating' ? 'Connecting...' : 'Create Room'}
            </button>
          </div>

          <div className="lobby-or">— or —</div>

          <div className="lobby-section lobby-join-row">
            <input
              className="lobby-code-input"
              placeholder="Room code"
              maxLength={4}
              value={joinInput}
              onChange={e => setJoinInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              disabled={phase !== 'menu'}
            />
            <button
              className="btn btn-secondary"
              onClick={handleJoin}
              disabled={phase !== 'menu'}
            >
              {phase === 'joining' ? '...' : 'Join'}
            </button>
          </div>

          {errorMsg && <div className="lobby-error">{errorMsg}</div>}
        </>
      )}

      {phase === 'waiting' && (
        <div className="lobby-waiting">
          <div className="lobby-code-display">
            <span className="lobby-label">Room Code</span>
            <span className="lobby-code-big">{roomCode}</span>
            <span className="lobby-label">Share this with your opponent</span>
          </div>
          <div className="lobby-spinner" />
          <span className="lobby-label">Waiting for opponent to join...</span>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }} onClick={handleBack}>
            Cancel
          </button>
        </div>
      )}

      {phase === 'error' && (
        <div className="lobby-waiting">
          <div className="lobby-error" style={{ fontSize: '1rem', textAlign: 'center' }}>{errorMsg}</div>
          <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={handleBack}>Go Back</button>
        </div>
      )}
    </div>
  );
}
