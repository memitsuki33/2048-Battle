# 2048 Battle

A Tetris-Battle-style 2048 game for 1 or 2 players, built with React + Vite.

## How to Run

```
yarn dev
```

Runs on port 5000.

## Game Mechanics

### Board
- 6 columns wide, 15 rows tall
- Single tiles fall from the top

### Merging
Connected groups of same-value tiles merge when touching horizontally or vertically:
- 2 tiles of V → 1 tile of V * 2
- 3 tiles of V → 1 tile of V * 4
- 4 tiles of V → 1 tile of V * 8
- 5 tiles of V → 1 tile of V * 16
- N tiles: newValue = V * 2^(N-1)

Merges cascade — after gravity settles tiles, new groups can form and merge again (chain combos).

### Levels
- Level 0: no auto-drop (manual only)
- Level 1+: auto-drop every max(1s, 10 - level * 0.25) seconds
- Max level: 36 (1-second drop interval)

### Random Piece Pool
- Pool of up to 5 tile values, based on current board max
- "Stranded" low tiles on the board are force-fed first until cleared

### Tile Colors
Colors cycle from red (2) through the spectrum to black (65K), then repeat at 131K.

### Battle Mode
- 2 players, local co-op on one keyboard
- Chain combos send garbage rows to the opponent
- Garbage rows are gray, non-mergeable, with one random gap

## Controls

### Single Player
- Left / Right arrow — move tile
- Down arrow — soft drop
- Up arrow — hard drop
- Also supports A / D / S / W

### Battle Mode
- Player 1: A/D = move, S = soft drop, W = hard drop
- Player 2: Arrow Left/Right = move, Down = soft drop, Up = hard drop

## Project Structure

```
src/
  App.jsx                    — screen routing
  App.css                    — all styles
  utils/
    constants.js             — ROWS, COLS, level/score formulas
    colors.js                — tile color palette + formatValue
    gameLogic.js             — board logic, merges, gravity, reducer
  hooks/
    useGameEngine.js         — game loop, timer, level-up hook
  components/
    MenuScreen.jsx
    LevelSelect.jsx
    SinglePlayerGame.jsx
    BattleGame.jsx
    GameBoard.jsx            — renders board + current piece + ghost
    InfoPanel.jsx            — score, level, next piece, progress bar
```

## User Preferences

- No emojis anywhere in the game UI
