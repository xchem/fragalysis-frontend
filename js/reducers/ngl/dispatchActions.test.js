import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState,
  deleteObject,
  loadObject,
  reloadNglViewFromSnapshot,
  setOrientation,
  setProteinsHasLoaded
} from './dispatchActions';
import { CONSTANTS, SCENES } from './constants';
import { getAction, getActionType } from '../../utils/testUtils';
import {
  decrementCountOfPendingNglObjects,
  decrementCountOfRemainingMoleculeGroups,
  deleteNglObject,
  incrementCountOfPendingNglObjects,
  loadNglObject,
  resetStateToDefaultScene,
  setNglStateFromCurrentSnapshot,
  saveCurrentStateAsDefaultScene,
  setNglOrientation,
  setProteinLoadingState
} from './actions';
import { OBJECT_TYPE, SELECTION_TYPE } from '../../components/nglView/constants';
import { removeFromComplexList, removeFromFragmentDisplayList, removeFromVectorOnList } from '../selection/actions';
const { fn } = jest;

describe("testing ngl reducer's async actions", () => {
  const middlewares = [thunk]; // add your middlewares like `redux-thunk`
  const mockStore = configureStore(middlewares);

  it('should load object', () => {
    expect.hasAssertions();
    let store = mockStore();
    const target = {
      name: 'My protein',
      OBJECT_TYPE: OBJECT_TYPE.PROTEIN,
      property: { a: 'sdff' }
    };

    const stage = {
      loadFile: fn(() =>
        Promise.resolve({
          addRepresentation: fn(() => ({
            uuid: null,
            getParameters: fn(() => {}),
            repr: { parameters: {} }
          })),
          autoView: fn()
        })
      )
    };

    // eslint-disable-next-line jest/no-test-return-statement
    return store
      .dispatch(loadObject(target, stage))
      .then(async result => {
        expect(result.type).toBe(await getActionType(loadNglObject));
        expect(result.target).toStrictEqual(target);
        expect(result.representations.length).toBeGreaterThan(0);
      })
      .finally(async () => {
        expect(await getAction(store, incrementCountOfPendingNglObjects)).not.toBeNull();
        expect(await getAction(store, decrementCountOfPendingNglObjects)).not.toBeNull();
      });
  });

  it('should delete object', async () => {
    expect.hasAssertions();
    let store = mockStore();
    const targetLigand = {
      selectionType: SELECTION_TYPE.LIGAND,
      moleculeId: 1
    };
    const targetComplex = {
      selectionType: SELECTION_TYPE.COMPLEX,
      moleculeId: 2
    };
    const targetVector = {
      selectionType: SELECTION_TYPE.VECTOR,
      moleculeId: 3
    };

    const stage = {
      loadFile: fn(() =>
        Promise.resolve({
          addRepresentation: fn(() => ({
            uuid: null,
            getParameters: fn(() => {}),
            repr: { parameters: {} }
          })),
          autoView: fn()
        })
      ),
      getComponentsByName: fn(() => ({
        list: [1, 2, 3]
      })),
      removeComponent: fn(() => {})
    };

    await store.dispatch(deleteObject(targetLigand, stage, true));
    expect(await getAction(store, removeFromFragmentDisplayList)).not.toBeNull();
    store.clearActions();

    await store.dispatch(deleteObject(targetComplex, stage, true));
    expect(await getAction(store, removeFromComplexList)).not.toBeNull();
    store.clearActions();

    await store.dispatch(deleteObject(targetVector, stage, true));
    expect(await getAction(store, removeFromVectorOnList)).not.toBeNull();
    store.clearActions();

    await store.dispatch(deleteObject(targetLigand, stage, false));
    expect(await getAction(store, deleteNglObject)).not.toBeNull();
  });

  it('should decrement count of remaining molecule groups in case with more than one remaining molecule groups', async () => {
    expect.hasAssertions();
    let store = mockStore({
      nglReducers: {
        countOfRemainingMoleculeGroups: 2,
        proteinsHasLoaded: true
      }
    });

    const decrementedCount = store.getState().nglReducers.countOfRemainingMoleculeGroups - 1;
    store.dispatch(decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState());

    expect(await getAction(store, saveCurrentStateAsDefaultScene)).toBeNull();
    expect(await getAction(store, decrementCountOfRemainingMoleculeGroups)).toStrictEqual({
      type: CONSTANTS.DECREMENT_COUNT_OF_REMAINING_MOLECULE_GROUPS,
      payload: decrementedCount
    });
  });

  it('should decrement count of remaining molecule groups in case with last one remaining molecule groups', async () => {
    expect.hasAssertions();
    let store = mockStore({
      nglReducers: {
        countOfRemainingMoleculeGroups: 1,
        proteinsHasLoaded: true
      }
    });

    const decrementedCount = store.getState().nglReducers.countOfRemainingMoleculeGroups - 1;
    store.dispatch(decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState());
    expect(await getAction(store, saveCurrentStateAsDefaultScene)).not.toBeNull();
    expect(await getAction(store, decrementCountOfRemainingMoleculeGroups)).toStrictEqual({
      type: CONSTANTS.DECREMENT_COUNT_OF_REMAINING_MOLECULE_GROUPS,
      payload: decrementedCount
    });
  });

  it('should set proteins has loaded in case with no remaining molecule groups', async () => {
    expect.hasAssertions();
    let store = mockStore({
      nglReducers: {
        countOfRemainingMoleculeGroups: 0
      }
    });

    let hasLoaded = true;
    let withoutSavingToDefaultState = true;
    store.dispatch(setProteinsHasLoaded(hasLoaded, withoutSavingToDefaultState));

    expect(await getAction(store, saveCurrentStateAsDefaultScene)).toBeNull();
    expect(await getAction(store, setProteinLoadingState)).toStrictEqual({
      type: getActionType(setProteinLoadingState),
      payload: hasLoaded
    });
    store.clearActions();

    withoutSavingToDefaultState = false;
    store.dispatch(setProteinsHasLoaded(hasLoaded, withoutSavingToDefaultState));

    expect(await getAction(store, saveCurrentStateAsDefaultScene)).toStrictEqual({
      type: getActionType(saveCurrentStateAsDefaultScene)
    });
    expect(await getAction(store, setProteinLoadingState)).toStrictEqual({
      type: getActionType(setProteinLoadingState),
      payload: hasLoaded
    });
  });

  it('should set proteins has loaded in case with remaining molecule groups', async () => {
    expect.hasAssertions();
    let store = mockStore({
      nglReducers: {
        countOfRemainingMoleculeGroups: 1
      }
    });

    let hasLoaded = true;
    let withoutSavingToDefaultState = true;
    store.dispatch(setProteinsHasLoaded(hasLoaded, withoutSavingToDefaultState));

    expect(await getAction(store, saveCurrentStateAsDefaultScene)).toBeNull();
    expect(await getAction(store, setProteinLoadingState)).toStrictEqual({
      type: getActionType(setProteinLoadingState),
      payload: hasLoaded
    });
    store.clearActions();

    withoutSavingToDefaultState = false;
    store.dispatch(setProteinsHasLoaded(hasLoaded, withoutSavingToDefaultState));

    expect(await getAction(store, saveCurrentStateAsDefaultScene)).toBeNull();
    expect(await getAction(store, setProteinLoadingState)).toStrictEqual({
      type: getActionType(setProteinLoadingState),
      payload: hasLoaded
    });
  });

  it('should set orientation', async () => {
    expect.hasAssertions();
    const orientation = {
      elements: [1, 2, 3, 'df']
    };

    const div_id = 'MAJOR_VIEW';

    let store = mockStore({
      nglReducers: {
        nglOrientations: {
          first: { elements: [35, 'g'] },
          [div_id]: orientation,
          third: { elements: [235, 'g3'] }
        }
      }
    });

    await store.dispatch(setOrientation(div_id, orientation));
    expect(await store.getActions()).toHaveLength(0);

    let storeWithAnotherOrientationElem = mockStore({
      nglReducers: {
        nglOrientations: {
          first: { elements: [35, 'g'] },
          [div_id]: { elements: [3534, 'wfsweg'] },
          third: { elements: [235, 'g3'] }
        }
      }
    });

    await storeWithAnotherOrientationElem.dispatch(setOrientation(div_id, orientation));
    expect(await getAction(storeWithAnotherOrientationElem, setNglOrientation)).not.toBeNull();

    let storeWithoutOrientations = mockStore({
      nglReducers: {
        nglOrientations: undefined
      }
    });

    await storeWithoutOrientations.dispatch(setOrientation(div_id, orientation));
    expect(await getAction(storeWithoutOrientations, setNglOrientation)).not.toBeNull();

    let storeWithNotAllOrientations = mockStore({
      nglReducers: {
        nglOrientations: {
          first: { elements: [35, 'g'] },
          second: { elements: [235, 'g3'] }
        }
      }
    });
    await storeWithNotAllOrientations.dispatch(setOrientation(div_id, orientation));
    expect(await getAction(storeWithNotAllOrientations, setNglOrientation)).not.toBeNull();
  });

  it('should reload NGL View from session scene', async () => {
    expect.hasAssertions();
    let store = mockStore();

    const stage = {
      removeAllComponents: fn(),
      viewerControls: {
        orient: fn()
      }
    };

    const display_div = 'MajorView';
    const scene = SCENES.sessionScene;
    const sessionData = {
      nglReducers: {
        [scene]: {
          objectsInView: {},
          viewParams: { a: 'ssfs', b: 'dfd' },
          nglOrientations: {}
        }
      }
    };

    store.dispatch(reloadNglViewFromSnapshot(stage, display_div, scene, sessionData));

    expect(await getAction(store, setNglStateFromCurrentSnapshot)).toStrictEqual({
      type: getActionType(setNglStateFromCurrentSnapshot),
      payload: sessionData
    });
  });

  it('should reload NGL View from default scene', async () => {
    expect.hasAssertions();
    const scene = SCENES.defaultScene;
    let store = mockStore({
      nglReducers: {
        [scene]: {
          objectsInView: {},
          viewParams: { a: 'ssfs', b: 'dfd' },
          nglOrientations: {}
        }
      }
    });

    const stage = {
      removeAllComponents: fn(),
      viewerControls: {
        orient: fn()
      }
    };

    const display_div = 'MajorView';
    store.dispatch(reloadNglViewFromSnapshot(stage, display_div, scene));

    expect(await getAction(store, resetStateToDefaultScene)).not.toBeNull();
  });
});
