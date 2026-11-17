// Index once per load. Results retain the source order and object references,
// including duplicate source IDs, just like observations.filter(...includes).
export const createObservationLookup = observations => {
  const byId = new Map();
  observations.forEach((observation, index) => {
    const matches = byId.get(observation.id) || [];
    matches.push({ observation, index });
    byId.set(observation.id, matches);
  });

  return ids => {
    const matches = [];
    new Set(ids).forEach(id => {
      const observationsForId = byId.get(id);
      if (observationsForId) matches.push(...observationsForId);
    });
    matches.sort((a, b) => a.index - b.index);
    return matches.map(match => match.observation);
  };
};
