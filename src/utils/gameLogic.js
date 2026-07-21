import { ROWS, COLS, ALL_VALUES } from './constants.js';

export function emptyBoard() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
}

export function canPlace(board, row, col) {
  if (col < 0 || col >= COLS) return false;
  if (row < 0) return true; // above board during spawn
  if (row >= ROWS) return false;
  return board[row][col] === 0;
}

export function getGhostRow(board, piece) {
  let row = piece.row;
  while (row + 1 < ROWS && board[row + 1][piece.col] === 0) {
    row++;
  }
  return row;
}

export function applyGravity(board) {
  const result = emptyBoard();
  for (let c = 0; c < COLS; c++) {
    let writeRow = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][c] !== 0) {
        result[writeRow][c] = board[r][c];
        writeRow--;
      }
    }
  }
  return result;
}

// Returns true if a row contains any garbage cell (-1).
function isGarbageRow(board, row) {
  for (let c = 0; c < COLS; c++) {
    if (board[row][c] === -1) return true;
  }
  return false;
}

function bfsGroup(board, startRow, startCol, visited) {
  const value = board[startRow][startCol];
  if (value <= 0) return []; // empty or garbage cell
  if (isGarbageRow(board, startRow)) return []; // never merge tiles inside a garbage row

  const group = [];
  const queue = [[startRow, startCol]];

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    const key = r * COLS + c;
    if (visited.has(key)) continue;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
    if (board[r][c] !== value) continue;
    // Mark visited even if we skip (garbage row), so we don't re-process
    if (isGarbageRow(board, r)) { visited.add(key); continue; }
    visited.add(key);
    group.push([r, c]);
    queue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }
  return group;
}

// Process all merges (with cascades). Returns { board, score, chainCount }.
export function processMerges(board) {
  let current = board.map(r => [...r]);
  let totalScore = 0;
  let chainCount = 0;
  let anyMerge = true;

  while (anyMerge) {
    anyMerge = false;
    const visited = new Set();
    const groups = [];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const key = r * COLS + c;
        if (current[r][c] > 0 && !visited.has(key)) {
          const group = bfsGroup(current, r, c, visited);
          if (group.length >= 2) {
            groups.push(group);
          }
        }
      }
    }

    if (groups.length === 0) break;

    anyMerge = true;
    chainCount += groups.length;

    const next = current.map(r => [...r]);

    for (const group of groups) {
      const value = current[group[0][0]][group[0][1]];
      const newValue = value * Math.pow(2, group.length - 1);

      // Find lowest row in group
      let maxRow = -1;
      for (const [r] of group) {
        if (r > maxRow) maxRow = r;
      }
      // Among bottom cells, pick the middle one
      const bottomCells = group.filter(([r]) => r === maxRow);
      bottomCells.sort((a, b) => a[1] - b[1]);
      const targetCell = bottomCells[Math.floor(bottomCells.length / 2)];

      // Clear all cells in group
      for (const [gr, gc] of group) {
        next[gr][gc] = 0;
      }

      // Place merged tile
      next[targetCell[0]][targetCell[1]] = newValue;
      totalScore += newValue;
    }

    current = applyGravity(next);
  }

  return { board: current, score: totalScore, chainCount };
}

// Returns a value to use for the next piece, based on current board state.
// Caps the pool at the 2nd-highest value so the player never receives
// their own top tile as an incoming piece.
export function getNextPieceValue(board) {
  let maxVal = 0;
  let secondMaxVal = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = board[r][c];
      if (v > 0) {
        if (v > maxVal) { secondMaxVal = maxVal; maxVal = v; }
        else if (v > secondMaxVal && v < maxVal) { secondMaxVal = v; }
      }
    }
  }

  if (maxVal === 0) {
    // Empty board: only 2 and 4
    return Math.random() < 0.75 ? 2 : 4;
  }

  // Cap at the 2nd-highest value (or one step below max if board is uniform)
  const poolCap = secondMaxVal > 0 ? secondMaxVal : maxVal / 2;
  const eligible = ALL_VALUES.filter(v => v <= poolCap);
  if (eligible.length === 0) return 2;

  // Pool: top 5 powers of 2 up to poolCap
  const pool = eligible.slice(-5);
  return pool[Math.floor(Math.random() * pool.length)];
}

// Returns the pool of values to use for garbage tiles (top 5 from sender's board, or [2,4] if empty).
export function getGarbagePool(board) {
  let maxVal = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] > maxVal) maxVal = board[r][c];
    }
  }
  if (maxVal === 0) return [2, 4];
  const eligible = ALL_VALUES.filter(v => v <= maxVal);
  return eligible.slice(-5);
}

// Add garbage rows at bottom (shifts board up). Returns { board, gameOver }.
// Garbage cells are -1 (gray, non-mergeable). The gap is empty (0) so it
// never triggers accidental merges that would destroy the gray row.
export function addGarbageRows(board, count) {
  const newBoard = board.map(r => [...r]);

  for (let i = 0; i < count; i++) {
    // If top row has tiles, game over
    if (newBoard[0].some(v => v !== 0)) {
      return { board: newBoard, gameOver: true };
    }

    // Shift all rows up
    for (let r = 0; r < ROWS - 1; r++) {
      newBoard[r] = [...newBoard[r + 1]];
    }

    // Garbage row: gray (-1) cells with one empty gap
    const gapCol = Math.floor(Math.random() * COLS);
    newBoard[ROWS - 1] = Array.from({ length: COLS }, (_, c) =>
      c === gapCol ? 0 : -1
    );
  }

  return { board: newBoard, gameOver: false };
}

// Initial game state factory
export function createInitialState(startLevel) {
  const board = emptyBoard();
  const nextVal = getNextPieceValue(board);
  const pieceVal = getNextPieceValue(board);
  return {
    board,
    currentPiece: { value: pieceVal, col: Math.floor(COLS / 2), row: 0 },
    nextPieceValue: nextVal,
    score: 0,
    level: startLevel,
    startLevel,
    gameOver: false,
    winner: null,
    totalGarbageSent: 0,
    lockFlash: false,
    mergeFlash: 0,
    pendingIncoming: 0,       // garbage queued to land on next piece placement
    pendingIncomingPool: [2], // tile values to use for that garbage
  };
}

export function gameReducer(state, action) {
  if (state.gameOver && action.type !== 'RESTART') {
    return state;
  }

  switch (action.type) {
    case 'RESTART': {
      return createInitialState(action.level ?? state.startLevel);
    }

    case 'MOVE_LEFT': {
      const { currentPiece, board } = state;
      if (!currentPiece) return state;
      const newCol = currentPiece.col - 1;
      if (!canPlace(board, currentPiece.row, newCol)) return state;
      return { ...state, currentPiece: { ...currentPiece, col: newCol } };
    }

    case 'MOVE_RIGHT': {
      const { currentPiece, board } = state;
      if (!currentPiece) return state;
      const newCol = currentPiece.col + 1;
      if (!canPlace(board, currentPiece.row, newCol)) return state;
      return { ...state, currentPiece: { ...currentPiece, col: newCol } };
    }

    case 'SOFT_DROP':
    case 'TICK': {
      const { currentPiece, board } = state;
      if (!currentPiece) return state;
      const nextRow = currentPiece.row + 1;
      if (!canPlace(board, nextRow, currentPiece.col)) {
        return lockPiece(state);
      }
      return { ...state, currentPiece: { ...currentPiece, row: nextRow } };
    }

    case 'HARD_DROP': {
      const { currentPiece, board } = state;
      if (!currentPiece) return state;
      let row = currentPiece.row;
      while (row + 1 < ROWS && board[row + 1][currentPiece.col] === 0) {
        row++;
      }
      return lockPiece({ ...state, currentPiece: { ...currentPiece, row } });
    }

    case 'LEVEL_UP': {
      // Used in single player to auto-advance level
      return { ...state, level: state.level + 1 };
    }

    // Queue incoming garbage — it lands when the receiver places their next piece
    case 'ADD_INCOMING_GARBAGE': {
      return {
        ...state,
        pendingIncoming: state.pendingIncoming + action.rows,
        pendingIncomingPool: action.garbagePool ?? [2],
      };
    }

    case 'FORCE_GAMEOVER': {
      return { ...state, gameOver: true };
    }

    default:
      return state;
  }
}

function lockPiece(state) {
  const {
    currentPiece, board, score, level, startLevel,
    totalGarbageSent, pendingIncoming, pendingIncomingPool,
  } = state;

  // Place piece on board
  const newBoard = board.map(r => [...r]);
  if (currentPiece.row >= 0) {
    newBoard[currentPiece.row][currentPiece.col] = currentPiece.value;
  }

  // Process merges + cascades
  const { board: mergedBoard, score: mergeScore, chainCount } = processMerges(newBoard);

  // Garbage: 1 row per 3 combos (3→1, 6→2, 9→3 …)
  const garbageToSend = Math.floor(chainCount / 3);
  const newTotalGarbage = totalGarbageSent + garbageToSend;
  const newScore = score + mergeScore;

  // Apply queued incoming garbage now that a piece was placed
  let finalBoard = mergedBoard;
  let garbageKill = false;
  if (pendingIncoming > 0) {
    const result = addGarbageRows(mergedBoard, pendingIncoming);
    finalBoard = result.board;
    if (result.gameOver) garbageKill = true;
  }

  // Spawn next piece
  const spawnCol = Math.floor(COLS / 2);
  const newPieceValue = state.nextPieceValue;
  const nextPieceValue = getNextPieceValue(finalBoard);
  const newPiece = { value: newPieceValue, col: spawnCol, row: 0 };

  if (garbageKill || !canPlace(finalBoard, newPiece.row, newPiece.col)) {
    return {
      ...state,
      board: finalBoard,
      currentPiece: null,
      gameOver: true,
      score: newScore,
      totalGarbageSent: newTotalGarbage,
      pendingIncoming: 0,
      pendingIncomingPool: [2],
      mergeFlash: mergeScore > 0 ? (state.mergeFlash + 1) : state.mergeFlash,
    };
  }

  return {
    ...state,
    board: finalBoard,
    currentPiece: newPiece,
    nextPieceValue,
    score: newScore,
    level,
    startLevel,
    totalGarbageSent: newTotalGarbage,
    pendingIncoming: 0,
    pendingIncomingPool: [2],
    mergeFlash: mergeScore > 0 ? (state.mergeFlash + 1) : state.mergeFlash,
  };
}
