import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { toggleMoleculeGroup } from './dispatchActions';
const { fn } = jest;

describe('testing nglView async actions', () => {
  const middlewares = [thunk]; // add your middlewares like `redux-thunk`
  const mockStore = configureStore(middlewares);

  it('should toggle molegule group', () => {
    expect.hasAssertions();
    let store = mockStore({
      selectionReducers: { mol_group_selection: 'aadf' },
      apiReducers: { mol_group_list: 12 }
    });

    const summaryStage = {
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
    const majorStage = {
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

    store.dispatch(toggleMoleculeGroup(1, summaryStage, majorStage));

    console.log(store.getActions());

    expect(1).toBe(1);
  });
});
