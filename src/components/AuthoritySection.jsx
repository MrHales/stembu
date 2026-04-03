import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function AuthoritySection({ selectedAuthority, onSelectAuthority, speciesType, selectedEthics }) {
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
              onClick={() => onSelectAuthority({ name: auth.Authority, ...auth })}
            >
              <h4>{auth.Authority}</h4>
              <span className="trait-effects">{auth.Election || 'No Elections'}</span>
            </div>
          )
        })}
      </div>
    </div>
  );
}
