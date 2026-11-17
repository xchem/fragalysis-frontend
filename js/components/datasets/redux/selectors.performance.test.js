import { isAnyInspirationTurnedOn } from './selectors';

describe('inspiration membership during bulk loading', () => {
  it('does not copy 930 selected ligands for each row and preserves all supported selection types', () => {
    expect.hasAssertions();
    let reads = 0;
    const ligands = Array.from({ length: 930 }, (_, id) => id);
    ligands.forEach((id, index) =>
      Object.defineProperty(ligands, index, {
        get: () => {
          reads++;
          return id;
        }
      })
    );
    const state = {
      selectionReducers: {
        fragmentDisplayList: ligands,
        proteinList: [],
        complexList: [],
        surfaceList: [],
        densityList: [{ id: 999 }],
        vectorOnList: []
      }
    };
    for (let id = 0; id < 930; id++) expect(isAnyInspirationTurnedOn(state, [id])).toBe(true);
    expect(reads).toBe(930);
    expect(isAnyInspirationTurnedOn(state, ['1'])).toBe(false);
    expect(isAnyInspirationTurnedOn(state, [999])).toBe(true);
    expect(isAnyInspirationTurnedOn(state, [])).toBe(false);
  });
});
