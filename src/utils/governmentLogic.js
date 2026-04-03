export function calculateGovernmentType(authorities, civics, ethics, governmentTypes) {
  if (!authorities.length || !governmentTypes.length) return null;

  const authority = authorities[0].name; // Only 1 authority
  const selectedCivics = civics.map(c => c.name);
  const selectedEthics = ethics.map(e => e.name.replace('Fanatic ', ''));

  // Parse strings, e.g., "1,000" -> 1000
  const parseWeight = (weightStr) => {
    if (!weightStr) return 0;
    const match = weightStr.match(/(\d+(?:,\d+)*)/);
    if (!match) return 0;
    return parseInt(match[1].replace(/,/g, ''), 10);
  };

  const validTypes = governmentTypes.filter(type => {
    // Check Authority
    if (type['Auth.'] !== 'Any' && type['Auth.'] && !type['Auth.'].includes(authority)) {
      return false;
    }

    // Check Other requirements
    const reqs = type['Other requirements'] || '';
    if (reqs && reqs !== '—') {
      const isMet = () => {
        // Simple heuristic: Does reqs contain one of our civics or ethics?
        // Note: Real Stellaris checks are more complex (e.g. "Either: X, Y").
        // We do a basic substring and matching logic for known rules.
        const reqLines = reqs.split('\n').map(l => l.trim()).filter(Boolean);
        
        let valid = false;
        // If it requires an ethic we don't have, and it's not an "Either" block
        // Actually, let's just check if ANY of the requirement words exactly match our civics or ethics.
        for (const civic of selectedCivics) {
          if (reqs.includes(civic)) return true;
        }
        for (const ethic of selectedEthics) {
          if (reqs.includes(ethic)) return true;
        }
        return valid;
      };

      if (!isMet()) {
        return false;
      }
    }
    return true;
  });

  if (validTypes.length === 0) return null;

  // Sort by weight
  validTypes.sort((a, b) => {
    const weightA = parseWeight(a.Weight);
    const weightB = parseWeight(b.Weight);

    if (weightA !== weightB) {
      return weightB - weightA;
    }

    // Tie-breaker logic
    // Spiritualist > Militarist > Materialist for ties
    const reqA = a['Other requirements'] || '';
    const reqB = b['Other requirements'] || '';

    const getTiePriority = (req) => {
      if (req.includes('Spiritualist')) return 3;
      if (req.includes('Militarist')) return 2;
      if (req.includes('Materialist')) return 1;
      return 0;
    };

    return getTiePriority(reqB) - getTiePriority(reqA);
  });

  return validTypes[0];
}
