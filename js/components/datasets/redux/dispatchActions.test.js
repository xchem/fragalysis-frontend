import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { loadDatasetCompoundsWithScores } from './dispatchActions';
import { addMoleculeList } from './actions';

jest.mock('../../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));

describe('dataset preparation', () => {
  it('prepares all dataset members with numeric ordering, strict IDs and independent arrays', async () => {
    expect.hasAssertions();
    const observations = Object.freeze([{ id: 3 }, { id: 1 }, { id: '1' }, { id: 2 }, { id: 1, duplicate: true }]);
    const datasets = [
      { id: 10, site_observations: [3, 1, 1, 99] },
      { id: 11, site_observations: ['1', 2] },
      { id: 12, site_observations: [] }
    ];
    const store = configureStore([thunk])({ apiReducers: { all_mol_lists: observations } });
    await store.dispatch(loadDatasetCompoundsWithScores(datasets));
    const expected = datasets.map(dataset =>
      addMoleculeList(
        dataset.id,
        observations
          .filter(observation => dataset.site_observations.includes(observation.id))
          .sort((a, b) => a.id - b.id)
      )
    );
    expect(store.getActions()).toStrictEqual(expected);
    expect(store.getActions()[0].payload.moleculeList[0]).toBe(observations[1]);
    expect(store.getActions()[1].payload.moleculeList[0]).toBe(observations[2]);
  });
});
