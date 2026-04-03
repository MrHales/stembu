export function checkCivicRequirements(requirements, context) {
  if (!requirements) return true;
  
  const { authority, ethics, origin, speciesType } = context;
  
  // Context normalization
  const authName = authority?.name?.toLowerCase();
  const originName = origin?.name?.toLowerCase();
  const ethicsNames = ethics?.map(e => e.name.toLowerCase()) || [];
  const lowerSpecies = speciesType?.toLowerCase();
  
  const lines = requirements.split('\n');
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    const isNegation = line.toLowerCase().startsWith('not ');
    const term = isNegation ? line.substring(4).trim() : line;
    
    const options = term.split(/\s+or\s+/i);
    const anyOptionMet = options.some(opt => {
      const o = opt.trim().toLowerCase();
      
      // 1. Check Authority
      if (authName === o) return true;
      
      // 2. Check Ethics (handle exact or fanatic versions)
      if (ethicsNames.some(ename => {
         if (ename === o) return true;
         // Handle mapping for generic terms like "egalitarian" to "fanatic egalitarian"
         if (o === 'egalitarian' && ename === 'fanatic egalitarian') return true;
         if (o === 'authoritarian' && ename === 'fanatic authoritarian') return true;
         if (o === 'militarist' && ename === 'fanatic militarist') return true;
         if (o === 'xenophobe' && ename === 'fanatic xenophobe') return true;
         if (o === 'xenophile' && ename === 'fanatic xenophile') return true;
         if (o === 'spiritualist' && ename === 'fanatic spiritualist') return true;
         if (o === 'materialist' && ename === 'fanatic materialist') return true;
         if (o === 'pacifist' && ename === 'fanatic pacifist') return true;
         return false;
      })) return true;
      
      // 3. Check Origin
      if (originName === o) return true;
      
      // 4. Check Species
      if (lowerSpecies && o.includes('species')) {
         if (o.includes(lowerSpecies)) return true;
         if (o.includes('organic') && speciesType !== 'Machine') return true;
         if (o.includes('machine') && speciesType === 'Machine') return true;
      }

      return false;
    });

    if (isNegation) {
      if (anyOptionMet) return false;
    } else {
      if (!anyOptionMet) return false;
    }
  }
  
  return true;
}
