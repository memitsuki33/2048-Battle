import { useReducer, useEffect, useRef, useCallback } from 'react';
import { gameReducer, createInitialState } from '../utils/gameLogic.js';
import { getDropInterval, levelThreshold, MAX_LEVEL } from '../utils/constants.js';

export function useGameEngine({ startLevel, mode = 'single' }) {
  const [state, dispatch] = useReducer(
    gameReducer,
    startLevel,
    createInitialState
  );

  const stateRef = useRef(state);
  stateRef.current = state;

  // Auto-drop timer
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (state.gameOver) return;

    const interval = getDropInterval(state.level);
    if (!interval) return;

    timerRef.current = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.level, state.gameOver]);

  // Single player: level up based on score
  useEffect(() => {
    if (mode !== 'single') return;
    const { score, level } = state;
    if (level >= MAX_LEVEL) return;
    if (score >= levelThreshold(level + 1)) {
      dispatch({ type: 'LEVEL_UP' });
    }
  }, [state.score, state.level, mode]);

  const moveLeft  = useCallback(() => dispatch({ type: 'MOVE_LEFT' }), []);
  const moveRight = useCallback(() => dispatch({ type: 'MOVE_RIGHT' }), []);
  const softDrop  = useCallback(() => dispatch({ type: 'SOFT_DROP' }), []);
  const hardDrop  = useCallback(() => dispatch({ type: 'HARD_DROP' }), []);
  const restart   = useCallback((level) => dispatch({ type: 'RESTART', level: level ?? startLevel }), [startLevel]);
  const receiveGarbage = useCallback((rows, garbageValue) => dispatch({ type: 'RECEIVE_GARBAGE', rows, garbageValue }), []);

  return {
    state,
    moveLeft,
    moveRight,
    softDrop,
    hardDrop,
    restart,
    receiveGarbage,
  };
}
