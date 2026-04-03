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

  return (
    <div className="scrollable-viewport">
      <div className="traits-container">
        {ethics.map((ethic, index) => {
          const isSelected = selectedEthics.some(e => e.name === ethic.Name);
          let cost = 1;
          if (ethic.Name === 'Gestalt Consciousness') cost = 3;
          else if (ethic.Name.startsWith('Fanatic')) cost = 2;

          let conflict = false;
          // Determine if we can select this ethic
          if (!isSelected) {
            if (currentPoints + cost > 3) conflict = true;
            if (ethic.Name === 'Gestalt Consciousness' && currentPoints > 0) conflict = true;
            if (currentPoints > 0 && selectedEthics.some(e => e.name === 'Gestalt Consciousness')) conflict = true;
            
            // Check direct opposites
            const baseName = ethic.Name.replace('Fanatic ', '');
            selectedEthics.forEach(selE => {
              const selBaseName = selE.name.replace('Fanatic ', '');
              // If baseName is same (upgrading/downgrading from Fanatic), it's technically a conflict unless we auto-remove. 
              // For simplicity, we disable the other variant and rely on the user to remove it first.
              if (baseName === selBaseName) conflict = true;

              oppositePairs.forEach(pair => {
                if ((pair[0] === baseName && pair[1] === selBaseName) ||
                    (pair[1] === baseName && pair[0] === selBaseName)) {
                  conflict = true;
                }
              });
            });
          }

          const classNames = `selectable-card ${isSelected ? 'selected' : ''} ${conflict ? 'opacity-50' : ''}`;

          return (
            <div 
              key={`${ethic.Name}-${index}`}
              className={classNames}
              style={{ marginBottom: '0.8rem', cursor: conflict && !isSelected ? 'not-allowed' : 'pointer' }}
              onClick={() => onEthicInfoClick({
                 name: ethic.Name,
                 description: ethic.Description,
                 effects: ethic.Effects,
                 points: cost
              })}
            >
              <div className="traits-header">
                <div>
                  <h4 style={{ margin: 0 }}>{ethic.Name}</h4>
                </div>
                <div className="trait-stats">
                   <button 
                     onClick={(e) => {
                       e.stopPropagation();
                       if (isSelected || !conflict) {
                         handleToggle({ name: ethic.Name, ...ethic });
                       }
                     }}
                     disabled={conflict && !isSelected}
                     style={{ 
                       padding: '0.2rem 0.6rem', 
                       fontSize: '0.7rem',
                       backgroundColor: isSelected ? 'var(--color-danger)' : (conflict ? 'transparent' : 'var(--color-bg-dark)'),
                       borderColor: isSelected ? 'var(--color-danger)' : (conflict ? 'rgba(255,255,255,0.1)' : 'var(--color-border)'),
                       color: isSelected ? '#fff' : (conflict ? 'rgba(255,255,255,0.3)' : 'var(--color-text-main)')
                     }}
                   >
                     {isSelected ? 'REMOVE' : (conflict ? 'CONFLICT' : 'ADD')}
                   </button>
                </div>
              </div>
              <p className="trait-description" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {ethic.Description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  );
}
