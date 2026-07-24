import React from 'react';

const COLORS = [
  { label: 'R', name: 'Red',    bg: '#e53935', text: '#fff' },
  { label: 'O', name: 'Orange', bg: '#f57c00', text: '#fff' },
  { label: 'Y', name: 'Yellow', bg: '#fdd835', text: '#1a1a1a' },
  { label: 'G', name: 'Green',  bg: '#43a047', text: '#fff' },
  { label: 'B', name: 'Blue',   bg: '#1e88e5', text: '#fff' },
  { label: 'I', name: 'Indigo', bg: '#3949ab', text: '#fff' },
  { label: 'V', name: 'Violet', bg: '#8e24aa', text: '#fff' },
];

export default function ColorSequenceModal({ onClose, actionLabel = 'Play!' }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card color-seq-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Color Cycle</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ alignItems: 'center', gap: 20, padding: '22px 20px' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600, textAlign: 'center', letterSpacing: '0.5px' }}>
            Merge same-color tiles to advance the cycle
          </p>
          <div className="color-seq-row">
            {COLORS.map((c, i) => (
              <React.Fragment key={c.label}>
                <div className="color-seq-tile" style={{ background: c.bg }}>
                  <span style={{ color: c.text, fontSize: '0.78rem', fontWeight: 900 }}>{c.label}</span>
                  <span style={{ color: c.text, fontSize: '0.52rem', fontWeight: 700, opacity: 0.85 }}>{c.name}</span>
                </div>
                {i < COLORS.length - 1 && (
                  <span className="color-seq-arrow">→</span>
                )}
              </React.Fragment>
            ))}
            <span className="color-seq-arrow">→</span>
            <div className="color-seq-tile color-seq-cycle" style={{ background: COLORS[0].bg }}>
              <span style={{ color: COLORS[0].text, fontSize: '0.78rem', fontWeight: 900 }}>R</span>
              <span style={{ color: COLORS[0].text, fontSize: '0.52rem', fontWeight: 700, opacity: 0.85 }}>cycle</span>
            </div>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600, textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
            2 tiles of the same color merge into the <em>next</em> color.<br />
            3 tiles skip two steps, 4 skip three, and so on.
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
