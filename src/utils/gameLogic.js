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

function bfsGroup(board, startRow, startCol, visited) {
  const value = board[startRow][startCol];
  if (value <= 0) return []; // empty or garbage cell

  const group = [];
  const queue = [[startRow, startCol]];

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    const key = r * COLS + c;
    if (visited.has(key)) continue;
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
    if (board[r][c] !== value) continue;
    if (board[r][c] < 0) { visited.add(key); continue; } // skip garbage cells
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

      // If the gap tile (a positive value inside a garbage row) is part of this
      // group, erase all -1 cells in that row immediately — the row is gone.
      for (const [gr] of group) {
        if (next[gr].some(v => v === -1)) {
          for (let col = 0; col < COLS; col++) {
            if (next[gr][col] === -1) next[gr][col] = 0;
          }
        }
      }

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
//
// Pool: top 5 values ≤ secondMaxVal on the board.
// Weights (lowest → highest in pool): 30 / 20 / 25 / 15 / 10 %
//   For pools smaller than 5, the bottom-N weights are taken and re-normalised.
//
// Board-min bonus: if the board contains a tile BELOW the pool's minimum
//   (a stranded low tile), it splits the lowest slot's weight 50 / 50 with
//   the pool minimum. e.g. pool=[4,8,16,32,64] with a 2 on board →
//   2 = 15 %, 4 = 15 %, 8 = 20 %, 16 = 25 %, 32 = 15 %, 64 = 10 %.
export function getNextPieceValue(board) {
  let maxVal = 0;
  let secondMaxVal = 0;
  let boardMin = Infinity; // smallest positive non-garbage tile on the board

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = board[r][c];
      if (v > 0) {
        if (v > maxVal) { secondMaxVal = maxVal; maxVal = v; }
        else if (v > secondMaxVal && v < maxVal) { secondMaxVal = v; }
        if (v < boardMin) boardMin = v;
      }
    }
  }

  if (maxVal === 0) {
    // Empty board: 75 % → 2, 25 % → 4 (unchanged)
    return Math.random() < 0.75 ? 2 : 4;
  }

  const poolCap = secondMaxVal > 0 ? secondMaxVal : maxVal / 2;
  const eligible = ALL_VALUES.filter(v => v <= poolCap);
  if (eligible.length === 0) return 2;

  // Up to 5 values, highest end of eligible list
  const pool = eligible.slice(-5);

  // Base weights: index 0 = lowest value in pool, index 4 = highest
  const BASE_WEIGHTS = [0.30, 0.20, 0.25, 0.15, 0.10];
  const n = pool.length;

  // Take the bottom-N weights and re-normalise so they sum to 1
  const raw = BASE_WEIGHTS.slice(0, n);
  const total = raw.reduce((a, b) => a + b, 0);
  const weights = raw.map(w => w / total);

  // Board-min bonus: if the actual board minimum is below pool[0],
  // split pool[0]'s weight 50 / 50 between pool[0] and boardMin.
  const hasBoardMin = boardMin < pool[0];
  const lowestWeight = weights[0];

  // Build the final candidates array: [value, cumulative-prob]
  const entries = []; // { value, weight }
  if (hasBoardMin) {
    entries.push({ value: boardMin, weight: lowestWeight * 0.5 });
    entries.push({ value: pool[0],  weight: lowestWeight * 0.5 });
  } else {
    entries.push({ value: pool[0], weight: lowestWeight });
  }
  for (let i = 1; i < n; i++) {
    entries.push({ value: pool[i], weight: weights[i] });
  }

  // Weighted random pick
  const r = Math.random();
  let cumulative = 0;
  for (const { value, weight } of entries) {
    cumulative += weight;
    if (r < cumulative) return value;
  }
  return entries[entries.length - 1].value;
}

// Returns the pool of values to use for garbage gap tiles.
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
// Garbage cells are -1 (gray, non-mergeable).
// The gap gets a random playable tile value — when it merges, the row clears.
export function addGarbageRows(board, count, garbagePool) {
  const pool = garbagePool && garbagePool.length > 0 ? garbagePool : [2, 4];
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

    // Garbage row: -1 cells with one gap that has a random tile value
    const gapCol = Math.floor(Math.random() * COLS);
    const gapValue = pool[Math.floor(Math.random() * pool.length)];
    newBoard[ROWS - 1] = Array.from({ length: COLS }, (_, c) =>
      c === gapCol ? gapValue : -1
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
    pendingIncoming: 0,
    pendingIncomingPool: [2],
    mergeStreak: 0,       // consecutive piece placements that produced a merge
    streakMilestone: 0,   // bumped each time streak hits a multiple of 4 (for flash)
    lastChainCount: 0,    // chain-merge count from the most recent piece lock (for combo sounds)
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
      return { ...state, level: state.level + 1 };
    }

    case 'ADD_INCOMING_GARBAGE': {
      return {
        ...state,
        pendingIncoming: state.pendingIncoming + action.rows,
        pendingIncomingPool: action.garbagePool ?? state.pendingIncomingPool,
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
    mergeStreak = 0, streakMilestone = 0,
  } = state;

  // Place piece on board
  const newBoard = board.map(r => [...r]);
  if (currentPiece.row >= 0) {
    newBoard[currentPiece.row][currentPiece.col] = currentPiece.value;
  }

  // Process merges + cascades
  const { board: mergedBoard, score: mergeScore, chainCount } = processMerges(newBoard);

  // Consecutive-merge streak: increments when this piece caused a merge, resets otherwise
  const newStreak = mergeScore > 0 ? mergeStreak + 1 : 0;
  // Every 4 consecutive merging placements = +1 garbage
  const streakBonus = (newStreak > 0 && newStreak % 3 === 0) ? 1 : 0;
  const newStreakMilestone = streakMilestone + (streakBonus > 0 ? 1 : 0);

  // Garbage: 1 row per 3 chain-combos + streak bonus
  const garbageToSend = Math.floor(chainCount / 3) + streakBonus;
  const newTotalGarbage = totalGarbageSent + garbageToSend;
  const newScore = score + mergeScore;

  // Apply queued incoming garbage
  let finalBoard = mergedBoard;
  let garbageKill = false;
  if (pendingIncoming > 0) {
    // Use pool based on recipient's current board state
    const pool = getGarbagePool(mergedBoard).length > 0
      ? getGarbagePool(mergedBoard)
      : (pendingIncomingPool ?? [2, 4]);
    const result = addGarbageRows(mergedBoard, pendingIncoming, pool);
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
      mergeStreak: 0,
      streakMilestone: newStreakMilestone,
      lastChainCount: chainCount,
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
    mergeStreak: newStreak,
    streakMilestone: newStreakMilestone,
    lastChainCount: chainCount,
  };
}
