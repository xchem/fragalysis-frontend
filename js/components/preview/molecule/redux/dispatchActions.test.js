import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { appendToBeDisplayedList } from '../../../../reducers/selection/actions';
import { NGL_OBJECTS } from '../../../../reducers/ngl/constants';
import { initializeMolecules } from './dispatchActions';

describe('initializeMolecules', () => {
  const mockStore = configureStore([thunk]);

  it('initially displays the ligand and sidechains without artefact chains', async () => {
    const tag = { id: 10, tag: 'Site 1', category: 1, hidden: false };
    const observation = { id: 7, tags_set: [tag.id] };
    const store = mockStore({
      apiReducers: {
        noTagsReceived: false,
        isSnapshot: false,
        direct_access: {},
        tagList: [tag],
        lhs_compounds_list: [{ associatedObs: [observation] }]
      }
    });

    await store.dispatch(initializeMolecules({}));

    const displayActionType = appendToBeDisplayedList({}).type;
    const displayedTypes = store
      .getActions()
      .filter(action => action.type === displayActionType)
      .map(action => action.item.type);

    expect(displayedTypes).toStrictEqual([NGL_OBJECTS.PROTEIN, NGL_OBJECTS.LIGAND]);
    expect(displayedTypes).not.toContain(NGL_OBJECTS.ARTEFACTS);
  });
});
