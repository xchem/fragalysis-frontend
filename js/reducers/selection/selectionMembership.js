// Index immutable selection arrays once. These caches stay outside Redux and snapshots.
const valueIndices = new WeakMap();
const objectIdIndices = new WeakMap();
const EMPTY_LIST = [];

const membershipIndex = (list, objectIds) => {
  const source = list || EMPTY_LIST;
  const cache = objectIds ? objectIdIndices : valueIndices;
  if (!cache.has(source)) cache.set(source, new Set(objectIds ? source.map(item => item.id) : source));
  return cache.get(source);
};

export const hasObservationMembership = (list, observations, objectIds = false) => {
  const index = membershipIndex(list, objectIds);
  return (observations || []).some(observation => index.has(observation.id));
};

export const hasIdMembership = (list, ids, objectIds = false) => {
  const index = membershipIndex(list, objectIds);
  return (ids || []).some(id => index.has(id));
};

const ROW_LISTS = Object.entries({
  ligands: 'fragmentDisplayList',
  proteins: 'proteinList',
  artefacts: 'artefactsChainList',
  complexes: 'complexList',
  surfaces: 'surfaceList',
  densities: 'densityList',
  quality: 'qualityList',
  vectors: 'vectorOnList'
});

// Reuse the previous row subset unless its actual observation references changed.
// Most completions affect another pose, so that path allocates no new subset.
const selectedObservations = (observations, index, previous = EMPTY_LIST) => {
  let selected;
  let count = 0;
  for (const observation of observations || EMPTY_LIST) {
    if (!index.has(observation.id)) continue;
    if (!selected && previous[count] !== observation) selected = previous.slice(0, count);
    if (selected) selected.push(observation);
    count++;
  }
  if (selected) return selected;
  return count === previous.length ? previous : previous.slice(0, count);
};

export const createPoseRowSelectionSelector = () => {
  let previousObservations;
  let previousSelection;
  const previousLists = {};
  let previousResult;
  return (state, observations) => {
    const selection = state.selectionReducers;
    if (previousResult && previousSelection === selection && previousObservations === observations)
      return previousResult;
    let nextResult = previousResult;
    for (const [key, field] of ROW_LISTS) {
      const list = selection[field] || EMPTY_LIST;
      if (previousResult && previousObservations === observations && previousLists[key] === list) continue;
      previousLists[key] = list;
      const subset = selectedObservations(
        observations,
        membershipIndex(list, key === 'densities'),
        previousResult?.[key]
      );
      if (!previousResult || subset !== previousResult[key]) {
        if (nextResult === previousResult) nextResult = { ...previousResult };
        nextResult[key] = subset;
      }
    }
    previousObservations = observations;
    previousSelection = selection;
    previousResult = nextResult;
    return nextResult;
  };
};
