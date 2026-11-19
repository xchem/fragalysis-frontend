export const MOORHEN_TUTORIAL_FILES = Object.freeze([
  Object.freeze({
    fileName: 'moorhen-tutorial-structure-number-1.pdb',
    relativeUrl: 'baby-gru/tutorials/moorhen-tutorial-structure-number-1.pdb'
  }),
  Object.freeze({
    fileName: 'moorhen-tutorial-map-number-1.mtz',
    relativeUrl: 'baby-gru/tutorials/moorhen-tutorial-map-number-1.mtz'
  })
]);

export const fetchMoorhenTutorialFiles = async ({ assetUrl, fetchImpl = fetch, FileConstructor = File, signal }) =>
  Promise.all(
    MOORHEN_TUTORIAL_FILES.map(async ({ fileName, relativeUrl }) => {
      const response = await fetchImpl(`${assetUrl}/${relativeUrl}`, signal ? { signal } : undefined);

      if (!response.ok) {
        throw new Error(`Unable to load ${fileName} (${response.status})`);
      }

      return new FileConstructor([await response.blob()], fileName);
    })
  );

export const getMoorhenContentCounts = store => {
  const state = store.getState();

  return {
    molecules: state.molecules.moleculeList.length,
    maps: state.maps.length
  };
};

export const assertMoorhenTutorialLoaded = store => {
  const counts = getMoorhenContentCounts(store);

  if (counts.molecules < 1 || counts.maps < 1) {
    throw new Error(`Moorhen loaded ${counts.molecules} molecule(s) and ${counts.maps} map(s)`);
  }

  return counts;
};
