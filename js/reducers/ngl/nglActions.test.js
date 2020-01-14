import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nglReducers, { INITIAL_STATE } from './nglReducers';
import {
  incrementCountOfPendingNglObjects,
  decrementCountOfPendingNglObjects,
  decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState,
  decrementCountOfRemainingMoleculeGroups
} from './nglActions';
import { SCENES } from './nglConstants';
import undoable from 'redux-undo';

describe("testing ngl reducer's actions", () => {
  let initialState = nglReducers(INITIAL_STATE, {});

  it('should increment count of pending ngl objects', () => {
    expect.hasAssertions();
    let result = nglReducers(initialState, incrementCountOfPendingNglObjects());
    expect(result.countOfPendingNglObjects).toBe(1);
    result = nglReducers(result, decrementCountOfPendingNglObjects());
    expect(result.countOfPendingNglObjects).toBe(0);
  });

  /*
describe("testing ngl reducer's async actions", () => {
  expect.hasAssertions();
  const middlewares = [thunk]; // add your middlewares like `redux-thunk`
  const mockStore = configureStore(middlewares);
  it('should decrement count of remaining molecule groups', () => {
    const store = mockStore({ nglReducers: undoable({ countOfRemainingMoleculeGroups: 2 }, { limit: 1 }) });
    const { dispatch, getActions, getState } = store;
    console.log(store, getState().nglReducers.present);

    const sceneId = SCENES.defaultScene;
    const testStateObject = { objectsInView: { a: 'firts object' } };

    dispatch(decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState()).then(() => {
      //   const actions = getActions();
      //expect(actions[0]).toEqual(decrementCountOfRemainingMoleculeGroups());
    });

    let result = nglReducers(
      Object.assign({}, initialState, { countOfRemainingMoleculeGroups: 2, ...testStateObject, proteinsHasLoad: true }),
      decrementCountOfRemainingMoleculeGroups()
    );

    expect(result.countOfRemainingMoleculeGroups).toBe(1);
    expect(result[sceneId]).toStrictEqual({});
    result = nglReducers(result, decrementCountOfRemainingMoleculeGroups());
    expect(result.countOfRemainingMoleculeGroups).toBe(0);
    console.log(result);
  });*/
});
