import React from 'react';

export default function TraitModal({ trait, onClose }) {
  if (!trait) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>{trait.name}</h2>
        
        {trait.points !== undefined && (
          <div style={{ marginBottom: '1rem' }}>
            <span className={`trait-cost ${trait.points < 0 ? 'negative' : 'positive'}`}>
              {trait.points > 0 ? `-${trait.points}` : `+${Math.abs(trait.points)}`} point(s)
            </span>
          </div>
        )}
        
        <p style={{ fontStyle: 'italic', marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
          "{trait.description}"
        </p>
        
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Effects</h4>
          <p style={{ margin: 0, color: 'var(--color-text-main)', fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
            {trait.effects}
          </p>
        </div>
        
        {trait.conflicts && (
           <div style={{ marginTop: '1rem' }}>
             <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-danger)' }}>Conflicts</h4>
             <p style={{ margin: 0, fontSize: '0.85rem' }}>{trait.conflicts}</p>
           </div>
        )}
        
        {trait.requirements && (
           <div style={{ marginTop: '1rem' }}>
             <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-accent)' }}>Requirements</h4>
             <p style={{ margin: 0, fontSize: '0.85rem' }}>{trait.requirements}</p>
           </div>
        )}
      </div>
    </div>
  );
}
