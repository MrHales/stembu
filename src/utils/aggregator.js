export function aggregateEffects(effectStrings) {
  const numericTotals = {}; // key: "Description|isPercent"
  const uniqueFeatures = new Set();

  effectStrings.forEach(raw => {
    if (!raw) return;
    // Split by common delimiters and newlines
    const lines = raw.split(/[\n\r,]+|(?:\.\s+)/);
    
    lines.forEach(line => {
      let l = line.trim();
      if (!l || l.toLowerCase() === 'none') return;
      
      // 1. Remove PNG icon references (e.g., "Happiness.png")
      l = l.replace(/[A-Za-z0-9_-]+\.png\s*/gi, '');
      
      // 2. Normalize minus sign to standard hyphen if needed for parsing
      l = l.replace('−', '-');

      // 3. Regex to extract numeric value and description
      // Pattern A: Value at start: "+10% Research speed"
      // Pattern B: Value at end: "Research speed +10%"
      const valAtStart = l.match(/^([+-]?[\d.]+)(%?)\s*(.*)$/);
      const valAtEnd = l.match(/^(.*?)\s*([+-]?[\d.]+)(%?)$/);
      
      if (valAtStart && valAtStart[1] && !isNaN(parseFloat(valAtStart[1]))) {
        const value = parseFloat(valAtStart[1]);
        const isPercent = valAtStart[2] === '%';
        const description = valAtStart[3].trim();
        
        if (description) {
          const key = `${description}|${isPercent}`;
          numericTotals[key] = (numericTotals[key] || 0) + value;
        } else {
          uniqueFeatures.add(l);
        }
      } else if (valAtEnd && valAtEnd[2] && !isNaN(parseFloat(valAtEnd[2]))) {
        const description = valAtEnd[1].trim();
        const value = parseFloat(valAtEnd[2]);
        const isPercent = valAtEnd[3] === '%';
        
        if (description) {
          const key = `${description}|${isPercent}`;
          numericTotals[key] = (numericTotals[key] || 0) + value;
        } else {
          uniqueFeatures.add(l);
        }
      } else {
        // Qualitative feature (e.g., "Can build Noble Estates")
        uniqueFeatures.add(l);
      }
    });
  });

  // Convert to formatted display objects
  const numeric = Object.entries(numericTotals)
    .map(([key, value]) => {
      const [description, isPercentStr] = key.split('|');
      return {
        description,
        value,
        isPercent: isPercentStr === 'true'
      };
    })
    .filter(item => item.value !== 0) // Hide zero totals
    .sort((a, b) => a.description.localeCompare(b.description));

  return {
    numeric,
    features: Array.from(uniqueFeatures).sort()
  };
}
