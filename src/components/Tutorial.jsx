import React, { useState } from 'react';
import { getTileColor, formatValue } from '../utils/colors.js';

function Tile({ value, size = 40 }) {
  const color = getTileColor(value);
  return (
    <div style={{
      width: size, height: size, borderRadius: 5,
      background: color.bg, color: color.text,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: size * 0.32, flexShrink: 0,
      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
    }}>
      {formatValue(value)}
    </div>
  );
}

function Empty({ size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 5,
      background: '#0d1f0d', flexShrink: 0,
    }} />
  );
}

function Arrow({ size = 40 }) {
  return (
    <div style={{
      width: size, height: size, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.55, color: '#6a8a6a', flexShrink: 0,
    }}>
      =
    </div>
  );
}

// Renders a small grid of cells for demo purposes
function MiniGrid({ cells, cols, size = 38, gap = 3 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, ${size}px)`,
      gap,
    }}>
      {cells.map((v, i) =>
        v === 0
          ? <Empty key={i} size={size} />
          : <Tile key={i} value={v} size={size} />
      )}
    </div>
  );
}

function MergeExample({ label, before, beforeCols, after, afterCols, size = 38 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <MiniGrid cells={before} cols={beforeCols} size={size} />
      <Arrow size={size} />
      <MiniGrid cells={after} cols={afterCols} size={size} />
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6a8a6a', minWidth: 120 }}>
        {label}
      </span>
    </div>
  );
}

const PAGES = [
  { title: 'The Board' },
  { title: 'How Merging Works' },
  { title: 'Bigger Groups' },
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
            <p>The board is <strong>6 columns wide</strong> and <strong>15 rows tall</strong>.</p>
            <p>Numbered tiles fall from the top — one at a time.</p>
            <p>You move the tile left or right, then drop it onto the board.</p>
            <div style={{ display: 'flex', gap: 6, marginTop: 20 }}>
              {[2, 4, 8, 16, 32, 64].map(v => <Tile key={v} value={v} size={44} />)}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {[128, 256, 512, 1024, 2048, 4096].map(v => <Tile key={v} value={v} size={44} />)}
            </div>
            <p style={{ marginTop: 16, color: 'var(--text-dim)' }}>
              Colors cycle back after <strong>131K</strong> — the same red as 2.
            </p>
          </div>
        )}

        {page === 1 && (
          <div className="tutorial-content">
            <p>
              When <strong>2 or more same-value tiles touch</strong> (horizontally or vertically),
              they automatically merge into one tile.
            </p>
            <div className="merge-examples">
              <MergeExample
                label="2 tiles side by side"
                before={[2, 2]}
                beforeCols={2}
                after={[4]}
                afterCols={1}
              />
              <MergeExample
                label="2 tiles stacked"
                before={[2, 2]}
                beforeCols={1}
                after={[4]}
                afterCols={1}
              />
            </div>
            <p style={{ marginTop: 16, color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              The merged tile lands at the <em>bottom-most</em> position of the group.
              Tiles above it fall down — which can trigger more merges.
            </p>
          </div>
        )}

        {page === 2 && (
          <div className="tutorial-content">
            <p>
              Larger connected groups produce bigger merges:
            </p>
            <div className="merge-examples">
              <MergeExample
                label="3 connected = 4x"
                before={[2,2, 2,0]}
                beforeCols={2}
                after={[0,8]}
                afterCols={2}
              />
              <MergeExample
                label="4 connected = 8x"
                before={[0,2, 2,2, 2,0]}
                beforeCols={2}
                after={[0,16, 0,0, 0,0]}
                afterCols={2}
              />
              <MergeExample
                label="5 connected = 16x"
                before={[0,2, 2,2, 0,2, 0,2]}
                beforeCols={2}
                after={[0,32, 0,0, 0,0, 0,0]}
                afterCols={2}
              />
            </div>
            <p style={{ marginTop: 14, color: 'var(--text-dim)', fontSize: '0.82rem' }}>
              Formula: N tiles of value V → one tile of V × 2^(N-1)
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              {[[2,2,'4'],[2,3,'8'],[2,4,'16'],[2,5,'32'],[2,6,'64']].map(([v,n,r]) => (
                <div key={n} style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.72rem', fontWeight: 700 }}>
                  <span>{n} × </span><Tile value={v} size={28} />
                  <span> = </span><Tile value={parseInt(r)} size={28} />
                </div>
              ))}
            </div>
          </div>
        )}

        {page === 3 && (
          <div className="tutorial-content">
            <p><strong>Level 0</strong> — tiles never fall automatically. Drop them yourself.</p>
            <p><strong>Level 1+</strong> — tiles auto-drop every:</p>
            <div className="level-table">
              {[1,4,8,16,24,36].map(lv => {
                const ms = Math.max(1000, 10000 - lv * 250);
                return (
                  <div key={lv} className="level-table-row">
                    <span className="level-table-lv">Lv {lv}</span>
                    <div className="level-table-bar-wrap">
                      <div className="level-table-bar" style={{ width: `${(ms / 10000) * 100}%` }} />
                    </div>
                    <span className="level-table-ms">{(ms / 1000).toFixed(2)}s</span>
                  </div>
                );
              })}
            </div>
            <p style={{ marginTop: 12, color: 'var(--text-dim)', fontSize: '0.82rem' }}>
              In single player your level rises automatically as your score grows.
              In battle you each pick a starting level.
            </p>
          </div>
        )}

        {page === 4 && (
          <div className="tutorial-content">
            <p>Two players compete on side-by-side boards.</p>
            <p style={{ marginTop: 10 }}>
              When your tiles cascade (one merge triggers more merges after gravity),
              that counts as a <strong>chain combo</strong>.
            </p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: 6 }}>Chain</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[1,2,3,4].map(c => (
                    <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 24, fontWeight: 700, fontSize: '0.8rem', color: '#ee4035' }}>{c}x</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        sends {Math.max(0, c - 1)} garbage row{c > 2 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, padding: '12px 16px', background: '#0d1f0d', borderRadius: 6, fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.8 }}>
                <strong style={{ color: 'var(--text)' }}>Garbage rows</strong> appear at the bottom of the
                opponent's board and push everything up. They are gray and un-mergeable,
                with one random gap so the opponent can escape.
              </div>
            </div>
          </div>
        )}

        {page === 5 && (
          <div className="tutorial-content">
            <div className="controls-table">
              <div className="controls-section">
                <div className="controls-section-title p1">Single Player / Player 1</div>
                <div className="controls-row">
                  <kbd>Left</kbd><kbd>A</kbd> <span>Move left</span>
                </div>
                <div className="controls-row">
                  <kbd>Right</kbd><kbd>D</kbd> <span>Move right</span>
                </div>
                <div className="controls-row">
                  <kbd>Down</kbd><kbd>S</kbd> <span>Soft drop (one step)</span>
                </div>
                <div className="controls-row">
                  <kbd>Up</kbd><kbd>W</kbd><kbd>Space</kbd><kbd>R</kbd> <span>Hard drop (instant)</span>
                </div>
              </div>
              <div className="controls-section">
                <div className="controls-section-title p2">Player 2 (Battle)</div>
                <div className="controls-row">
                  <kbd>Left</kbd> <span>Move left</span>
                </div>
                <div className="controls-row">
                  <kbd>Right</kbd> <span>Move right</span>
                </div>
                <div className="controls-row">
                  <kbd>Down</kbd> <span>Soft drop</span>
                </div>
                <div className="controls-row">
                  <kbd>Up</kbd><kbd>Space</kbd> <span>Hard drop</span>
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
