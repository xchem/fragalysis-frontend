import React from 'react';
import { act, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { createHtmlPortalNode, InPortal, OutPortal } from 'react-reverse-portal';
import { NglContext } from './nglProvider';
import NglViewerAdapter from '../../viewer/NglViewerAdapter';
import NglView from './nglView';

jest.mock('./nglProvider', () => ({ NglContext: require('react').createContext() }));
jest.mock('./redux/dispatchActions', () => ({ handleNglViewPick: jest.fn() }));
jest.mock('../../viewer/NglViewerAdapter', () => ({ __esModule: true, default: { create: jest.fn() } }));
jest.mock('../../viewer/viewerTelemetry', () => ({
  createViewerInitializationTelemetry: () => ({ started: jest.fn(), ready: jest.fn(), failed: jest.fn() })
}));

describe('restored NGL host', () => {
  it('retains the viewer across portal moves and parameter/listener updates, and disposes it only on actual unmount', async () => {
    expect.hasAssertions();
    const previousObserver = global.ResizeObserver;
    const observers = [];
    global.ResizeObserver = class {
      constructor(callback) {
        this.notify = callback;
        jest.spyOn(this, 'observe');
        jest.spyOn(this, 'disconnect');
        observers.push(this);
      }
      observe() {}
      disconnect() {}
    };
    const frames = new Map();
    let serial = 0;
    const request = jest.spyOn(global, 'requestAnimationFrame').mockImplementation(callback => {
      frames.set(++serial, callback);
      return serial;
    });
    const cancel = jest.spyOn(global, 'cancelAnimationFrame').mockImplementation(id => frames.delete(id));
    const adapter = Object.fromEntries(
      [
        'setParameters',
        'resize',
        'addPickHandler',
        'addClickHandler',
        'addOrientationChangeHandler',
        'removePickHandler',
        'removeClickHandler',
        'removeOrientationChangeHandler'
      ].map(name => [name, jest.fn()])
    );
    adapter.getRendererElement = () => document.querySelector('#major_view canvas');
    adapter.destroy = async () => {};
    jest.spyOn(adapter, 'destroy');
    NglViewerAdapter.create.mockImplementation(id => {
      document.getElementById(id).appendChild(document.createElement('canvas'));
      return adapter;
    });
    const context = {
      registerNglView: jest.fn(),
      unregisterNglView: jest.fn(),
      getViewerAdapter: () => adapter
    };
    const initialState = {
      apiReducers: { target_on: 1 },
      nglReducers: { viewParams: { backgroundColor: 'white', clipNear: 30 } },
      selectionReducers: { unifiedFilter: {}, coordinateRadiusLHS: 5 }
    };
    const store = legacy_createStore((state = initialState, action) => action.state || state);
    const portal = createHtmlPortalNode();
    const theme = createTheme();
    const ui = moved => (
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <NglContext.Provider value={context}>
            <div>{!moved && <OutPortal node={portal} />}</div>
            <div>{moved && <OutPortal node={portal} />}</div>
            <InPortal node={portal}>
              <NglView div_id="major_view" />
            </InPortal>
          </NglContext.Provider>
        </Provider>
      </ThemeProvider>
    );
    let view;
    try {
      view = render(ui(false));
      await act(async () => {});
      const canvas = document.querySelector('#major_view canvas');
      expect(canvas).not.toBeNull();
      expect(NglViewerAdapter.create).toHaveBeenCalledTimes(1);
      expect(context.registerNglView).toHaveBeenCalledWith('major_view', adapter);
      expect(adapter.setParameters).toHaveBeenCalledWith(expect.objectContaining(initialState.nglReducers.viewParams));
      await act(async () =>
        store.dispatch({
          type: 'UPDATE',
          state: { ...initialState, nglReducers: { viewParams: { backgroundColor: 'black', clipNear: 70 } } }
        })
      );
      view.rerender(ui(true));
      await act(async () => {});
      expect(document.querySelector('#major_view canvas')).toBe(canvas);
      expect(adapter.setParameters).toHaveBeenCalledWith({ backgroundColor: 'black', clipNear: 70 });
      expect(NglViewerAdapter.create).toHaveBeenCalledTimes(1);
      expect(adapter.destroy).not.toHaveBeenCalled();
      observers[0].notify();
      await act(async () => {
        const pending = [...frames.values()];
        frames.clear();
        pending.forEach(callback => callback());
      });
      expect(adapter.resize).toHaveBeenCalledTimes(1);
      observers[0].notify();
      view.unmount();
      view = null;
      expect(frames.size).toBe(0);
      expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
      expect(context.unregisterNglView).toHaveBeenCalledWith('major_view');
      expect(adapter.destroy).toHaveBeenCalledTimes(1);
      expect(adapter.removePickHandler).toHaveBeenCalledWith(expect.any(Function));
    } finally {
      view?.unmount();
      request.mockRestore();
      cancel.mockRestore();
      global.ResizeObserver = previousObserver;
    }
  });
});
