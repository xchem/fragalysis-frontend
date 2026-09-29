import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { createHtmlPortalNode, InPortal, OutPortal } from 'react-reverse-portal';
import { NglContext } from '../nglView/nglProvider';
import MoorhenViewerAdapter from '../../viewer/MoorhenViewerAdapter';
import { initializeMoorhenCcp4Module } from '../moorhenProof/moorhenCcp4';
import MoorhenView from './MoorhenView';

jest.mock('../nglView/nglProvider', () => ({ NglContext: require('react').createContext() }));
jest.mock('../nglView/redux/dispatchActions', () => ({ handleNglViewPick: jest.fn() }));
jest.mock('../../reducers/ngl/dispatchActions', () => ({ setOrientationByInteraction: jest.fn() }));
jest.mock('../moorhenProof/moorhenCcp4', () => ({ initializeMoorhenCcp4Module: jest.fn() }));
jest.mock('./moorhenWorkerBridge', () => ({ installMoorhenWorkerBridge: async () => () => {} }));
jest.mock('../../viewer/viewerTelemetry', () => ({
  createViewerInitializationTelemetry: () => ({ started: () => {}, ready: () => {}, failed: () => {} })
}));
jest.mock('../../viewer/MoorhenViewerAdapter', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    addPickHandler: jest.fn(),
    addOrientationChangeHandler: jest.fn(),
    removePickHandler: jest.fn(),
    removeOrientationChangeHandler: jest.fn(),
    prepareInitialView: jest.fn(() => true),
    resize: jest.fn(),
    setNglStyleInteractions: jest.fn(async () => {}),
    destroy: jest.fn(async () => {})
  }))
}));
jest.mock('moorhen', () => {
  const { legacy_createStore } = require('redux');
  const state = { generalStates: { cootInitialized: true, userPreferencesMounted: true } };
  const reset = () => ({ type: 'MOORHEN_RESET' });
  return {
    MoorhenReduxStore: legacy_createStore(() => state),
    emptyMaps: reset,
    emptyMolecules: reset,
    emptyVectors: reset,
    resetBackupSettings: reset,
    resetGeneralStates: reset,
    resetHoveringStates: reset,
    resetMapContourSettings: reset,
    resetSceneSettings: reset,
    // Preserve the installed container's relevant DOM, including its stray text.
    MoorhenContainer: ({ extraNavBarMenus }) => (
      <div className="baby-gru container-fluid">
        <div className="dropzone">
          <div className="row">
            <div className="col">
              <div id="moorhen-canvas-background">
                <figure>
                  <canvas data-testid="webgl-canvas" />
                  <canvas style={{ position: 'absolute' }} data-testid="overlay-canvas" />;
                </figure>
              </div>
            </div>
          </div>
        </div>
        {extraNavBarMenus.find(menu => menu.name === 'Preferences')?.JSXElement}
      </div>
    )
  };
});

describe('embedded Moorhen viewport', () => {
  it('observes the mounted panel across Designs toggles and portal moves, then cancels pending resize work on teardown', async () => {
    expect.hasAssertions();
    const previousObserver = global.ResizeObserver;
    const previousIsolation = Object.getOwnPropertyDescriptor(window, 'crossOriginIsolated');
    Object.defineProperty(window, 'crossOriginIsolated', { configurable: true, value: true });
    const observers = [];
    global.ResizeObserver = class {
      constructor(callback) {
        this.notify = callback;
        Object.assign(this, { observe: jest.fn(), disconnect: jest.fn() });
        observers.push(this);
      }
    };
    const frames = new Map();
    let nextFrame = 1;
    const requestFrame = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      const id = nextFrame++;
      frames.set(id, callback);
      return id;
    });
    const cancelFrame = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => frames.delete(id));
    const flushFrames = () => {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach(callback => callback());
    };
    let finishInitialization;
    initializeMoorhenCcp4Module.mockReturnValue(
      new Promise(resolve => {
        finishInitialization = resolve;
      })
    );
    const portal = createHtmlPortalNode();
    let registeredAdapter;
    const context = {
      registerNglView: jest.fn((id, adapter) => {
        registeredAdapter = adapter;
      }),
      unregisterNglView: jest.fn(),
      getViewerAdapter: () => registeredAdapter
    };
    const initialState = {
      apiReducers: { lhsDataIsLoaded: false, all_mol_lists: [] },
      selectionReducers: { toBeDisplayedList: [] },
      datasetsReducers: { toBeDisplayedList: {} },
      nglReducers: {}
    };
    const appStore = legacy_createStore((state = initialState, action) => action.state || state);
    const ui = designsOpen => (
      <Provider store={appStore}>
        <NglContext.Provider value={context}>
          <div data-testid="wide-layout">{!designsOpen && <OutPortal node={portal} />}</div>
          <div data-testid="designs-layout">{designsOpen && <OutPortal node={portal} />}</div>
          <InPortal node={portal}>
            <MoorhenView div_id="major_view" deferInitialPresentation />
          </InPortal>
        </NglContext.Provider>
      </Provider>
    );
    let view;
    try {
      view = render(ui(false));
      await act(async () => {});
      expect(observers).toHaveLength(0);
      await act(async () => finishInitialization());
      expect(observers).toHaveLength(1);
      const observer = observers[0];
      const panel = document.getElementById('major_view');
      const canvas = view.getByTestId('webgl-canvas');
      const adapter = MoorhenViewerAdapter.mock.results[0].value;
      const interactionsSwitch = view.getByRole('switch', { name: 'NGL style interactions' });
      expect(interactionsSwitch).not.toBeChecked();
      await act(async () => fireEvent.click(interactionsSwitch));
      expect(adapter.setNglStyleInteractions).toHaveBeenCalledWith(true);
      expect(getComputedStyle(canvas.closest('.baby-gru')).opacity).toBe('0');
      expect(view.getByText('Preparing view...')).toBeInTheDocument();
      expect(observer.observe).toHaveBeenCalledWith(panel);
      expect(adapter.resize).not.toHaveBeenCalled();
      await act(async () => flushFrames());
      expect(adapter.resize).toHaveBeenCalledTimes(1);

      await act(async () =>
        appStore.dispatch({
          type: 'INITIAL_LOAD_FINISHED',
          state: { ...initialState, apiReducers: { lhsDataIsLoaded: true, all_mol_lists: [] } }
        })
      );
      await act(async () => flushFrames());
      expect(getComputedStyle(canvas.closest('.baby-gru')).opacity).toBe('0');
      await act(async () => flushFrames());
      expect(getComputedStyle(canvas.closest('.baby-gru')).opacity).toBe('1');
      await act(async () => appStore.dispatch({ type: 'SNAPSHOT_LOAD_STARTED', state: initialState }));

      for (const designsOpen of [true, false, true]) {
        view.rerender(ui(designsOpen));
        observer.notify();
        observer.notify();
        expect(frames.size).toBe(1);
        await act(async () => flushFrames());
        const parent = view.getByTestId(designsOpen ? 'designs-layout' : 'wide-layout');
        expect(parent).toContainElement(canvas);
        expect(document.getElementById('major_view')).toBe(panel);
        expect(getComputedStyle(canvas.closest('.baby-gru')).opacity).toBe('1');
      }
      expect(adapter.resize).toHaveBeenCalledTimes(4);
      expect(MoorhenViewerAdapter).toHaveBeenCalledTimes(1);
      expect(adapter.destroy).not.toHaveBeenCalled();
      expect(interactionsSwitch).toBeChecked();

      const figure = canvas.parentElement;
      expect(getComputedStyle(figure).margin).toBe('0px');
      expect(getComputedStyle(figure).fontSize).toBe('0px');
      expect(getComputedStyle(figure).lineHeight).toBe('0');
      expect(getComputedStyle(canvas).display).toBe('block');
      expect(getComputedStyle(view.getByTestId('overlay-canvas')).position).toBe('absolute');

      observer.notify();
      expect(frames.size).toBe(1);
      view.unmount();
      expect(observer.disconnect).toHaveBeenCalledTimes(1);
      expect(frames.size).toBe(0);
      observer.notify();
      expect(frames.size).toBe(0);
      expect(adapter.destroy).toHaveBeenCalledTimes(1);
      expect(context.unregisterNglView).toHaveBeenCalledWith('major_view');
    } finally {
      view?.unmount();
      requestFrame.mockRestore();
      cancelFrame.mockRestore();
      global.ResizeObserver = previousObserver;
      if (previousIsolation) Object.defineProperty(window, 'crossOriginIsolated', previousIsolation);
      else delete window.crossOriginIsolated;
    }
  });
});
