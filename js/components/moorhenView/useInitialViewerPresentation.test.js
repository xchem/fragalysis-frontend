import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { NglContext } from '../nglView/nglProvider';
import { isInitialSceneLoaded, useInitialViewerPresentation } from './useInitialViewerPresentation';

jest.mock('../nglView/nglProvider', () => ({ NglContext: require('react').createContext() }));

const viewId = 'major_view';
const loadedState = () => ({
  apiReducers: { lhsDataIsLoaded: true, all_mol_lists: [{ id: 1 }] },
  selectionReducers: {
    areLSHCompoundsInitialized: true,
    toBeDisplayedList: [{ id: 1, type: 'LIGAND', display: true, rendered: true }]
  },
  datasetsReducers: { toBeDisplayedList: {} },
  nglReducers: { countOfPendingNglObjects: { [viewId]: 0 } }
});

describe('initial viewer presentation', () => {
  it('waits for initial selection, coordinate fetching, rendering and native load acknowledgement', () => {
    expect.hasAssertions();
    const state = loadedState();
    state.apiReducers.lhsDataIsLoaded = false;
    expect(isInitialSceneLoaded(state, viewId)).toBe(false);
    state.apiReducers.lhsDataIsLoaded = true;
    state.selectionReducers.areLSHCompoundsInitialized = false;
    state.selectionReducers.toBeDisplayedList = [];
    expect(isInitialSceneLoaded(state, viewId)).toBe(false);
    state.selectionReducers.areLSHCompoundsInitialized = true;
    state.selectionReducers.toBeDisplayedList = [{ id: 1, type: 'LIGAND', display: true }];
    expect(isInitialSceneLoaded(state, viewId)).toBe(false);
    state.selectionReducers.toBeDisplayedList[0].rendered = true;
    state.nglReducers.countOfPendingNglObjects[viewId] = 1;
    expect(isInitialSceneLoaded(state, viewId)).toBe(false);
    state.nglReducers.countOfPendingNglObjects[viewId] = 0;
    expect(isInitialSceneLoaded(state, viewId)).toBe(true);
  });

  it('waits for RHS structures, density maps and the saved camera on initial snapshot load', () => {
    expect.hasAssertions();
    const state = loadedState();
    state.apiReducers.isSnapshot = true;
    state.nglReducers.snapshotNglOrientation = { [viewId]: { elements: [0, 0, 0, -1, -10, 0, 0, 0.5] } };
    state.nglReducers.snapshotOrientationApplied = false;
    expect(isInitialSceneLoaded(state, viewId)).toBe(false);
    state.nglReducers.snapshotOrientationApplied = true;
    state.datasetsReducers.toBeDisplayedList.designs = [{ id: 2, type: 'PROTEIN', display: true, rendered: false }];
    expect(isInitialSceneLoaded(state, viewId)).toBe(false);
    state.datasetsReducers.toBeDisplayedList.designs[0].rendered = true;
    state.selectionReducers.toBeDisplayedList.push({ id: 1, type: 'DENSITY', display: true, rendered: false });
    expect(isInitialSceneLoaded(state, viewId)).toBe(false);
    state.selectionReducers.toBeDisplayedList[1].rendered = true;
    expect(isInitialSceneLoaded(state, viewId)).toBe(true);
  });

  it('allows empty targets, snapshots without a saved camera, and queues cleared after failed loads', () => {
    expect.hasAssertions();
    const state = loadedState();
    state.apiReducers.all_mol_lists = [];
    state.selectionReducers.areLSHCompoundsInitialized = false;
    state.selectionReducers.toBeDisplayedList = [];
    expect(isInitialSceneLoaded(state, viewId)).toBe(true);
    state.apiReducers.isSnapshot = true;
    expect(isInitialSceneLoaded(state, viewId)).toBe(true);
    state.selectionReducers.toBeDisplayedList = [{ id: 1, display: false }];
    expect(isInitialSceneLoaded(state, viewId)).toBe(true);
  });

  it('reveals once after the camera settles and keeps the scene visible during subsequent snapshot switches', async () => {
    expect.hasAssertions();
    const frames = new Map();
    let nextFrame = 0;
    const request = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      const id = ++nextFrame;
      frames.set(id, callback);
      return id;
    });
    const cancel = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => frames.delete(id));
    const flushFrame = async () =>
      act(async () => {
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach(callback => callback());
      });
    let state = loadedState();
    state.selectionReducers.toBeDisplayedList[0].rendered = false;
    const store = legacy_createStore((current = state, action) => action.state || current);
    const adapter = { prepareInitialView: jest.fn(() => false) };
    const context = { getViewerAdapter: () => adapter };
    const wrapper = ({ children }) => (
      <React.StrictMode>
        <Provider store={store}>
          <NglContext.Provider value={context}>{children}</NglContext.Provider>
        </Provider>
      </React.StrictMode>
    );
    let hook;
    try {
      hook = renderHook(() => useInitialViewerPresentation(viewId, true), { wrapper });
      expect(hook.result.current).toBe(false);
      expect(frames.size).toBe(0);
      state = loadedState();
      await act(async () => store.dispatch({ type: 'LOAD_COMPLETE', state }));
      await flushFrame();
      expect(hook.result.current).toBe(false);
      adapter.prepareInitialView.mockReturnValue(true);
      await flushFrame();
      expect(hook.result.current).toBe(false);
      // Another camera update between frames restarts the settle check.
      adapter.prepareInitialView.mockReturnValue(false);
      await flushFrame();
      adapter.prepareInitialView.mockReturnValue(true);
      await flushFrame();
      expect(hook.result.current).toBe(false);
      await flushFrame();
      expect(hook.result.current).toBe(true);
      expect(frames.size).toBe(0);
      const preparations = adapter.prepareInitialView.mock.calls.length;
      state = loadedState();
      state.apiReducers.snapshotLoadingInProgress = true;
      state.selectionReducers.toBeDisplayedList[0].rendered = false;
      await act(async () => store.dispatch({ type: 'SWITCH_SNAPSHOT', state }));
      hook.rerender();
      expect(hook.result.current).toBe(true);
      expect(frames.size).toBe(0);
      expect(adapter.prepareInitialView).toHaveBeenCalledTimes(preparations);
    } finally {
      hook?.unmount();
      request.mockRestore();
      cancel.mockRestore();
    }
  });

  it('cancels pending preparation when unmounted', () => {
    expect.hasAssertions();
    const request = jest.spyOn(window, 'requestAnimationFrame').mockReturnValue(42);
    const cancel = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const store = legacy_createStore(() => loadedState());
    const context = { getViewerAdapter: () => ({ prepareInitialView: () => false }) };
    const wrapper = ({ children }) => (
      <Provider store={store}>
        <NglContext.Provider value={context}>{children}</NglContext.Provider>
      </Provider>
    );
    try {
      const { unmount } = renderHook(() => useInitialViewerPresentation(viewId, true), { wrapper });
      unmount();
      expect(cancel).toHaveBeenCalledWith(42);
    } finally {
      request.mockRestore();
      cancel.mockRestore();
    }
  });
});
