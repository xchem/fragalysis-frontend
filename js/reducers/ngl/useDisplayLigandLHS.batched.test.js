import React from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, legacy_createStore } from 'redux';
import { thunk } from 'redux-thunk';
import apiReducers from '../api/apiReducers';
import nglReducers from './nglReducers';
import { selectionReducers } from '../selection/selectionReducers';
import { previewReducers } from '../../components/preview/redux';
import { NglContext } from '../../components/nglView/nglProvider';
import { PoseListLHS } from '../../components/preview/molecule/poseListLHS';
import { PoseList } from '../../components/preview/molecule/poseList';
import { addLigand, addLigandsBulk, removeLigand } from '../../components/preview/molecule/redux/dispatchActions';
import { setMoleculeNglControlButtons } from '../../components/preview/molecule/redux/actions';
import { appendToBeDisplayedList, appendToBeDisplayedListBulk, setToBeDisplayedList } from '../selection/actions';
import { createSnapshotStateForSaving } from '../../components/snapshot/redux/utilitySnapshotShapes';
import { ViewerAdapter } from '../../viewer';
import { isBulkLigand } from './bulkLigands';
import { useDisplayLigandLHS } from './useDisplayLigandLHS';

jest.mock('../../components/nglView/nglProvider', () => ({ NglContext: require('react').createContext() }));
jest.mock('../../components/preview/molecule/poseList', () => ({ PoseList: jest.fn(() => null) }));

const deferred = () => {
  let resolve;
  const promise = new Promise(accept => {
    resolve = accept;
  });
  return { promise, resolve };
};

const createScene = (count = 3, display = false) => {
  const observations = Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    code: `observation-${index + 1}`,
    ligand_mol: `/ligand/${index + 1}`,
    tags_set: []
  }));
  const actions = [];
  const reducer = combineReducers({ apiReducers, nglReducers, selectionReducers, previewReducers });
  const initial = reducer(undefined, {});
  const store = legacy_createStore(
    reducer,
    {
      ...initial,
      apiReducers: { ...initial.apiReducers, all_mol_lists: observations }
    },
    applyMiddleware(thunk, () => next => action => {
      actions.push(action);
      return next(action);
    })
  );
  const coordinates = observations.map(deferred);
  const rendering = observations.map(deferred);
  const native = new Map();
  const stage = new ViewerAdapter();
  jest.spyOn(stage, 'loadObject').mockImplementation(async ({ target }) => {
    await rendering[target.moleculeId - 1].promise;
    const molecule = { buffers: [new Float32Array([1, 2, 3])] };
    const representation = { parentObject: molecule };
    molecule.representation = representation;
    native.set(target.name, molecule);
    return [{ type: 'licorice', params: { visible: true }, nativeRepresentation: representation }];
  });
  jest.spyOn(stage, 'removeObjects').mockImplementation(async name => {
    native.get(name)?.buffers.splice(0);
    native.delete(name);
  });
  const context = { getNglView: () => ({ stage }), getViewerAdapter: () => stage };
  const wrapper = ({ children }) => (
    <React.StrictMode>
      <Provider store={store}>
        <NglContext.Provider value={context}>
          <PoseListLHS />
          {children}
        </NglContext.Provider>
      </Provider>
    </React.StrictMode>
  );
  const hook = renderHook(display ? useDisplayLigandLHS : () => {}, { wrapper });
  return { observations, actions, store, stage, coordinates, rendering, native, ...hook };
};

const toolbar = () => PoseList.mock.calls[PoseList.mock.calls.length - 1][0].handlers;

describe('batched LHS ligand requests', () => {
  let originalFetch;

  // eslint-disable-next-line jest/no-hooks
  beforeEach(() => {
    originalFetch = global.fetch;
    if (!global.fetch) global.fetch = () => {};
    jest.spyOn(global, 'fetch');
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'count').mockImplementation(() => {});
  });

  // eslint-disable-next-line jest/no-hooks
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  it('publishes all 930 toolbar intents and button states in three updates with unchanged snapshot shapes', async () => {
    expect.hasAssertions();
    const scene = createScene(930);
    const changes = jest.fn();
    scene.store.subscribe(changes);
    await act(async () => {
      await toolbar().addNewType('ligand', scene.observations, scene.stage);
    });
    expect(changes).toHaveBeenCalledTimes(3);
    expect(scene.actions.map(action => action.type)).toStrictEqual([
      setMoleculeNglControlButtons([], 'ligand', true).type,
      appendToBeDisplayedListBulk([]).type,
      setMoleculeNglControlButtons([], 'ligand', false).type
    ]);
    const state = scene.store.getState();
    expect(state.selectionReducers.toBeDisplayedList).toHaveLength(930);
    expect(state.selectionReducers.toBeDisplayedList.every(isBulkLigand)).toBe(true);
    expect(state.previewReducers.molecule.disableNglControlButtons[930]).toStrictEqual({ ligand: false });
    const snapshot = createSnapshotStateForSaving(state);
    expect(snapshot.selectionReducers.toBeDisplayedList[929]).toStrictEqual({
      id: 930,
      type: 'LIGAND',
      display: true,
      center: false,
      withQuality: true,
      rendered: false
    });
    expect(snapshot.selectionReducers.toBeDisplayedList.some(isBulkLigand)).toBe(false);
    expect(JSON.stringify(snapshot)).not.toMatch(/bulkLoading|LHS_BULK_LIGAND_CONCURRENCY/);
  });

  it('retains existing tombstones, object identities, duplicate intents and independent button settings', async () => {
    expect.hasAssertions();
    const scene = createScene(2);
    const tombstone = { id: 8, type: 'PROTEIN', display: false };
    const shared = { id: 1, type: 'LIGAND', display: true, center: false };
    await act(async () => {
      scene.store.dispatch(setToBeDisplayedList([tombstone, shared]));
      scene.store.dispatch(setMoleculeNglControlButtons([1], 'protein', true));
      await toolbar().addNewType('ligand', scene.observations, scene.stage);
    });
    const state = scene.store.getState();
    expect(state.selectionReducers.toBeDisplayedList).toHaveLength(4);
    expect(state.selectionReducers.toBeDisplayedList[0]).toBe(tombstone);
    expect(state.selectionReducers.toBeDisplayedList[1]).toBe(shared);
    expect(state.previewReducers.molecule.disableNglControlButtons[1]).toStrictEqual({ protein: true, ligand: false });
  });

  it('keeps individual toolbar requests on the existing action path', async () => {
    expect.hasAssertions();
    const scene = createScene(1);
    await act(async () => {
      await toolbar().addNewType('ligand', scene.observations, scene.stage);
    });
    expect(scene.actions).toHaveLength(3);
    expect(scene.actions[1].type).toBe(appendToBeDisplayedList({}).type);
    expect(isBulkLigand(scene.store.getState().selectionReducers.toBeDisplayedList[0])).toBe(false);
  });

  it('enables all requested buttons if bulk publication fails', async () => {
    expect.hasAssertions();
    const dispatch = jest
      .fn()
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw new Error('publication failed');
      });
    await expect(addLigandsBulk([{ id: 1 }, { id: 2 }])(dispatch)).rejects.toThrow('publication failed');
    expect(dispatch.mock.calls[2][0]).toStrictEqual(setMoleculeNglControlButtons([1, 2], 'ligand', false));
  });

  it('preserves individual loading alongside live bulk requests', async () => {
    expect.hasAssertions();
    const scene = createScene(3, true);
    global.fetch.mockImplementation(path =>
      scene.coordinates[Number(path.split('/').pop()) - 1].promise.then(() => ({ text: async () => 'coordinates' }))
    );
    await act(async () => {
      await toolbar().addNewType('ligand', scene.observations.slice(0, 2), scene.stage);
      scene.store.dispatch(addLigand(scene.stage, scene.observations[2]));
    });
    expect(global.fetch).toHaveBeenCalledTimes(3);
    scene.rerender();
    await act(async () => {
      scene.coordinates.forEach(item => item.resolve());
    });
    expect(scene.stage.loadObject).toHaveBeenCalledTimes(3);
    expect(scene.stage.loadObject.mock.calls.map(([options]) => options.target.moleculeId)).toStrictEqual([1, 2, 3]);
    expect(scene.store.getState().selectionReducers.toBeDisplayedList.some(item => item.rendered)).toBe(false);
    await act(async () => {
      scene.rendering.forEach(item => item.resolve());
    });
    expect(scene.store.getState().selectionReducers.toBeDisplayedList.every(item => item.rendered)).toBe(true);
    expect(scene.store.getState().nglReducers.countOfPendingNglObjects.major_view).toBe(0);
    expect(JSON.stringify(scene.store.getState().nglReducers.objectsInView)).not.toMatch(
      /nativeRepresentation|buffers/
    );
  });

  it('keeps cloned snapshot intents on the ordinary rendering path with saved appearance', async () => {
    expect.hasAssertions();
    const scene = createScene(2, true);
    global.fetch.mockResolvedValue({ text: async () => 'coordinates' });
    const representations = [{ type: 'line', params: { opacity: 0.4 } }];
    let snapshot;
    await act(async () => {
      await toolbar().addNewType('ligand', scene.observations, scene.stage, false, representations);
      snapshot = createSnapshotStateForSaving(scene.store.getState());
    });
    await act(async () => {
      scene.rendering.forEach(item => item.resolve());
    });
    await act(async () => {
      scene.observations.forEach(item => scene.store.dispatch(removeLigand(scene.stage, item)));
    });
    expect(scene.native.size).toBe(0);
    scene.stage.loadObject.mockClear();
    await act(async () => {
      scene.store.dispatch(setToBeDisplayedList(snapshot.selectionReducers.toBeDisplayedList));
    });
    expect(scene.stage.loadObject).toHaveBeenCalledTimes(2);
    expect(scene.stage.loadObject.mock.calls[0][0].representations).toStrictEqual(representations);
  });

  it('orders removal after native readiness and acknowledges only after real buffer disposal', async () => {
    expect.hasAssertions();
    const scene = createScene(2, true);
    global.fetch.mockResolvedValue({ text: async () => 'coordinates' });
    await act(async () => {
      await toolbar().addNewType('ligand', scene.observations, scene.stage);
    });
    const disposal = deferred();
    scene.stage.removeObjects.mockImplementation(async name => {
      await disposal.promise;
      scene.native.get(name)?.buffers.splice(0);
      scene.native.delete(name);
    });
    await act(async () => {
      scene.store.dispatch(removeLigand(scene.stage, scene.observations[0]));
    });
    expect(scene.stage.removeObjects).not.toHaveBeenCalled();
    await act(async () => {
      scene.rendering[0].resolve();
    });
    const molecule = scene.native.get('observation-1_LIGAND');
    expect(molecule.buffers).toHaveLength(1);
    expect(scene.store.getState().selectionReducers.fragmentDisplayList).toContain(1);
    await act(async () => {
      disposal.resolve();
    });
    expect(molecule.buffers).toStrictEqual([]);
    expect(scene.native.has('observation-1_LIGAND')).toBe(false);
    expect(scene.store.getState().selectionReducers.fragmentDisplayList).not.toContain(1);
    expect(scene.store.getState().nglReducers.objectsInView).not.toHaveProperty('observation-1_LIGAND');
  });
});
