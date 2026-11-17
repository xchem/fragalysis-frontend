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
import { addLigand, removeLigand } from '../../components/preview/molecule/redux/dispatchActions';
import { setToBeDisplayedList } from '../selection/actions';
import { createSnapshotStateForSaving } from '../../components/snapshot/redux/utilitySnapshotShapes';
import { ViewerAdapter } from '../../viewer';
import { useDisplayLigandLHS } from './useDisplayLigandLHS';
import * as viewerConfig from '../../config/viewer';

jest.mock('../../components/nglView/nglProvider', () => ({ NglContext: require('react').createContext() }));
jest.mock('../../components/preview/molecule/poseList', () => ({ PoseList: jest.fn(() => null) }));

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
};

const createScene = (count = 4, concurrency = 4) => {
  jest.replaceProperty(viewerConfig, 'LHS_BULK_LIGAND_CONCURRENCY', concurrency);
  const observations = Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    code: `observation-${index + 1}`,
    ligand_mol: `/ligand/${index + 1}`,
    tags_set: []
  }));
  const coordinates = observations.map(deferred);
  const rendering = observations.map(deferred);
  const nativeObjects = new Map();
  const reducer = combineReducers({ apiReducers, nglReducers, selectionReducers, previewReducers });
  const initialState = reducer(undefined, {});
  const store = legacy_createStore(
    reducer,
    { ...initialState, apiReducers: { ...initialState.apiReducers, all_mol_lists: observations } },
    applyMiddleware(thunk)
  );
  jest
    .spyOn(global, 'fetch')
    .mockImplementation(path =>
      coordinates[Number(path.split('/').pop()) - 1].promise.then(() => ({ text: async () => 'ligand coordinates' }))
    );
  const stage = new ViewerAdapter();
  jest.spyOn(stage, 'loadObject').mockImplementation(async ({ target }) => {
    await rendering[target.moleculeId - 1].promise;
    const molecule = { name: target.name, buffers: [new Float32Array([1, 2, 3])] };
    const nativeRepresentation = { parentMolecule: molecule };
    molecule.representation = nativeRepresentation;
    nativeObjects.set(target.name, molecule);
    return [{ type: 'licorice', params: { visible: true }, nativeRepresentation, parentObject: molecule }];
  });
  jest.spyOn(stage, 'removeObjects').mockImplementation(async name => {
    const molecule = nativeObjects.get(name);
    if (molecule) molecule.buffers.length = 0;
    nativeObjects.delete(name);
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
  const hook = renderHook(() => useDisplayLigandLHS(), { wrapper });
  return { observations, coordinates, rendering, nativeObjects, stage, store, ...hook };
};

const startBulk = async (scene, observations = scene.observations, representations) => {
  await act(async () => {
    const { handlers } = PoseList.mock.calls[PoseList.mock.calls.length - 1][0];
    await handlers.addNewType('ligand', observations, scene.stage, true, representations);
  });
};

const resumeBulk = async () => {
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
};

describe('bounded bulk LHS ligand loading', () => {
  let originalFetch;

  // Each integration case needs isolated browser timers and global fetch/console spies.
  // eslint-disable-next-line jest/no-hooks
  beforeEach(() => {
    originalFetch = global.fetch;
    if (!global.fetch) global.fetch = () => {};
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'count').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // eslint-disable-next-line jest/no-hooks
  afterEach(() => {
    cleanup();
    jest.useRealTimers();
    jest.restoreAllMocks();
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  it.each([2, 4, 8])(
    'admits %i of 930 toolbar requests while saving every requested ligand with the existing snapshot shape',
    async concurrency => {
      expect.hasAssertions();
      const scene = createScene(930, concurrency);
      await startBulk(scene);

      expect(global.fetch.mock.calls.map(([path]) => path)).toStrictEqual(
        Array.from({ length: concurrency }, (_, index) => `/ligand/${index + 1}`)
      );
      expect(scene.stage.loadObject).not.toHaveBeenCalled();
      const snapshot = createSnapshotStateForSaving(scene.store.getState());
      expect(snapshot.selectionReducers.toBeDisplayedList).toHaveLength(930);
      expect(snapshot.selectionReducers.toBeDisplayedList[929]).toStrictEqual({
        type: 'LIGAND',
        id: 930,
        display: true,
        center: false,
        withQuality: true,
        rendered: false
      });
      expect(JSON.stringify(snapshot)).not.toContain('LHS_BULK_LIGAND_CONCURRENCY');
    }
  );

  it('refills freed slots after native completion and a browser task, including out-of-order loads under Strict Mode', async () => {
    expect.hasAssertions();
    const scene = createScene(5, 2);
    const representations = [{ type: 'licorice', params: { opacity: 0.6 } }];
    await startBulk(scene, scene.observations, representations);
    scene.rerender();
    await act(async () => {});
    expect(global.fetch).toHaveBeenCalledTimes(2);

    await act(async () => {
      scene.coordinates[0].resolve();
      scene.coordinates[1].resolve();
    });
    expect(scene.stage.loadObject).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenCalledTimes(2);

    // The second native load finishes first; refill its slot while the first
    // is still rendering, rather than waiting for a whole batch to finish.
    for (const index of [1, 2, 0, 3, 4]) {
      await act(async () => {
        scene.coordinates[index].resolve();
      });
      expect(scene.stage.loadObject).toHaveBeenLastCalledWith(
        expect.objectContaining({ representations, center: false, loadQuality: false })
      );
      const started = global.fetch.mock.calls.length;
      await act(async () => {
        scene.rendering[index].resolve();
      });
      expect(global.fetch).toHaveBeenCalledTimes(started);
      expect(scene.store.getState().selectionReducers.toBeDisplayedList[index].rendered).toBe(true);
      await resumeBulk();
      expect(global.fetch).toHaveBeenCalledTimes(Math.min(5, started + 1));
    }

    expect(scene.stage.loadObject).toHaveBeenCalledTimes(5);
    expect(scene.nativeObjects.size).toBe(5);
    expect(scene.store.getState().nglReducers.countOfPendingNglObjects.major_view).toBe(0);
    expect(JSON.stringify(scene.store.getState())).not.toContain('parentMolecule');
  });

  it('keeps individual and transfer ligand requests concurrent with a bulk load', async () => {
    expect.hasAssertions();
    const scene = createScene(6, 2);
    await startBulk(scene, scene.observations.slice(0, 4));
    await act(async () => {
      await scene.store.dispatch(addLigand(scene.stage, scene.observations[4]));
      await scene.store.dispatch(addLigand(scene.stage, scene.observations[5]));
    });

    expect(global.fetch.mock.calls.map(([path]) => path)).toStrictEqual([
      '/ligand/1',
      '/ligand/2',
      '/ligand/5',
      '/ligand/6'
    ]);
  });

  it('shares the pool across overlapping bulk requests without spending slots on duplicate intents', async () => {
    expect.hasAssertions();
    const scene = createScene(6, 2);
    await startBulk(scene, scene.observations.slice(0, 3));
    await startBulk(scene);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    await act(async () => {
      scene.coordinates[0].resolve();
      scene.rendering[0].resolve();
    });
    await resumeBulk();

    expect(global.fetch.mock.calls.map(([path]) => path)).toStrictEqual(['/ligand/1', '/ligand/2', '/ligand/3']);
    expect(scene.stage.loadObject).toHaveBeenCalledTimes(1);
  });

  it('refills several completed slots without exceeding the limit or admitting work after unmount', async () => {
    expect.hasAssertions();
    const scene = createScene(10);
    await startBulk(scene);
    await act(async () => {
      for (let index = 0; index < 4; index++) {
        scene.coordinates[index].resolve();
        scene.rendering[index].resolve();
      }
    });
    expect(global.fetch).toHaveBeenCalledTimes(4);
    await resumeBulk();
    expect(global.fetch).toHaveBeenCalledTimes(8);
    await act(async () => {
      scene.coordinates[4].resolve();
      scene.rendering[4].resolve();
      scene.coordinates[5].resolve();
      scene.rendering[5].resolve();
    });
    scene.unmount();
    await resumeBulk();

    expect(global.fetch).toHaveBeenCalledTimes(8);
  });

  it('cancels waiting bulk ligands without downloading them and still awaits active native disposal', async () => {
    expect.hasAssertions();
    const scene = createScene(4, 2);
    await startBulk(scene);
    const deletion = deferred();
    scene.stage.removeObjects.mockImplementation(async name => {
      await deletion.promise;
      const molecule = scene.nativeObjects.get(name);
      if (molecule) molecule.buffers.length = 0;
      scene.nativeObjects.delete(name);
    });
    await act(async () => {
      scene.store.dispatch(removeLigand(scene.stage, scene.observations[0]));
      scene.store.dispatch(removeLigand(scene.stage, scene.observations[2]));
    });
    expect(scene.stage.removeObjects).toHaveBeenCalledTimes(1);
    expect(scene.stage.removeObjects).toHaveBeenCalledWith('observation-3_LIGAND');
    await act(async () => {
      scene.coordinates[0].resolve();
      scene.rendering[0].resolve();
    });
    const nativeObject = scene.nativeObjects.get('observation-1_LIGAND');
    expect(nativeObject.buffers).toHaveLength(1);
    expect(scene.store.getState().selectionReducers.fragmentDisplayList).toContain(1);
    expect(scene.store.getState().nglReducers.objectsInView).toHaveProperty('observation-1_LIGAND');
    expect(scene.stage.removeObjects).toHaveBeenCalledTimes(2);
    await act(async () => {
      deletion.resolve();
    });
    expect(nativeObject.buffers).toStrictEqual([]);
    expect(scene.nativeObjects.size).toBe(0);
    expect(scene.store.getState().selectionReducers.fragmentDisplayList).toStrictEqual([]);
    expect(scene.store.getState().selectionReducers.toBeDisplayedList.map(item => item.id)).toStrictEqual([2, 4]);
    expect(scene.store.getState().nglReducers.objectsInView).toStrictEqual({});
    await resumeBulk();
    expect(global.fetch.mock.calls.map(([path]) => path)).toStrictEqual(['/ligand/1', '/ligand/2', '/ligand/4']);
  });

  it.each(['coordinates', 'rendering'])(
    'continues after a failed %s operation without a stuck intent or pending count',
    async phase => {
      expect.hasAssertions();
      const scene = createScene(3, 2);
      await startBulk(scene);
      if (phase === 'rendering') {
        await act(async () => {
          scene.coordinates[0].resolve();
        });
      }
      await act(async () => {
        scene[phase][0].reject(new Error(`failed ${phase}`));
      });
      expect(scene.store.getState().selectionReducers.toBeDisplayedList.map(item => item.id)).toStrictEqual([2, 3]);
      expect(scene.store.getState().selectionReducers.fragmentDisplayList).toStrictEqual([]);
      expect(scene.store.getState().nglReducers.countOfPendingNglObjects.major_view).toBe(0);
      await resumeBulk();
      expect(global.fetch).toHaveBeenLastCalledWith('/ligand/3');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    }
  );

  it('uses current snapshot intents instead of starting obsolete waiting bulk work', async () => {
    expect.hasAssertions();
    const scene = createScene(6, 2);
    await startBulk(scene, scene.observations.slice(0, 4));
    await act(async () => {
      scene.store.dispatch(
        setToBeDisplayedList([
          { id: 1, type: 'LIGAND', display: false },
          { id: 2, type: 'LIGAND', display: false },
          { id: 5, type: 'LIGAND', display: true, center: false },
          { id: 6, type: 'LIGAND', display: true, center: false }
        ])
      );
    });
    await act(async () => {
      scene.coordinates[0].resolve();
      scene.rendering[0].resolve();
      scene.coordinates[1].resolve();
      scene.rendering[1].resolve();
    });
    await resumeBulk();

    expect(global.fetch.mock.calls.map(([path]) => path)).toStrictEqual([
      '/ligand/1',
      '/ligand/2',
      '/ligand/5',
      '/ligand/6'
    ]);
    expect(scene.nativeObjects.size).toBe(0);
    expect(scene.store.getState().selectionReducers.toBeDisplayedList.map(item => item.id)).toStrictEqual([5, 6]);
  });

  it('restores cloned snapshot intents with normal concurrent loading', async () => {
    expect.hasAssertions();
    const scene = createScene(3, 2);
    await startBulk(scene);
    const snapshot = createSnapshotStateForSaving(scene.store.getState());
    await act(async () => {
      scene.store.dispatch(setToBeDisplayedList(snapshot.selectionReducers.toBeDisplayedList));
    });

    expect(global.fetch.mock.calls.map(([path]) => path)).toStrictEqual(['/ligand/1', '/ligand/2', '/ligand/3']);
  });

  it.each(['fetching', 'yielding'])(
    'does not admit more bulk work after the display hook unmounts during %s',
    async phase => {
      expect.hasAssertions();
      const scene = createScene(6);
      await startBulk(scene);
      if (phase === 'yielding') {
        await act(async () => {
          scene.coordinates[0].resolve();
          scene.rendering[0].resolve();
        });
      }
      scene.unmount();
      await act(async () => {
        scene.coordinates[0].resolve();
        scene.rendering[0].resolve();
      });
      await resumeBulk();

      expect(global.fetch).toHaveBeenCalledTimes(4);
    }
  );
});
