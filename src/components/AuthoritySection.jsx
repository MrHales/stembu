import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function AuthoritySection({ selectedAuthority, onSelectAuthority, speciesType, selectedEthics, onAuthorityInfoClick }) {
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
            let isGestalt = (selectedEthics || []).some(e => e.name === 'Gestalt Consciousness');

            if (isGestalt) {
              data = data.filter(row => row.Authority.includes('Intelligence') || row.Authority === 'Hive Mind');
            } else {
              data = data.filter(row => !row.Authority.includes('Intelligence') && row.Authority !== 'Hive Mind');
              // Machine type might be restricted from regular authorities without certain civics or traits but we'll apply basic filters
              if (speciesType === 'Machine') {
                data = data.filter(row => row.Authority === 'Corporate' || row.Authority === 'Dictatorial' || row.Authority === 'Democratic' || row.Authority === 'Oligarchic' || row.Authority === 'Imperial');
              }
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
  }, [speciesType, selectedEthics]);

  if (loading) return <div className="placeholder-content">Loading central data cores...</div>;

  return (
    <div className="scrollable-viewport">
      <div className="card-grid">
        {authorities.map(auth => {
          const isSelected = selectedAuthority?.name === auth.Authority;
          return (
            <div 
              key={auth.Authority} 
              className={`selectable-card ${isSelected ? 'selected' : ''}`}
              style={{ marginBottom: '0.8rem' }}
              onClick={() => onSelectAuthority({ name: auth.Authority, ...auth })}
            >
              <div className="traits-header" style={{ alignItems: 'flex-start', borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                <div>
                  <h4 style={{ margin: 0, marginBottom: '0.2rem' }}>{auth.Authority}</h4>
                  <span className="trait-effects">{auth.Election || 'No Elections'}</span>
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
                           effects: auth['Empire effects'],
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
