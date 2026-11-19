import {
  MOORHEN_TUTORIAL_FILES,
  assertMoorhenTutorialLoaded,
  fetchMoorhenTutorialFiles,
  getMoorhenContentCounts
} from './moorhenProofResources';

describe('Moorhen proof resources', () => {
  it('includes a tutorial structure and map', () => {
    expect(MOORHEN_TUTORIAL_FILES.map(file => file.fileName)).toEqual([
      'moorhen-tutorial-structure-number-1.pdb',
      'moorhen-tutorial-map-number-1.mtz'
    ]);
  });

  it('fetches files from the configured Moorhen asset root', async () => {
    const fetchImpl = jest.fn(url =>
      Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob([url]))
      })
    );

    const files = await fetchMoorhenTutorialFiles({ assetUrl: '/bundles/moorhen', fetchImpl });

    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      '/bundles/moorhen/baby-gru/tutorials/moorhen-tutorial-structure-number-1.pdb',
      undefined
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      '/bundles/moorhen/baby-gru/tutorials/moorhen-tutorial-map-number-1.mtz',
      undefined
    );
    expect(files.map(file => file.name)).toEqual(MOORHEN_TUTORIAL_FILES.map(file => file.fileName));
  });

  it('reports failed asset requests', async () => {
    await expect(
      fetchMoorhenTutorialFiles({
        assetUrl: '/bundles/moorhen',
        fetchImpl: () => Promise.resolve({ ok: false, status: 404 })
      })
    ).rejects.toThrow('Unable to load moorhen-tutorial-structure-number-1.pdb (404)');
  });

  it('checks that both molecule and map data reached the store', () => {
    const store = {
      getState: () => ({ molecules: { moleculeList: [{}] }, maps: [{}, {}] })
    };

    expect(getMoorhenContentCounts(store)).toEqual({ molecules: 1, maps: 2 });
    expect(assertMoorhenTutorialLoaded(store)).toEqual({ molecules: 1, maps: 2 });
  });

  it('rejects an incomplete proof load', () => {
    const store = {
      getState: () => ({ molecules: { moleculeList: [{}] }, maps: [] })
    };

    expect(() => assertMoorhenTutorialLoaded(store)).toThrow('Moorhen loaded 1 molecule(s) and 0 map(s)');
  });
});
