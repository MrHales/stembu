import React, { useState, useEffect } from 'react';

function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    const hasSeenDisclaimer = localStorage.getItem('stembu-disclaimer-seen');
    if (!hasSeenDisclaimer) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShow) {
      localStorage.setItem('stembu-disclaimer-seen', 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Fan Project Disclaimer</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-main)', lineHeight: '1.6' }}>
          This application is an unofficial, non-commercial fan project. It is not affiliated with, endorsed, sponsored, or specifically approved by <strong>Paradox Interactive</strong>. 
          <strong> Stellaris</strong> and all related characters, names, and assets are trademarks and copyrighted property of <strong>Paradox Interactive</strong>.
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <input
            type="checkbox"
            id="dontShowDisclaimer"
            checked={dontShow}
            onChange={(e) => setDontShow(e.target.checked)}
            style={{ marginRight: '0.5rem', width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
          />
          <label htmlFor="dontShowDisclaimer" style={{ cursor: 'pointer', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Don't show this again
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="primary" onClick={handleClose}>Acknowledge</button>
        </div>
      </div>
    </div>
  );
}

export default DisclaimerModal;
