import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function AuthoritySection({ selectedAuthority, onSelectAuthority, speciesType }) {
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
            // Filter Gestalt vs Standard based on speciesType if needed
            if (speciesType === 'Machine') {
               data = data.filter(row => row.Authority.includes('Intelligence') || row.Authority === 'Corporate'); // simplified
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
  }, [speciesType]);

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
