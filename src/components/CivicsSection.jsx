import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { checkCivicRequirements } from '../utils/requirements';

export default function CivicsSection({ 
    selectedCivics, 
    onCivicToggle, 
    onCivicInfoClick,
    selectedAuthority,
    selectedEthics,
    selectedOrigin,
    speciesType
}) {
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
          const meetReqs = checkCivicRequirements(civic.Requirements, {
             authority: selectedAuthority,
             ethics: selectedEthics,
             origin: selectedOrigin,
             speciesType: speciesType
          });
          
          const maxReached = selectedCivics.length >= 2 && !isSelected;
          const hasConflict = !meetReqs;
          
          const classNames = `selectable-card ${isSelected ? 'selected' : ''} ${hasConflict ? 'conflict opacity-50' : ''} ${maxReached && !hasConflict ? 'opacity-50' : ''}`;

          return (
            <div 
              key={`${civic.Civic}-${index}`}
              className={classNames}
              style={{ marginBottom: '0.8rem' }}
              onClick={(e) => {
                 if (!hasConflict && (!maxReached || isSelected)) {
                    onCivicToggle({ name: civic.Civic, ...civic });
                 }
              }}
            >
              <div className="traits-header" style={{ alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, marginBottom: '0.2rem' }}>{civic.Civic}</h4>
                  {civic.Requirements && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-danger)', display: 'block' }}>
                      Requisite constraints apply
                    </span>
                  )}
                </div>
                <div className="trait-stats">
                   <button 
                     style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', zIndex: 10, position: 'relative' }}
                     onClick={(e) => {
                       e.stopPropagation();
                       onCivicInfoClick({
                         name: civic.Civic,
                         description: civic.Description,
                         effects: civic.Effects,
                         requirements: civic.Requirements
                       });
                     }}
                   >
                     ?
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
              {hasConflict && (
                <span style={{ fontSize: '0.7rem', color: 'var(--color-danger)', display: 'block', marginTop: '0.4rem' }}>
                  Requirements not met
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  );
}
