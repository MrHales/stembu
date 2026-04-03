import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { calculateGovernmentType } from '../utils/governmentLogic';

export default function GovernmentTypeSection({ selectedAuthority, selectedCivics, selectedEthics }) {
  const [govTypes, setGovTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calculatedType, setCalculatedType] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/Government type - Sheet1.csv`);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const types = results.data.filter(row => row['Government type'] && row['Government type'].trim() !== '');
            setGovTypes(types);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to load Government Types", err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (govTypes.length > 0 && selectedAuthority) {
      const type = calculateGovernmentType([selectedAuthority], selectedCivics, selectedEthics, govTypes);
      setCalculatedType(type);
    } else {
      setCalculatedType(null);
    }
  }, [selectedAuthority, selectedCivics, selectedEthics, govTypes]);

  if (loading) return <div className="placeholder-content">Parsing societal algorithms...</div>;

  if (!selectedAuthority) {
    return <div className="placeholder-content">Select an Authority to determine your Government Type.</div>;
  }

  return (
    <div style={{ padding: '1rem', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px' }}>
      <h3 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem', textAlign: 'center' }}>
        {calculatedType ? calculatedType['Government type'] : 'Unknown Government'}
      </h3>
      {calculatedType && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', fontSize: '0.9rem' }}>
           <div><strong style={{ color: 'var(--color-text-muted)' }}>Ruler Title:</strong> {calculatedType['Ruler title'] || 'None'}</div>
           <div><strong style={{ color: 'var(--color-text-muted)' }}>Heir Title:</strong> {calculatedType['Heir title'] || 'None'}</div>
           <div><strong style={{ color: 'var(--color-text-muted)' }}>Favored Class:</strong> {calculatedType['Favored class'] || 'None'}</div>
        </div>
      )}
      {!calculatedType && (
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Combinations of current ethics and civics yield no standard government classification.
        </p>
      )}
    </div>
  );
}
