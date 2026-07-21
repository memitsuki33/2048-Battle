import React, { useRef, useEffect } from 'react';
import { ROWS, COLS } from '../utils/constants.js';
import { getTileColor, formatValue } from '../utils/colors.js';
import { getGhostRow } from '../utils/gameLogic.js';

export default function GameBoard({ state }) {
  const { board, currentPiece, gameOver, mergeFlash } = state;
  const prevMergeFlash = useRef(mergeFlash);
  const flashRef = useRef(null);

  // Track merge flash for animation triggers
  const didMerge = mergeFlash !== prevMergeFlash.current;
  useEffect(() => {
    prevMergeFlash.current = mergeFlash;
  });

  // Compute ghost position
  const ghostRow = currentPiece ? getGhostRow(board, currentPiece) : null;

  // Build display grid: start from board values, overlay piece and ghost
  const cells = Array(ROWS).fill(null).map((_, r) =>
    Array(COLS).fill(null).map((_, c) => {
      let value = board[r][c];
      let type = 'board';
      if (value === -1) type = 'garbage';
      else if (value === 0) type = 'empty';

      // Ghost
      if (
        currentPiece &&
        ghostRow !== null &&
        r === ghostRow &&
        c === currentPiece.col &&
        ghostRow !== currentPiece.row &&
        board[r][c] === 0
      ) {
        return { value: currentPiece.value, type: 'ghost' };
      }

      // Active piece
      if (currentPiece && r === currentPiece.row && c === currentPiece.col) {
        return { value: currentPiece.value, type: 'piece' };
      }

      return { value, type };
    })
  );

  return (
    <div className="board-outer" ref={flashRef}>
      <div className="board-grid">
        {cells.map((row, r) =>
          row.map((cell, c) => {
            const { value, type } = cell;
            const color = getTileColor(value);
            const label = formatValue(value);
            const isLong = label.length >= 4;

            let className = 'cell';
            if (type === 'empty') className += ' cell-empty';
            else if (type === 'ghost') className += ' cell-ghost';
            else if (type === 'piece') className += ' cell-piece';
            else if (type === 'garbage') className += ' cell-garbage';

            return (
              <div
                key={`${r}-${c}`}
                className={className}
                style={
                  type !== 'empty' && type !== 'garbage'
                    ? { backgroundColor: color.bg, color: color.text }
                    : undefined
                }
              >
                {type !== 'empty' && type !== 'garbage' && (
                  <span className={`cell-value${isLong ? ' long' : ''}`}>
                    {label}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
      {gameOver && (
        <div className="gameover-overlay">
          <div className="gameover-title">GAME OVER</div>
          <div className="gameover-score">Score: {state.score.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
}
