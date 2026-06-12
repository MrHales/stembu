import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const oppositePairs = [
  ['Spiritualist', 'Materialist'],
  ['Militarist', 'Pacifist'],
  ['Xenophobe', 'Xenophile'],
  ['Authoritarian', 'Egalitarian']
];

export default function EthicsSection({ selectedEthics, onEthicToggle, onEthicInfoClick }) {
  const [ethics, setEthics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/Ethics - Sheet1.csv`);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedEthics = results.data.filter(row => row.Name && row.Name.trim() !== '');
            setEthics(parsedEthics);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to load Ethics", err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="placeholder-content">Loading ethical frameworks...</div>;

  const currentPoints = selectedEthics.reduce((acc, e) => {
    if (e.name === 'Gestalt Consciousness') return acc + 3;
    if (e.name.startsWith('Fanatic')) return acc + 2;
    return acc + 1;
  }, 0);

  const handleToggle = (ethic) => {
    onEthicToggle(ethic);
  };

  const pointsClass = (3 - currentPoints) < 0 ? 'text-danger' : 'text-accent';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="traits-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h3 style={{ margin: 0 }}>Ethical Frameworks</h3>
        <div className="trait-stats">
          <span className={pointsClass}>Ethics Points Available: {3 - currentPoints} / 3</span>
        </div>
      </div>
      <div className="scrollable-viewport" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="traits-container">
          {ethics.map((ethic, index) => {
            const isSelected = selectedEthics.some(e => e.name === ethic.Name);
            let cost = 1;
            if (ethic.Name === 'Gestalt Consciousness') cost = 3;
            else if (ethic.Name.startsWith('Fanatic')) cost = 2;

            let conflict = false;
            let conflictReason = '';

            // Determine if we can select this ethic
            if (!isSelected) {
              if (ethic.Name === 'Gestalt Consciousness') {
                // Gestalt is never conflicted by other selections since selecting it clears them!
                conflict = false;
              } else {
                const hasGestalt = selectedEthics.some(e => e.name === 'Gestalt Consciousness');
                if (hasGestalt) {
                  conflict = true;
                  conflictReason = 'Incompatible with Gestalt Consciousness';
                } else if (currentPoints + cost > 3) {
                  conflict = true;
                  conflictReason = 'Not enough ethics points';
                } else {
                  // Check direct opposites and variants
                  const baseName = ethic.Name.replace('Fanatic ', '');
                  selectedEthics.forEach(selE => {
                    const selBaseName = selE.name.replace('Fanatic ', '');
                    if (baseName === selBaseName) {
                      conflict = true;
                      conflictReason = 'Already selected a variant of this ethic';
                    }

                    oppositePairs.forEach(pair => {
                      if ((pair[0] === baseName && pair[1] === selBaseName) ||
                          (pair[1] === baseName && pair[0] === selBaseName)) {
                        conflict = true;
                        conflictReason = 'Conflicts with opposite ethic';
                      }
                    });
                  });
                }
              }
            }

            const classNames = `selectable-card ${isSelected ? 'selected' : ''} ${conflict ? 'conflict opacity-50' : ''}`;

            return (
              <div 
                key={`${ethic.Name}-${index}`}
                className={classNames}
                style={{ marginBottom: '0.8rem', cursor: conflict && !isSelected ? 'not-allowed' : 'pointer' }}
                onClick={() => {
                   if (isSelected || !conflict) {
                     handleToggle({ name: ethic.Name, ...ethic });
                   }
                }}
              >
                <div className="traits-header" style={{ alignItems: 'center', borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0 }}>{ethic.Name}</h4>
                    <span className="trait-cost positive" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      {cost} pt{cost > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="trait-stats" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', zIndex: 10, position: 'relative', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEthicInfoClick({
                            name: ethic.Name,
                            description: ethic.Description,
                            effects: ethic.Effects,
                            points: cost
                          });
                        }}
                      >
                        ?
                      </button>
                  </div>
                </div>
                {conflict && !isSelected && conflictReason && (
                  <small className="text-danger" style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    {conflictReason}
                  </small>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
