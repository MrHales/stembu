import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function HomeworldSection({ homeworldName, setHomeworldName, selectedClimate, setSelectedClimate, selectedPlanet, setSelectedPlanet, onPlanetInfoClick }) {
  const [planets, setPlanets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/Habitable planets - Sheet1.csv`);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            let lastClimate = "";
            let lastFavored = "";
            const parsedPlanets = results.data.filter(row => row.Type && row.Type.trim() !== '').map(row => {
              if (row.Climate && row.Climate.trim() !== '') {
                lastClimate = row.Climate.trim();
                lastFavored = row['Favored features'] || '';
              } else if (['Desert', 'Arid', 'Savanna', 'Ocean', 'Continental', 'Tropical', 'Arctic', 'Alpine', 'Tundra'].includes(row.Type)) {
                row.Climate = lastClimate;
                row['Favored features'] = lastFavored;
              }
              return row;
            });
            setPlanets(parsedPlanets);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to load planets", err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="placeholder-content">Scanning celestial bodies...</div>;

  // We only show standard starting climates as requested
  const allowedClimates = ['Wet', 'Dry', 'Cold'];
  
  const filteredPlanets = planets.filter(p => p.Climate === selectedClimate);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          Homeworld Name
        </label>
        <input 
          type="text" 
          value={homeworldName}
          onChange={(e) => setHomeworldName(e.target.value)}
          placeholder="Earth, Unity, Prime..."
          style={{
            width: '100%',
            background: 'var(--color-bg-dark)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-main)',
            padding: '0.6rem 1rem',
            borderRadius: '4px',
            fontFamily: 'var(--font-heading)',
            outline: 'none'
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
         <label style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          Climate Preference
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {allowedClimates.map(climate => (
            <button 
              key={climate}
              className={selectedClimate === climate ? 'primary' : ''}
              onClick={() => {
                setSelectedClimate(climate);
                setSelectedPlanet(null); // Reset planet selection on climate change
              }}
              style={{ flex: 1 }}
            >
              {climate}
            </button>
          ))}
        </div>
      </div>

      {selectedClimate && (
        <div className="card-grid">
          {filteredPlanets.map(planet => (
            <div 
              key={planet.Type} 
              className={`selectable-card ${selectedPlanet?.name === planet.Type ? 'selected' : ''}`}
              onClick={() => setSelectedPlanet({ name: planet.Type, ...planet })}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4>{planet.Type}</h4>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlanetInfoClick({
                      name: planet.Type,
                      description: planet.Description,
                      effects: `Favored features: ${planet['Favored features'] || 'None'}`,
                      points: 0
                    });
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-accent)',
                    padding: '0',
                    fontSize: '1rem'
                  }}
                  title="More Info"
                >
                  ⓘ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
