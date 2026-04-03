import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function OriginSection({ selectedOrigin, onOriginSelect, onOriginInfoClick }) {
  const [origins, setOrigins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/Origin - Sheet1.csv`);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedOrigins = results.data.filter(row => row.Name && row.Name.trim() !== '');
            setOrigins(parsedOrigins);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to load Origins", err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="placeholder-content">Tracing historical origins...</div>;

  return (
    <div className="scrollable-viewport">
      <div className="traits-container">
        {origins.map((origin, index) => {
          const isSelected = selectedOrigin?.name === origin.Name;
          const classNames = `selectable-card ${isSelected ? 'selected' : ''}`;

          return (
            <div 
              key={`${origin.Name}-${index}`}
              className={classNames}
              style={{ marginBottom: '0.8rem' }}
              onClick={(e) => {
                 onOriginSelect(isSelected ? null : { name: origin.Name, ...origin });
              }}
            >
              <div className="traits-header" style={{ alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, marginBottom: '0.2rem' }}>{origin.Name}</h4>
                  {origin.Requirements && origin.Requirements.trim() && (
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
                       onOriginInfoClick({
                         name: origin.Name,
                         description: 'Empire effects: ' + origin['Empire effects'],
                         effects: 'Homeworld effects: ' + origin['Homeworld effects'],
                         requirements: origin.Requirements,
                         points: 0
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
                {origin['Empire effects']}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  );
}
