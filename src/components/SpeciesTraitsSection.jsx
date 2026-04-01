import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function SpeciesTraitsSection({ speciesType, selectedTraits, onTraitToggle }) {
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
      ? '/data/Machine Species Traits - Sheet1.csv'
      : '/data/Biological Species Traits - Sheet1.csv';

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
                 points: parseInt(row['Trait Points']) || 0,
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
      
      <div className="card-grid">
        {traits.map(trait => {
          const isSelected = selectedTraits.some(t => t.name === trait.name);
          const hasConflict = !isSelected && selectedTraits.some(st => 
            (st.conflicts && st.conflicts.includes(trait.name)) || 
            (trait.conflicts && trait.conflicts.includes(st.name))
          );
          
          return (
            <div 
              key={trait.name} 
              className={`selectable-card ${isSelected ? 'selected' : ''} ${hasConflict ? 'conflict opacity-50' : ''}`}
              onClick={() => {
                if (!hasConflict) onTraitToggle(trait);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4>{trait.name}</h4>
                <span className={`trait-cost ${trait.points < 0 ? 'negative' : 'positive'}`}>
                  {trait.points > 0 ? `-${trait.points}` : `+${Math.abs(trait.points)}`} pt
                </span>
              </div>
              <p className="trait-description">{trait.description}</p>
              {trait.effects && <small className="trait-effects">{trait.effects}</small>}
              {hasConflict && <small className="text-danger" style={{display: 'block', marginTop: '5px'}}>Conflicts with selected trait</small>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
