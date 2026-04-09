import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { checkRequirements } from '../utils/requirements';

export default function OriginSection({ selectedOrigin, onOriginSelect, onOriginInfoClick, speciesType, selectedEthics, civics, homeworldType }) {
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
          
          const isGestaltEthic = selectedEthics ? selectedEthics.some(e => e.name === 'Gestalt Consciousness') : false;
          const isHiveMind = isGestaltEthic && speciesType !== 'Machine';
          const isMachineIntell = isGestaltEthic && speciesType === 'Machine';
          
          let hasGovernmentConflict = false;
          if (isHiveMind && origin['Gestalt consciousness'] !== 'x') {
             hasGovernmentConflict = true;
          }
          if (isMachineIntell && origin['Machine intelligence'] !== 'x') {
             hasGovernmentConflict = true;
          }
          
          let meetReqs = checkRequirements(origin.Requirements, {
             authority: null,
             ethics: selectedEthics,
             origin: null,
             speciesType: speciesType,
             civics: civics,
             homeworldType: homeworldType
          });

          const hasConflict = hasGovernmentConflict || !meetReqs;
          const classNames = `selectable-card ${isSelected ? 'selected' : ''} ${hasConflict ? 'conflict opacity-50' : ''}`;

          return (
            <div 
              key={`${origin.Name}-${index}`}
              className={classNames}
              style={{ marginBottom: '0.8rem' }}
              onClick={(e) => {
                 if (!hasConflict) {
                     onOriginSelect(isSelected ? null : { name: origin.Name, ...origin });
                 }
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
                         description: null,
                         effects: `Empire Effects:\n${origin['Empire effects']}\n\nHomeworld Effects:\n${origin['Homeworld effects']}`,
                         requirements: origin.Requirements
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
              {hasGovernmentConflict && <small className="text-danger" style={{display: 'block', marginTop: '10px'}}>Incompatible with current Government</small>}
              {!meetReqs && !hasGovernmentConflict && <small className="text-danger" style={{display: 'block', marginTop: '10px'}}>Requirements not met</small>}
            </div>
          )
        })}
      </div>
    </div>
  );
}
