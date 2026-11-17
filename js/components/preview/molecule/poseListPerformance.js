const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

export const comparePoseText = (a, b, ascending) => {
  const first = ascending ? a : b;
  return first == null ? undefined : collator.compare(first, ascending ? b : a);
};

export const prependSelectedObservations = (observations, selectedIds, allObservations) => {
  const included = new Set(observations.map(observation => observation.id));
  const byId = new Map();
  // Keep the first occurrence, matching the former Array.find lookup.
  allObservations.forEach(observation => {
    if (!byId.has(observation.id)) byId.set(observation.id, observation);
  });
  const added = [];
  selectedIds?.forEach(id => {
    if (included.has(id) || !byId.has(id)) return;
    added.push(byId.get(id));
    included.add(id);
  });
  // The caller's tag-editor path can append/sort this array. Always return an
  // owned array, even when all selected observations were already included.
  return [...added, ...observations];
};

export const createPoseMembershipSelector = () => {
  let previous = [];
  return (poses, observations) => {
    const ids = new Set(observations.map(observation => observation.id));
    const compounds = new Set(observations.map(observation => observation.cmpd));
    const next = poses.filter(
      pose => compounds.has(pose.compound) && pose.associatedObs.some(observation => ids.has(observation.id))
    );
    if (next.length !== previous.length || next.some((pose, index) => pose !== previous[index])) previous = next;
    return previous;
  };
};
