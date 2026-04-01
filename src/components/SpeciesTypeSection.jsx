import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function SpeciesTypeSection({ onSelectType, selectedType }) {
  const [speciesTypes, setSpeciesTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/Species type - Sheet1.csv`);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // The CSV just has a 'Name' column
            const parsedTypes = results.data.map(row => row.Name).filter(Boolean);
            setSpeciesTypes(parsedTypes);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to load Species Types", err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="placeholder-content">Loading genetic database...</div>;

  return (
    <div className="card-grid">
      {speciesTypes.map(type => (
        <div 
          key={type} 
          className={`selectable-card ${selectedType === type ? 'selected' : ''}`}
          onClick={() => onSelectType(type)}
        >
          <h4>{type}</h4>
        </div>
      ))}
    </div>
  );
}
