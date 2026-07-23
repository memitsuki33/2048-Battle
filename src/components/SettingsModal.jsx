import React from 'react';

/**
 * Shared settings modal.
 *
 * Props:
 *   onClose        — close the modal
 *   animSpeed      — current anim speed
 *   onAnimSpeed    — change anim speed
 *   onReset        — (optional) restart at level 0
 *   checkpointLevel— (optional) nearest multiple-of-5 level to load
 *   onLoadLevel    — (optional) restart at checkpointLevel
 */
export default function SettingsModal({
  onClose,
  animSpeed,
  onAnimSpeed,
  onReset,
  checkpointLevel,
  onLoadLevel,
}) {
  const hasGameControls = onReset || onLoadLevel;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <span className="modal-title">Settings</span>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {/* Animation toggle */}
          <div className="modal-row">
            <span className="modal-label">Animation</span>
            <div className="settings-options">
              {['none', 'normal'].map(opt => (
                <button
                  key={opt}
                  className={`settings-opt${animSpeed === opt ? ' active' : ''}`}
                  onClick={() => onAnimSpeed(opt)}
                >
                  {opt === 'none' ? 'No Anim' : 'Anim'}
                </button>
              ))}
            </div>
          </div>

          {/* In-game: Reset / Load Level */}
          {hasGameControls && (
            <>
              <div className="modal-divider" />

              {onReset && (
                <button
                  className="btn btn-danger btn-sm modal-wide-btn"
                  onClick={() => { onReset(); onClose(); }}
                >
                  Reset — Level 0
                </button>
              )}

              {onLoadLevel && checkpointLevel >= 5 && (
                <button
                  className="btn btn-secondary btn-sm modal-wide-btn"
                  onClick={() => { onLoadLevel(checkpointLevel); onClose(); }}
                >
                  Load Level {checkpointLevel}
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
