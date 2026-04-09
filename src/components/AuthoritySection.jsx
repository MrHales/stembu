import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { checkRequirements } from '../utils/requirements';

export default function AuthoritySection({ 
    selectedAuthority, 
    onSelectAuthority, 
    speciesType, 
    selectedEthics, 
    onAuthorityInfoClick,
    civics,
    homeworldType
}) {
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/Government authority - Sheet1.csv`);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            let data = results.data.filter(row => row.Authority && row.Authority.trim() !== '');
            // We load all of them and let checkRequirements handle the disabling.
            // But we might still want to fully exclude Gestalt ones if they aren't Gestalt to prevent clutter.
            // Let's keep the Gestalt logic for basic filtering, but use checkRequirements for the rest
            
            let isGestalt = (selectedEthics || []).some(e => e.name === 'Gestalt Consciousness');

            if (isGestalt) {
              data = data.filter(row => row.Authority.includes('Intelligence') || row.Authority === 'Hive Mind');
            } else {
              data = data.filter(row => !row.Authority.includes('Intelligence') && row.Authority !== 'Hive Mind');
            }
            
            setAuthorities(data);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to load Authority Types", err);
        setLoading(false);
      }
    }
    loadData();
  }, [selectedEthics]);

  if (loading) return <div className="placeholder-content">Loading central data cores...</div>;

  return (
    <div className="scrollable-viewport">
      <div className="card-grid">
        {authorities.map(auth => {
          const isSelected = selectedAuthority?.name === auth.Authority;
          
          let meetReqs = checkRequirements(auth.Requirements, {
             authority: { name: auth.Authority },
             ethics: selectedEthics,
             origin: null,
             speciesType: speciesType,
             civics: civics,
             homeworldType: homeworldType
          });
          
          const hasConflict = !meetReqs;

          return (
            <div 
              key={auth.Authority} 
              className={`selectable-card ${isSelected ? 'selected' : ''} ${hasConflict ? 'conflict opacity-50' : ''}`}
              style={{ marginBottom: '0.8rem' }}
              onClick={() => {
                if (!hasConflict) {
                  onSelectAuthority({ name: auth.Authority, ...auth });
                }
              }}
            >
              <div className="traits-header" style={{ alignItems: 'flex-start', borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                <div>
                  <h4 style={{ margin: 0, marginBottom: '0.2rem' }}>{auth.Authority}</h4>
                  <span className="trait-effects">{auth.Election || 'No Elections'}</span>
                  {hasConflict && <span style={{ fontSize: '0.7rem', color: 'var(--color-danger)', display: 'block', marginTop: '0.4rem' }}>Requirements not met</span>}
                </div>
                <div className="trait-stats">
                   <button 
                     style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', zIndex: 10, position: 'relative' }}
                     onClick={(e) => {
                       e.stopPropagation();
                       if (onAuthorityInfoClick) {
                         onAuthorityInfoClick({
                           name: auth.Authority,
                           description: auth.Description,
                           effects: `Empire Effects:\n${auth['Empire effects']}\n\nRuler Effects per Level:\n${auth['Ruler effects per skill level']}`,
                           requirements: auth.Requirements
                         });
                       }
                     }}
                   >
                     ?
                   </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
