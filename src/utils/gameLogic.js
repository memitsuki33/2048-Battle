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
//
// placedRow/placedCol: position of the tile just locked onto the board.
// - If the placed tile is part of a group, the merge result lands at the placed
//   position (so dropping left-of-a-match keeps the result on the left, etc.).
// - For cascade merges (subsequent iterations), the result lands at whichever
//   cell in the group was NOT itself a result of a previous merge — i.e. at the
//   pre-existing tile, not the freshly merged one.
export function processMerges(board, placedRow = -1, placedCol = -1) {
  let current = board.map(r => [...r]);
  let totalScore = 0;
  let chainCount = 0;
  let anyMerge = true;

  // Tracks cells that are merge results so cascades prefer the OTHER tile.
  const resultCells = new Set();

  // Mutable copy so we can clear after first use.
  let pRow = placedRow;
  let pCol = placedCol;

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

      // ── Target cell selection ──────────────────────────────────────────────
      // Priority 1 (first merge only): placed cell → result lands where you dropped
      // Priority 2 (cascades): prefer cells that are NOT a previous merge result
      // Priority 3 (fallback): bottommost row, then leftmost column
      let targetCell = null;

      if (pRow >= 0 && pCol >= 0) {
        const inGroup = group.find(([r, c]) => r === pRow && c === pCol);
        if (inGroup) {
          targetCell = inGroup;
          // Clear so this priority only applies once.
          pRow = -1;
          pCol = -1;
        }
      }

      if (!targetCell) {
        // Prefer cells that were not results of a previous cascade step.
        const preferred = group.filter(([r, c]) => !resultCells.has(r * COLS + c));
        const candidates = preferred.length > 0 ? preferred : group;

        let maxRow = -1;
        for (const [r] of candidates) if (r > maxRow) maxRow = r;
        const bottom = candidates.filter(([r]) => r === maxRow);
        bottom.sort((a, b) => a[1] - b[1]);
        targetCell = bottom[0]; // leftmost among bottommost
      }

      // Clear all cells in group, then place merged tile.
      for (const [gr, gc] of group) next[gr][gc] = 0;
      next[targetCell[0]][targetCell[1]] = newValue;
      resultCells.add(targetCell[0] * COLS + targetCell[1]);
      totalScore += newValue;
    }

    current = applyGravity(next);
  }

  return { board: current, score: totalScore, chainCount };
}

// Returns a value to use for the next piece, based on current board state.
//
// Candidates: all distinct positive tile values currently on the board,
// EXCLUDING the board's current maximum (the highest tile in play).
//
// Probability is weighted so lower-value tiles appear more often:
//   pool sorted ascending → index 0 (smallest) gets weight 2^(n-1),
//   index 1 gets 2^(n-2), …, index n-1 (largest) gets 2^0 = 1.
// This gives a geometric decay — each tier is half as likely as the one below.
//
// Edge cases:
//   - Empty board → return 2.
//   - Only one distinct value on board → return that value ÷ 2 (min 2).
export function getNextPieceValue(board) {
  const seen = new Set();
  let maxVal = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = board[r][c];
      if (v > 0) {
        seen.add(v);
        if (v > maxVal) maxVal = v;
      }
    }
  }

  // Empty board
  if (maxVal === 0) return 2;

  // Remove the highest tile
  seen.delete(maxVal);

  // Only one distinct value was present
  if (seen.size === 0) return Math.max(2, maxVal / 2);

  // Weighted pick: sort ascending, assign geometric weights (lower = heavier)
  const pool = Array.from(seen).sort((a, b) => a - b);
  const n = pool.length;
  // weight[i] = 2^(n-1-i): smallest tile gets highest weight
  const weights = pool.map((_, i) => Math.pow(2, n - 1 - i));
  const total = weights.reduce((s, w) => s + w, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return pool[i];
  }
  return pool[pool.length - 1]; // fallback
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

  // Process merges + cascades (pass placed position for directional merge)
  const { board: mergedBoard, score: mergeScore, chainCount } = processMerges(newBoard, currentPiece.row, currentPiece.col);

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
