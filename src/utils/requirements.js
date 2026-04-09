export function checkRequirements(requirements, context) {
  if (!requirements) return true;
  
  const { authority, ethics, origin, speciesType, civics, homeworldType } = context;
  
  // Context normalization
  const authName = authority?.name?.toLowerCase();
  const originName = origin?.name?.toLowerCase();
  const ethicsNames = ethics?.map(e => e.name.toLowerCase()) || [];
  const lowerSpecies = speciesType?.toLowerCase() || '';
  const civicNames = civics?.map(c => c.name.toLowerCase()) || [];
  const lowerHomeworld = homeworldType?.toLowerCase() || '';

  const genocidalCivics = ['fanatic purifiers', 'devouring swarm', 'determined exterminator', 'terravore'];
  const hasGenocidal = civicNames.some(c => genocidalCivics.includes(c));
  
  const lines = requirements.split('\n');
  
  let inNegationBlock = false;
  let inEitherBlock = false;
  let eitherBlockMet = false;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.toLowerCase() === 'not any of the following:') {
      inNegationBlock = true;
      inEitherBlock = false;
      continue;
    }
    if (line.toLowerCase() === 'either:') {
      inEitherBlock = true;
      inNegationBlock = false;
      continue;
    }
    
    let isNegation = inNegationBlock || line.toLowerCase().startsWith('not ');
    let term = line;
    if (line.toLowerCase().startsWith('not ')) {
      term = line.substring(4).trim();
    }
    
    const options = term.split(/\s+or\s+/i);
    const anyOptionMet = options.some(opt => {
      const o = opt.trim().toLowerCase();
      
      if (o === 'genocidal' && hasGenocidal) return true;

      // 1. Check Authority
      if (authName === o) return true;
      if (o === 'dictatorial authority' && authName === 'dictatorial') return true;
      if (o === 'machine intelligence' && authName === 'machine intelligence') return true;
      
      // 2. Check Ethics
      if (ethicsNames.some(ename => {
         if (ename === o) return true;
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
      if (lowerSpecies && (o.includes('species') || o === 'machine intelligence')) {
         if (o.includes(lowerSpecies)) return true;
         if (o.includes('organic') && lowerSpecies !== 'machine') return true;
         if (o.includes('machine') && lowerSpecies === 'machine') return true;
      }

      // 5. Check Civics
      if (civics) {
         if (civicNames.includes(o)) return true;
      }

      // 6. Check Homeworld
      if (lowerHomeworld && o.includes('homeworld')) {
         if (o.includes(lowerHomeworld) || lowerHomeworld.includes(o.replace(' homeworld', '').trim())) return true;
      }

      // 7. General properties mapping
      if (o === 'gestalt consciousness' && ethicsNames.includes('gestalt consciousness')) return true;

      return false;
    });

    if (inEitherBlock) {
       // If it's a negated line inside an either block ("Not Devouring Swarm" at the end of either)
       if (isNegation) {
          if (anyOptionMet) return false; 
       } else {
          if (anyOptionMet) eitherBlockMet = true;
       }
    } else if (isNegation) {
      if (anyOptionMet) return false;
    } else {
      if (!anyOptionMet) return false;
    }
  }
  
  if (inEitherBlock && !eitherBlockMet) return false;

  return true;
}
