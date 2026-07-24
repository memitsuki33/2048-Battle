# Blendit

A Tetris-Battle-style color-blending game for 1 or 2 players, built with React + Vite.

**Mix the colors to attack!**
- **Blend it**: Fuse colors together to clear your board.
- **Send it**: Launch garbage blocks to crush your opponent.

## How to Run

```
yarn dev
```

Runs on port 5000.

## Game Mechanics

### Board
- 10 columns wide, 20 rows tall
- Single colored tiles fall from the top

### Colors
There are 7 colors cycling in ROYGBIV order:
**Red → Orange → Yellow → Green → Blue → Indigo → Violet → Red** (repeats)

All 7 colors have equal spawn probability.

### Merging
Connected groups of same-color tiles merge when touching horizontally or vertically.
Merging N tiles of color C produces 1 tile advanced N-1 steps in the cycle:
- 2 Reds → Orange
- 3 Reds → Yellow
- 4 Reds → Green
- 7 Reds → Violet
- 8 Reds → Red (cycles back)

Merges cascade — after gravity settles tiles, new groups can form and merge again (chain combos).

### Scoring
Each merge scores based on the resulting color:
- Red: 100 pts, Orange: 200, Yellow: 400, Green: 800, Blue: 1600, Indigo: 3200, Violet: 6400

### Levels
- Level 0: no auto-drop (manual only)
- Level 1+: auto-drop every max(20ms, 1200 - (level-1)*20ms)
- Max level: 60

### Battle Mode
- 2 players, local co-op on one keyboard
- Chain combos send garbage rows to the opponent
- Garbage rows are gray, non-mergeable, with one random colored gap

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
    constants.js             — ROWS, COLS, COLOR_COUNT, level/score formulas
    colors.js                — ROYGBIV palette + formatValue + formatScore
    gameLogic.js             — board logic, color merges, gravity, reducer
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
