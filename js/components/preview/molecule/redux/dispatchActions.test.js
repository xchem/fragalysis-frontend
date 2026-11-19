import configureStore from 'redux-mock-store';
import { applyMiddleware, legacy_createStore } from 'redux';
import { thunk } from 'redux-thunk';
import {
  appendToBeDisplayedList,
  appendRHSSelectedTag,
  setRHSCompoundsInitialized,
  setRHSSelectedTags
} from '../../../../reducers/selection/actions';
import { selectionReducers } from '../../../../reducers/selection/selectionReducers';
import { NGL_OBJECTS } from '../../../../reducers/ngl/constants';
import { initializeMolecules, initializeRHSMolecules } from './dispatchActions';
import {
  createSnapshotStateForSaving,
  mergeSnapshotStateWithCurrentData
} from '../../../snapshot/redux/utilitySnapshotShapes';

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

describe('initial RHS tag selection', () => {
  const mockStore = configureStore([thunk]);
  const firstTag = { id: 10, tag: 'Design A', category: 8, hidden: false, meta_category: 'rhs' };
  const secondTag = { ...firstTag, id: 11, tag: 'Design B' };
  const lhsTag = { ...firstTag, id: 1, tag: 'Site A', meta_category: 'lhs' };
  const baseState = () => ({
    apiReducers: { isSnapshot: true, direct_access: {}, tagList: [secondTag, lhsTag, firstTag] },
    selectionReducers: {
      ...selectionReducers(undefined, {}),
      lhs_selectedTagList: [lhsTag],
      areRHSCompoundsInitialized: false,
      rhs_selectedTagList: []
    },
    previewReducers: { viewerControls: { sidesOpen: { LHS: true, RHS: false } } },
    datasetsReducers: { toBeDisplayedList: {} },
    nglReducers: { objectsInView: { ligand: { id: 1 } }, nglOrientations: { major_view: { elements: [1, 2, 3] } } }
  });

  it('initializes only the tag when opening Designs after restoring a snapshot saved before its first opening', () => {
    expect.hasAssertions();
    const source = baseState();
    const snapshot = createSnapshotStateForSaving(source);
    expect(snapshot.previewReducers.viewerControls.sidesOpen.RHS).toBe(false);
    expect(snapshot.selectionReducers.rhs_selectedTagList).toStrictEqual([]);
    expect(snapshot.selectionReducers.areRHSCompoundsInitialized).toBe(false);

    const current = baseState();
    current.selectionReducers.areRHSCompoundsInitialized = true;
    current.selectionReducers.rhs_selectedTagList = [secondTag];
    const restored = mergeSnapshotStateWithCurrentData(current, snapshot);
    const store = legacy_createStore(
      (state = restored, action) => ({
        ...state,
        selectionReducers: selectionReducers(state.selectionReducers, action)
      }),
      applyMiddleware(thunk)
    );
    store.dispatch(initializeRHSMolecules());
    store.dispatch(initializeRHSMolecules());
    const state = store.getState();
    expect(state.selectionReducers.rhs_selectedTagList).toStrictEqual([firstTag]);
    expect(state.selectionReducers.lhs_selectedTagList).toStrictEqual([lhsTag]);
    expect(state.selectionReducers.toBeDisplayedList).toBe(restored.selectionReducers.toBeDisplayedList);
    expect(state.datasetsReducers).toBe(restored.datasetsReducers);
    expect(state.nglReducers).toBe(restored.nglReducers);

    // After initialization, clearing all tags is an intentional saved choice.
    store.dispatch(setRHSCompoundsInitialized(true));
    store.dispatch(setRHSSelectedTags([]));
    const cleared = createSnapshotStateForSaving(store.getState());
    const clearedStore = mockStore(mergeSnapshotStateWithCurrentData(current, cleared));
    clearedStore.dispatch(initializeRHSMolecules());
    expect(clearedStore.getActions()).toStrictEqual([]);
  });

  it.each([true, false])('preserves a saved RHS tag with initialization flag %s', initialized => {
    expect.hasAssertions();
    const state = baseState();
    state.selectionReducers.areRHSCompoundsInitialized = initialized;
    state.selectionReducers.rhs_selectedTagList = [secondTag];
    const store = mockStore(state);
    store.dispatch(initializeRHSMolecules());
    expect(store.getActions()).toStrictEqual([]);
  });

  it.each([true, undefined])(
    'does not guess a default for an empty snapshot selection with initialization flag %s',
    initialized => {
      expect.hasAssertions();
      const state = baseState();
      state.selectionReducers.areRHSCompoundsInitialized = initialized;
      const store = mockStore(state);
      store.dispatch(initializeRHSMolecules());
      expect(store.getActions()).toStrictEqual([]);
    }
  );

  it.each(['rhs_displayAllMolecules', 'rhs_displayUntaggedMolecules', 'isCoordinateFilterAppliedRHS'])(
    'preserves the saved %s filter instead of choosing a tag',
    filter => {
      expect.hasAssertions();
      const state = baseState();
      state.selectionReducers[filter] = true;
      const store = mockStore(state);
      store.dispatch(initializeRHSMolecules());
      expect(store.getActions()).toStrictEqual([]);
    }
  );

  it.each([true, false])('keeps direct-display initialization disabled with snapshot mode %s', isSnapshot => {
    expect.hasAssertions();
    const state = baseState();
    state.apiReducers = { ...state.apiReducers, isSnapshot, direct_access: { molecules: [1] } };
    const store = mockStore(state);
    store.dispatch(initializeRHSMolecules());
    expect(store.getActions()).toStrictEqual([]);
  });

  it.each([true, false])('selects the first eligible RHS tag with snapshot mode %s', isSnapshot => {
    expect.hasAssertions();
    const state = baseState();
    state.apiReducers.isSnapshot = isSnapshot;
    state.apiReducers.tagList.push(
      { ...firstTag, id: 21, tag: 'A hidden', hidden: true },
      { ...firstTag, id: 22, tag: 'A download', additional_info: { downloadName: 'Download' } },
      { ...firstTag, id: 23, tag: 'A legacy LHS', meta_category: null }
    );
    const store = mockStore(state);
    store.dispatch(initializeRHSMolecules());
    // No structure-display or camera actions should accompany the UI selection.
    expect(store.getActions()).toStrictEqual([appendRHSSelectedTag(firstTag)]);
  });

  it('leaves the selection empty when no eligible RHS tags exist', () => {
    expect.hasAssertions();
    const state = baseState();
    state.apiReducers.tagList = [lhsTag];
    const store = mockStore(state);
    store.dispatch(initializeRHSMolecules());
    expect(store.getActions()).toStrictEqual([]);
  });
});
