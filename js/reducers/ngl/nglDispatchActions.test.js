import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState } from './nglDispatchActions';
import { CONSTANTS } from './nglConstants';
import { getAction } from '../../utils/testUtils';
import { decrementCountOfRemainingMoleculeGroups, saveCurrentStateAsDefaultScene } from './nglActions';

describe("testing ngl reducer's async actions", () => {
  const middlewares = [thunk]; // add your middlewares like `redux-thunk`
  const mockStore = configureStore(middlewares);

  it('should decrement count of remaining molecule groups', async () => {
    expect.hasAssertions();
    let store1 = mockStore({
      nglReducers: {
        present: {
          countOfRemainingMoleculeGroups: 2,
          proteinsHasLoad: true
        }
      }
    });

    const decrementedCount1 = store1.getState().nglReducers.present.countOfRemainingMoleculeGroups - 1;

    store1.dispatch(decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState());

    expect(await getAction(store1, saveCurrentStateAsDefaultScene())).toBeNull();
    expect(await getAction(store1, decrementCountOfRemainingMoleculeGroups())).toStrictEqual({
      type: CONSTANTS.DECREMENT_COUNT_OF_REMAINING_MOLECULE_GROUPS,
      payload: decrementedCount1
    });

    let store2 = mockStore({
      nglReducers: {
        present: {
          countOfRemainingMoleculeGroups: 1,
          proteinsHasLoad: true
        }
      }
    });

    const decrementedCount2 = store2.getState().nglReducers.present.countOfRemainingMoleculeGroups - 1;
    store2.dispatch(decrementCountOfRemainingMoleculeGroupsWithSavingDefaultState());
    expect(await getAction(store2, saveCurrentStateAsDefaultScene())).not.toBeNull();
    expect(await getAction(store2, decrementCountOfRemainingMoleculeGroups())).toStrictEqual({
      type: CONSTANTS.DECREMENT_COUNT_OF_REMAINING_MOLECULE_GROUPS,
      payload: decrementedCount2
    });
  });
});
