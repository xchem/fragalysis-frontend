import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState,
  loadObject,
  setProteinsHasLoaded
} from './nglDispatchActions';
import { CONSTANTS } from './nglConstants';
import { getAction, getActionType } from '../../utils/testUtils';
import {
  decrementCountOfPendingNglObjects,
  decrementCountOfRemainingMoleculeGroups,
  incrementCountOfPendingNglObjects,
  loadNglObject,
  saveCurrentStateAsDefaultScene,
  setProteinLoadingState
} from './nglActions';
import { OBJECT_TYPE } from '../../components/nglView/constants';
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
      .then(result => {
        expect(result.type).toBe(getActionType(loadNglObject));
        expect(result.target).toStrictEqual(target);
        expect(result.representations.length).toBeGreaterThan(0);
      })
      .finally(() => {
        expect(getAction(store, incrementCountOfPendingNglObjects)).not.toBeNull();
        expect(getAction(store, decrementCountOfPendingNglObjects)).not.toBeNull();
      });
  });

  // deleteObject

  it('should decrement count of remaining molecule groups in case with more than one remaining molecule groups', async () => {
    expect.hasAssertions();
    let store = mockStore({
      nglReducers: {
        present: {
          countOfRemainingMoleculeGroups: 2,
          proteinsHasLoad: true
        }
      }
    });

    const decrementedCount = store.getState().nglReducers.present.countOfRemainingMoleculeGroups - 1;
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
        present: {
          countOfRemainingMoleculeGroups: 1,
          proteinsHasLoad: true
        }
      }
    });

    const decrementedCount = store.getState().nglReducers.present.countOfRemainingMoleculeGroups - 1;
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
        present: {
          countOfRemainingMoleculeGroups: 0
        }
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
        present: {
          countOfRemainingMoleculeGroups: 1
        }
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

    withoutSavingToDefaultState = false;
    store.dispatch(setProteinsHasLoaded(hasLoaded, withoutSavingToDefaultState));

    expect(await getAction(store, saveCurrentStateAsDefaultScene)).toBeNull();
    expect(await getAction(store, setProteinLoadingState)).toStrictEqual({
      type: getActionType(setProteinLoadingState),
      payload: hasLoaded
    });
  });

  // setOrientation

  // reloadNglViewFromScene
});
