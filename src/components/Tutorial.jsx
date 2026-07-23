import React, { useState } from 'react';
import { getTileColor, formatValue } from '../utils/colors.js';
import { getDropInterval } from '../utils/constants.js';

function Tile({ value, size = 40 }) {
  const color = getTileColor(value);
  return (
    <div style={{
      width: size, height: size, borderRadius: 5,
      background: color.bg, color: color.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: size * 0.3, flexShrink: 0,
      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
    }}>
      {formatValue(value)}
    </div>
  );
}

function GarbageCell({ size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 5,
      background: '#555', flexShrink: 0,
    }} />
  );
}

function Empty({ size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 5,
      background: '#0d1520', flexShrink: 0,
    }} />
  );
}

function Arrow({ size = 40 }) {
  return (
    <div style={{
      width: size, height: size, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.55, color: 'var(--text-dim)', flexShrink: 0,
    }}>
      =
    </div>
  );
}

function MiniGrid({ cells, cols, size = 38, gap = 3 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, ${size}px)`,
      gap,
    }}>
      {cells.map((v, i) =>
        v === -1 ? <GarbageCell key={i} size={size} />
        : v === 0 ? <Empty key={i} size={size} />
        : <Tile key={i} value={v} size={size} />
      )}
    </div>
  );
}

function MergeExample({ before, beforeCols, after, afterCols, label, size = 38 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <MiniGrid cells={before} cols={beforeCols} size={size} />
      <Arrow size={size} />
      <MiniGrid cells={after} cols={afterCols} size={size} />
      <span style={{ fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-dim)', minWidth: 110 }}>
        {label}
      </span>
    </div>
  );
}

const PAGES = [
  { title: 'The Board' },
  { title: 'How Merging Works' },
  { title: 'Bigger Groups & Chains' },
  { title: 'Levels & Speed' },
  { title: 'Battle Mode' },
  { title: 'Controls' },
];

export default function Tutorial({ onBack }) {
  const [page, setPage] = useState(0);

  return (
    <div className="tutorial-screen">
      <div className="tutorial-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack}>Back</button>
        <div className="tutorial-progress">
          {PAGES.map((p, i) => (
            <button
              key={i}
              className={`tutorial-dot${i === page ? ' active' : ''}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
        <span className="tutorial-page-label">{page + 1} / {PAGES.length}</span>
      </div>

      <div className="tutorial-body">
        <h2 className="tutorial-title">{PAGES[page].title}</h2>

        {page === 0 && (
          <div className="tutorial-content">
            <p>
              The board is <strong>7 columns wide</strong> and <strong>20 rows tall</strong>.
              Numbered tiles fall one at a time from the top — move them left or right,
              then drop. Tiles with the same value that touch each other
              (horizontally or vertically) <strong>automatically merge</strong>.
            </p>
            <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
              {[2, 4, 8, 16, 32, 64].map(v => <Tile key={v} value={v} size={44} />)}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {[128, 256, 512, 1024, 2048, 4096].map(v => <Tile key={v} value={v} size={44} />)}
            </div>
            <p style={{ marginTop: 14, color: 'var(--text-dim)', fontSize: '0.82rem' }}>
              A <strong>ghost outline</strong> shows where the tile will land before you drop it.
              The <strong>next tile</strong> is previewed in the side panel so you can plan ahead.
              Colors cycle from red (2) through the spectrum all the way to 65K+.
            </p>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
              Lower-value tiles spawn more often — the higher the tile, the rarer it appears.
              This keeps the game manageable at high levels.
            </p>
          </div>
        )}

        {page === 1 && (
          <div className="tutorial-content">
            <p>
              When <strong>2 or more same-value tiles touch</strong>, they instantly merge.
              The merged tile appears <strong>where you dropped yours</strong> — drop left
              of a match and the result stays on the left; drop right and it stays on the right.
            </p>
            <div className="merge-examples">
              <MergeExample
                label="2 side-by-side → 4"
                before={[2, 2]} beforeCols={2}
                after={[4]}    afterCols={1}
              />
              <MergeExample
                label="2 stacked → 4"
                before={[2, 2]} beforeCols={1}
                after={[4]}    afterCols={1}
              />
              <MergeExample
                label="3 touching → 8  (2 × 2²)"
                before={[2, 2, 2, 0]} beforeCols={2}
                after={[0, 8]}        afterCols={2}
              />
            </div>
            <p style={{ marginTop: 12, color: 'var(--text-dim)', fontSize: '0.82rem' }}>
              After a merge, gravity pulls all tiles down. If newly settled tiles form another
              matching group, they merge too — automatically, for free. You score points equal
              to the value of every tile created.
            </p>
          </div>
        )}

        {page === 2 && (
          <div className="tutorial-content">
            <p>
              Larger connected groups produce exponentially bigger tiles — and bigger scores:
            </p>
            <div className="merge-examples">
              <MergeExample
                label="2 tiles → ×2"
                before={[4, 4]}            beforeCols={2}
                after={[8]}                afterCols={1}
              />
              <MergeExample
                label="3 tiles → ×4"
                before={[4, 4, 4, 0]}      beforeCols={2}
                after={[0, 16]}            afterCols={2}
              />
              <MergeExample
                label="4 tiles → ×8"
                before={[0, 4, 4, 4, 4, 0]} beforeCols={2}
                after={[0, 32, 0, 0, 0, 0]} afterCols={2}
              />
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              Formula: N tiles of value V → one tile of <strong>V × 2^(N−1)</strong>
            </p>
            <p style={{ marginTop: 10 }}>
              Each step in a cascade is a <strong>chain combo</strong>. Chains multiply your
              score and — in battle mode — send garbage rows to your opponent.
              Set up boards that cascade 3, 4, or 5 steps to dominate.
            </p>
          </div>
        )}

        {page === 3 && (
          <div className="tutorial-content">
            <p><strong>Level 0</strong> — tiles never fall on their own. Drop them at your own pace, great for learning.</p>
            <p><strong>Level 1+</strong> — tiles auto-drop on a timer. Each level shaves time off the interval:</p>
            <div className="level-table">
              {[1, 5, 10, 20, 30, 40, 50, 60].map(lv => {
                const ms = getDropInterval(lv);
                const maxMs = getDropInterval(1);
                return (
                  <div key={lv} className="level-table-row">
                    <span className="level-table-lv">Lv {lv}</span>
                    <div className="level-table-bar-wrap">
                      <div className="level-table-bar" style={{ width: `${(ms / maxMs) * 100}%` }} />
                    </div>
                    <span className="level-table-ms">{(ms / 1000).toFixed(2)}s</span>
                  </div>
                );
              })}
            </div>
            <p style={{ marginTop: 12, color: 'var(--text-dim)', fontSize: '0.82rem' }}>
              Your level rises automatically as your score grows. If you want to retry a
              section, open <strong>Settings</strong> and choose <strong>Load Level</strong> —
              it drops you back to the nearest lower multiple of 5 (e.g. level 12 → load level 10).
              <strong> Reset</strong> always takes you back to level 0.
            </p>
          </div>
        )}

        {page === 4 && (
          <div className="tutorial-content">
            <p>
              <strong>PC battle</strong> — two players share one keyboard on side-by-side boards.
              <strong> Mobile battle</strong> — play online against anyone with a room code.
              The first player whose board fills to the top <strong>loses</strong>.
            </p>
            <p style={{ marginTop: 10 }}>
              Build chain combos to attack. Every <strong>3 combo steps</strong> sends
              <strong> 1 garbage row</strong> to the opponent's board:
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[3, 6, 9, 12].map(c => (
                  <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 44, fontWeight: 800, fontSize: '0.82rem', color: 'var(--accent)' }}>{c}-chain</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>→</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text)', fontWeight: 700 }}>
                      {Math.floor(c / 3)} garbage row{Math.floor(c / 3) !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, padding: '12px 14px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
                <strong style={{ color: 'var(--text)' }}>Garbage rows</strong> rise from
                the bottom, pushing the board up. They are <GarbageCell size={14} /> gray
                and cannot merge — but each row has one random gap tile. Merge that
                gap tile with a match and the entire garbage row disappears.
                Garbage lands on the opponent's <em>next</em> piece placement.
              </div>
            </div>
          </div>
        )}

        {page === 5 && (
          <div className="tutorial-content">
            <div className="controls-table">
              <div className="controls-section">
                <div className="controls-section-title p1">Single Player / Player 1 (PC)</div>
                <div className="controls-row">
                  <kbd>←</kbd><kbd>A</kbd> <span>Move left</span>
                </div>
                <div className="controls-row">
                  <kbd>→</kbd><kbd>D</kbd> <span>Move right</span>
                </div>
                <div className="controls-row">
                  <kbd>↓</kbd><kbd>S</kbd> <span>Soft drop — one step down</span>
                </div>
                <div className="controls-row">
                  <kbd>↑</kbd><kbd>W</kbd><kbd>Space</kbd> <span>Hard drop — instant to bottom</span>
                </div>
              </div>
              <div className="controls-section">
                <div className="controls-section-title p2">Player 2 (PC Battle only)</div>
                <div className="controls-row">
                  <kbd>←</kbd> <span>Move left</span>
                </div>
                <div className="controls-row">
                  <kbd>→</kbd> <span>Move right</span>
                </div>
                <div className="controls-row">
                  <kbd>↓</kbd> <span>Soft drop</span>
                </div>
                <div className="controls-row">
                  <kbd>↑</kbd> <span>Hard drop</span>
                </div>
              </div>
              <div className="controls-section">
                <div className="controls-section-title" style={{ color: '#16a34a' }}>Mobile</div>
                <div className="controls-row">
                  <span style={{ color: 'var(--text)' }}>
                    Use the on-screen buttons at the bottom:
                    <strong style={{ color: 'var(--accent)' }}> ▲▲</strong> hard drop,
                    <strong> ◀</strong> left,
                    <strong> ▼</strong> soft drop,
                    <strong> ▶</strong> right.
                    Open <strong>Settings</strong> to reset or load a level.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="tutorial-footer">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Prev
        </button>
        {page < PAGES.length - 1 ? (
          <button className="btn btn-primary btn-sm" onClick={() => setPage(p => p + 1)}>
            Next
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onBack}>
            Got it
          </button>
        )}
      </div>
    </div>
  );
}
