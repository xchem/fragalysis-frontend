import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { changeSnapshot } from './dispatchActions';
import { api } from '../../../utils/api';
import ViewerAdapter from '../../../viewer/ViewerAdapter';
import { VIEWS } from '../../../constants/constants';
import { NGL_OBJECTS } from '../../../reducers/ngl/constants';
import { reloadSelectionReducer } from '../../../reducers/selection/actions';
import { setNglStateFromCurrentSnapshot } from '../../../reducers/ngl/actions';
import nglReducer from '../../../reducers/ngl/nglReducers';
import { getPdb } from '../../nglView/renderingFile';
import { setSnapshotLoadingInProgress } from '../../../reducers/api/actions';
import { setDatasetsStateFromSnapshot } from '../../datasets/redux/actions';
import { setCurrentSnapshot } from '../../projects/redux/actions';
import { setSwitchingSnapshotWithinProject } from './actions';
import { setEntireState } from '../../../reducers/actions';

jest.mock('../../../utils/api', () => ({ api: jest.fn(), METHOD: { GET: 'get', POST: 'post' } }));

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};
const item = id => ({ id, type: NGL_OBJECTS.LIGAND, display: true, center: false, rendered: true });
const orientation = { elements: [0, 0, 0, -1, 10, 20, 30, 0.5] };
const baseState = () => ({
  apiReducers: { all_mol_lists: [{ id: 1 }], snapshotLoadingInProgress: false },
  snapshotReducers: { switchingSnapshotWithinProject: false },
  projectReducers: { currentSnapshot: { id: 1 } },
  selectionReducers: { fragmentDisplayList: [{ id: 1 }, { id: 2 }], toBeDisplayedList: [item(1), item(2)] },
  datasetsReducers: { ligandLists: { 9: [{ id: 91 }] }, toBeDisplayedList: { 9: [{ ...item(91), datasetID: 9 }] } },
  nglReducers: {
    objectsInView: { shared: { id: 1 } },
    objectsInViewStash: {},
    pdbCache: { cached: 'PDB' },
    countOfPendingNglObjects: { [VIEWS.MAJOR_VIEW]: 1 },
    nglOrientations: { [VIEWS.MAJOR_VIEW]: orientation }
  }
});
const destinationState = () => ({
  selectionReducers: { toBeDisplayedList: [item(1), item(3)] },
  datasetsReducers: { toBeDisplayedList: { 9: [] } },
  nglReducers: { nglOrientations: { [VIEWS.MAJOR_VIEW]: orientation } }
});
const responseFor = (id, state = destinationState()) => ({
  data: { id, title: `Snapshot ${id}`, additional_info: { snapshotState: state } }
});
const actionsOf = (store, creator) => store.getActions().filter(action => action.type === creator({}).type);
const flush = async () => {
  for (let i = 0; i < 8; i++) await Promise.resolve();
};

describe('in-place snapshot switching', () => {
  let frames;
  let viewer;
  let animation;
  const mockStore = configureStore([thunk]);
  const frame = async () => {
    const pending = frames.splice(0);
    pending.forEach(callback => callback());
    await flush();
  };

  // Isolate RAF scheduling and restore globals after each test.
  // eslint-disable-next-line jest/no-hooks
  beforeEach(() => {
    frames = [];
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation(callback => {
      frames.push(callback);
      return frames.length;
    });
    api.mockImplementation(({ url }) =>
      Promise.resolve(
        url.includes('/snapshot_state/')
          ? { data: { state: destinationState() } }
          : responseFor(Number(url.split('/').pop()))
      )
    );
    animation = deferred();
    viewer = new ViewerAdapter();
    jest.spyOn(viewer, 'animateOrientation').mockImplementation((value, duration, { signal }) => {
      signal.addEventListener('abort', () => animation.resolve({ status: 'cancelled' }), { once: true });
      return animation.promise;
    });
    jest.spyOn(viewer, 'getOrientation').mockReturnValue(orientation);
    jest.spyOn(viewer, 'setOrientation').mockImplementation(() => {});
  });

  // Restore the globals installed for each test.
  // eslint-disable-next-line jest/no-hooks
  afterEach(() => {
    jest.restoreAllMocks();
    api.mockReset();
  });

  it('keeps the live scene until motion finishes, then applies incremental additions/removals and fresh acknowledgements', async () => {
    expect.hasAssertions();
    let state = baseState();
    const original = JSON.stringify(state);
    const store = mockStore(() => state);
    const pending = store.dispatch(changeSnapshot(7, 2, viewer));
    await flush();
    expect(viewer.animateOrientation).toHaveBeenCalledWith(
      orientation.elements,
      400,
      expect.objectContaining({ signal: expect.anything() })
    );
    expect(actionsOf(store, reloadSelectionReducer)).toHaveLength(0);
    expect(JSON.stringify(state)).toBe(original);

    // A prior coordinate load completes while the camera moves.
    const pdb = new Blob(['ATOM'], { type: 'text/plain' });
    state = {
      ...state,
      selectionReducers: { ...state.selectionReducers, fragmentDisplayList: [{ id: 1 }, { id: 2 }, { id: 3 }] },
      nglReducers: {
        ...state.nglReducers,
        pdbCache: { ...state.nglReducers.pdbCache, 'cached.pdb': pdb },
        objectsInView: { shared: { id: 1 }, justLoaded: { id: 3 } },
        countOfPendingNglObjects: { [VIEWS.MAJOR_VIEW]: 0 }
      }
    };
    animation.resolve({ status: 'completed' });
    await flush();
    expect(actionsOf(store, reloadSelectionReducer)).toHaveLength(0);
    await frame();
    await pending;
    const selection = actionsOf(store, reloadSelectionReducer)[0].payload;
    expect(selection.toBeDisplayedList).toStrictEqual([item(1), item(3), { ...item(2), display: false }]);
    expect(selection.fragmentDisplayList).toStrictEqual(state.selectionReducers.fragmentDisplayList);
    expect(actionsOf(store, setDatasetsStateFromSnapshot)[0].payload.toBeDisplayedList[9]).toStrictEqual([
      { ...item(91), datasetID: 9, display: false }
    ]);
    const ngl = actionsOf(store, setNglStateFromCurrentSnapshot)[0].payload;
    expect(ngl).toMatchObject({
      objectsInView: state.nglReducers.objectsInView,
      pdbCache: { cached: 'PDB' },
      snapshotOrientationApplied: true,
      isSnapshotRendering: false,
      objectsInSnapshotToBeRendered: 0
    });
    // Exercise the real reducer, including a binary file downloaded while
    // the camera was moving. The snapshot clone cannot supply this Blob.
    const restored = nglReducer(state.nglReducers, setNglStateFromCurrentSnapshot(ngl));
    expect(restored.pdbCache).toBe(state.nglReducers.pdbCache);
    expect(await getPdb('/media/cached.pdb')(jest.fn(), () => ({ nglReducers: restored }))).toBe(pdb);
    expect(actionsOf(store, setEntireState)).toHaveLength(0);
    await frame();
    expect(store.getActions()).toContainEqual(setSwitchingSnapshotWithinProject(false));
    expect(store.getActions()).toContainEqual(setSnapshotLoadingInProgress(false));
  });

  it('ignores late fetch responses after a newer snapshot selection', async () => {
    expect.hasAssertions();
    const firstFetch = deferred();
    api.mockImplementationOnce(() => firstFetch.promise);
    const store = mockStore(baseState());
    const first = store.dispatch(changeSnapshot(7, 2, viewer));
    const latest = store.dispatch(changeSnapshot(7, 3, viewer));
    await flush();
    firstFetch.resolve(responseFor(2));
    expect(await first).toBe(false);
    expect(viewer.animateOrientation).toHaveBeenCalledTimes(1);
    expect(store.getActions()).not.toContainEqual(setSnapshotLoadingInProgress(false));
    animation.resolve({ status: 'completed' });
    await flush();
    await frame();
    await latest;
    expect(actionsOf(store, setCurrentSnapshot).map(action => action.payload.currentSnapshot.id)).toStrictEqual([3]);
    expect(window.location.pathname).toBe('/viewer/react/projects/7/3');
    await frame();
  });

  it('aborts the moving camera as soon as a newer request starts, before its fetch completes', async () => {
    expect.hasAssertions();
    const store = mockStore(baseState());
    const first = store.dispatch(changeSnapshot(7, 2, viewer));
    await flush();
    const nextFetch = deferred();
    api.mockImplementationOnce(() => nextFetch.promise);
    const next = store.dispatch(changeSnapshot(7, 3, viewer));
    expect(await first).toBe(false);
    expect(viewer.animateOrientation.mock.calls[0][2].signal.aborted).toBe(true);
    expect(actionsOf(store, reloadSelectionReducer)).toHaveLength(0);
    nextFetch.reject(new Error('Fetch failed'));
    await expect(next).rejects.toThrow('Fetch failed');
    expect(store.getActions()).toContainEqual(setSwitchingSnapshotWithinProject(false));
  });

  it('keeps the manually interrupted camera while applying destination structures', async () => {
    expect.hasAssertions();
    const store = mockStore(baseState());
    const actual = { elements: [0, 0, 0, -1, 5, 10, 15, 0.5] };
    viewer.getOrientation.mockReturnValue(actual);
    const pending = store.dispatch(changeSnapshot(7, 2, viewer));
    await flush();
    animation.resolve({ status: 'interrupted' });
    await flush();
    await frame();
    await pending;
    expect(actionsOf(store, setNglStateFromCurrentSnapshot)[0].payload).toMatchObject({
      snapshotOrientationApplied: true,
      reapplyOrientation: false,
      nglOrientations: { [VIEWS.MAJOR_VIEW]: actual }
    });
    expect(viewer.setOrientation).not.toHaveBeenCalled();
    await frame();
  });

  it('clears loading state on animation failure without applying destination state', async () => {
    expect.hasAssertions();
    const store = mockStore(baseState());
    const pending = store.dispatch(changeSnapshot(7, 2, viewer));
    await flush();
    animation.reject(new Error('Draw failed'));
    await expect(pending).rejects.toThrow('Draw failed');
    expect(actionsOf(store, reloadSelectionReducer)).toHaveLength(0);
    expect(store.getActions()).toContainEqual(setSnapshotLoadingInProgress(false));
    expect(store.getActions()).toContainEqual(setSwitchingSnapshotWithinProject(false));
  });

  it("does not allow a previous completion frame to clear a newer request's flags", async () => {
    expect.hasAssertions();
    const store = mockStore(baseState());
    viewer.animateOrientation.mockResolvedValue({ status: 'completed' });
    const first = store.dispatch(changeSnapshot(7, 2, viewer));
    await flush();
    await frame();
    await first;
    const fetch = deferred();
    api.mockImplementationOnce(() => fetch.promise);
    const next = store.dispatch(changeSnapshot(7, 3, viewer));
    await frame();
    expect(store.getActions()).not.toContainEqual(setSnapshotLoadingInProgress(false));
    fetch.reject(new Error('Fetch failed'));
    await expect(next).rejects.toThrow('Fetch failed');
  });

  it('retains legacy snapshot-state fallback and the initial/job full-state hydration path', async () => {
    expect.hasAssertions();
    api.mockResolvedValueOnce(responseFor(2)).mockResolvedValueOnce({ data: { state: null } });
    const store = mockStore(baseState());
    await store.dispatch(changeSnapshot(7, 2, viewer, true, true));
    expect(viewer.animateOrientation).not.toHaveBeenCalled();
    expect(actionsOf(store, setEntireState)).toHaveLength(1);
    expect(actionsOf(store, reloadSelectionReducer)).toHaveLength(0);
    expect(actionsOf(store, setEntireState)[0].newState.nglReducers.snapshotOrientationApplied).toBe(false);
    expect(store.getActions()).toContainEqual(setSnapshotLoadingInProgress(false));
  });
});
