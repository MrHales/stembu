import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function SpeciesTraitsSection({ speciesType, selectedTraits, onTraitToggle, onTraitInfoClick }) {
  const [traits, setTraits] = useState([]);
  const [loading, setLoading] = useState(false);

  // Stellaris defaults
  const maxPicks = 5;
  const startingPoints = 2; // Can adjust based on species or origin later

  useEffect(() => {
    if (!speciesType) {
      setTraits([]);
      return;
    }

    setLoading(true);

    const isMachine = speciesType === 'Machine';
    const filename = isMachine 
      ? `${import.meta.env.BASE_URL}data/Machine Species Traits - Sheet1.csv`
      : `${import.meta.env.BASE_URL}data/Biological Species Traits - Sheet1.csv`;

    async function loadData() {
      try {
        const response = await fetch(filename);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Filter and clean results
            const cleanTraits = results.data
              .filter(row => row.Trait && row.Trait.trim() !== '')
              .map(row => ({
                 name: row.Trait.trim(),
                 effects: row.Effects === '#ERROR!' ? 'Various implicit effects' : row.Effects,
                 points: parseInt(row['Trait Points']?.toString().replace(/[−–—]/g, '-')) || 0,
                 description: row.Description || '',
                 conflicts: row.Conflicts || '',
                 requirements: row.Requirements || ''
              }));
            setTraits(cleanTraits);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to load Traits", err);
        setLoading(false);
      }
    }
    loadData();
  }, [speciesType]);

  if (!speciesType) return <div className="placeholder-content">Awaiting Species Type Selection...</div>;
  if (loading) return <div className="placeholder-content">Loading genetic traits database...</div>;

  const currentPoints = startingPoints - selectedTraits.reduce((acc, t) => acc + t.points, 0);
  const currentPicks = selectedTraits.length;
  
  const pointsClass = currentPoints < 0 ? 'text-danger' : 'text-accent';
  const picksClass = currentPicks > maxPicks ? 'text-danger' : 'text-accent';

  return (
    <div className="traits-container">
      <div className="traits-header">
        <h3 style={{ margin: 0 }}>Trait Pool: {speciesType === 'Machine' ? 'Mechanical' : 'Biological'}</h3>
        <div className="trait-stats">
          <span className={pointsClass}>Trait Points Available: {currentPoints}</span>
          <br/>
          <span className={picksClass}>Trait Picks: {currentPicks} / {maxPicks}</span>
        </div>
      </div>
      
      <div className="scrollable-viewport">
        <div className="card-grid">
          {traits.map(trait => {
            const isSelected = selectedTraits.some(t => t.name === trait.name);
            const hasConflict = !isSelected && selectedTraits.some(st => 
              (st.conflicts && st.conflicts.split('\n').map(c=>c.trim()).includes(trait.name)) || 
              (trait.conflicts && trait.conflicts.split('\n').map(c=>c.trim()).includes(st.name))
            );
            
            const reqs = trait.requirements ? trait.requirements.split('\n').map(r => r.trim()).filter(Boolean) : [];
            const meetsRequirement = reqs.length === 0 || reqs.includes(speciesType);
            const isRestricted = !isSelected && (!meetsRequirement || hasConflict);
            
            return (
              <div 
                key={trait.name} 
                className={`selectable-card ${isSelected ? 'selected' : ''} ${isRestricted ? 'conflict opacity-50' : ''}`}
                onClick={(e) => {
                  if (!isRestricted) onTraitToggle(trait);
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ paddingRight: '1rem' }}>
                    <h4 style={{ marginBottom: '0.2rem' }}>{trait.name}</h4>
                    <span className={`trait-cost ${trait.points < 0 ? 'negative' : 'positive'}`}>
                      {trait.points > 0 ? `-${trait.points}` : `+${Math.abs(trait.points)}`} pt
                    </span>
                  </div>
                  
                  <button 
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', zIndex: 10, position: 'relative' }}
                    onClick={(e) => {
                      e.stopPropagation(); // prevent toggling the trait when opening more info
                      onTraitInfoClick(trait);
                    }}
                  >
                    ?
                  </button>
                </div>
                {hasConflict && <small className="text-danger" style={{display: 'block', marginTop: '10px'}}>Conflicts with selected trait</small>}
                {!meetsRequirement && !isSelected && <small className="text-danger" style={{display: 'block', marginTop: '10px'}}>Requirements not met</small>}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
