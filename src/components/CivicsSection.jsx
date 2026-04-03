import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function CivicsSection({ selectedCivics, onCivicToggle, onCivicInfoClick }) {
  const [civics, setCivics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/Civics - Sheet1.csv`);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedCivics = results.data.filter(row => row.Civic && row.Civic.trim() !== '');
            setCivics(parsedCivics);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to load Civics", err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="placeholder-content">Loading societal tenets...</div>;

  const handleToggle = (civic, e) => {
    e.stopPropagation();
    onCivicToggle(civic);
  };

  return (
    <div className="scrollable-viewport">
      <div className="traits-container">
        {civics.map((civic, index) => {
          const isSelected = selectedCivics.some(c => c.name === civic.Civic);
          // Let's assume a hard limit of 3 for now, 
          // though generally starting is 2.
          const maxReached = selectedCivics.length >= 3 && !isSelected;
          const classNames = `selectable-card ${isSelected ? 'selected' : ''} ${maxReached ? 'opacity-50' : ''}`;

          return (
            <div 
              key={`${civic.Civic}-${index}`}
              className={classNames}
              style={{ marginBottom: '0.8rem' }}
              onClick={() => onCivicInfoClick({
                 name: civic.Civic,
                 description: civic.Description,
                 effects: civic.Effects,
                 requirements: civic.Requirements,
                 points: 0 // Mock point system to not break TraitModal
              })}
            >
              <div className="traits-header">
                <div>
                  <h4 style={{ margin: 0 }}>{civic.Civic}</h4>
                  {civic.Requirements && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-danger)' }}>
                      Requisite constraints apply
                    </span>
                  )}
                </div>
                <div className="trait-stats">
                   <button 
                     onClick={(e) => {
                       if (!maxReached || isSelected) {
                         handleToggle({ name: civic.Civic, ...civic }, e);
                       } else {
                         e.stopPropagation();
                       }
                     }}
                     style={{ 
                       padding: '0.2rem 0.6rem', 
                       fontSize: '0.7rem',
                       backgroundColor: isSelected ? 'var(--color-danger)' : 'var(--color-bg-dark)',
                       borderColor: isSelected ? 'var(--color-danger)' : 'var(--color-border)',
                       color: isSelected ? '#fff' : 'var(--color-text-main)'
                     }}
                   >
                     {isSelected ? 'REMOVE' : 'ADD'}
                   </button>
                </div>
              </div>
              <p className="trait-description" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {civic.Description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  );
}
