import React from 'react';
import { act, render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { ProjectPreview } from './index';
import { NglContext } from '../../nglView/nglProvider';
import { ToastContext } from '../../toast';
import nglReducers from '../../../reducers/ngl/nglReducers';
import { setReapplyOrientation } from '../../../reducers/ngl/actions';
import { VIEWS } from '../../../constants/constants';

jest.mock('../../preview/Preview', () => () => null);
jest.mock('../legacySnapshotModal', () => ({ LegacySnapshotModal: () => null }));
jest.mock('../../nglView/nglProvider', () => ({ NglContext: require('react').createContext() }));
jest.mock('../../toast', () => ({ ToastContext: require('react').createContext() }));
jest.mock('../../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));
jest.mock('react-router-dom', () => ({ useRouteMatch: () => ({ params: { projectId: '7', snapshotId: '2' } }) }));

const orientation = { elements: [0, 0, 0, -1, 1, 2, 3, 0.5] };
const setup = ({ applied = false, switching = false } = {}) => {
  const state = {
    projectReducers: { currentSnapshot: { id: 2 }, currentProject: {} },
    snapshotReducers: { switchingSnapshotWithinProject: switching },
    selectionReducers: { toBeDisplayedList: [], fragmentDisplayList: [] },
    datasetsReducers: { toBeDisplayedList: {}, ligandLists: {} },
    nglReducers: {
      ...nglReducers(undefined, {}),
      nglViewFromSnapshotRendered: true,
      snapshotOrientationApplied: applied,
      snapshotNglOrientation: { [VIEWS.MAJOR_VIEW]: orientation }
    }
  };
  const store = legacy_createStore((current = state, action) =>
    action.type === 'TEST_REPLACE'
      ? action.state
      : { ...current, nglReducers: nglReducers(current.nglReducers, action) }
  );
  const viewer = { setOrientation: jest.fn() };
  const view = { stage: {} };
  render(
    <Provider store={store}>
      <ToastContext.Provider value={{ toast: jest.fn() }}>
        <NglContext.Provider value={{ getNglView: () => view, getViewerAdapter: () => viewer }}>
          <ProjectPreview />
        </NglContext.Provider>
      </ToastContext.Provider>
    </Provider>
  );
  return { store, viewer };
};

describe('snapshot camera restoration', () => {
  it('applies the initial saved camera once and still honors explicit reapply requests', () => {
    expect.hasAssertions();
    const { store, viewer } = setup();
    expect(viewer.setOrientation).toHaveBeenCalledTimes(1);
    expect(viewer.setOrientation).toHaveBeenCalledWith(orientation.elements);
    expect(store.getState().nglReducers.snapshotOrientationApplied).toBe(true);
    act(() => store.dispatch(setReapplyOrientation(true)));
    expect(viewer.setOrientation).toHaveBeenCalledTimes(2);
    expect(store.getState().nglReducers.reapplyOrientation).toBe(false);
  });

  it('does not reapply an animated or manually interrupted camera when switching clears or structures finish', () => {
    expect.hasAssertions();
    const { store, viewer } = setup({ applied: true, switching: true });
    const current = store.getState();
    act(() =>
      store.dispatch({
        type: 'TEST_REPLACE',
        state: {
          ...current,
          snapshotReducers: { switchingSnapshotWithinProject: false },
          nglReducers: { ...current.nglReducers, snapshotNglOrientation: { [VIEWS.MAJOR_VIEW]: { ...orientation } } }
        }
      })
    );
    expect(viewer.setOrientation).not.toHaveBeenCalled();
  });

  it('defers unhandled camera restoration during an in-place switch', () => {
    expect.hasAssertions();
    const { store, viewer } = setup({ switching: true });
    expect(viewer.setOrientation).not.toHaveBeenCalled();
    expect(store.getState().nglReducers.snapshotOrientationApplied).toBe(false);
    act(() =>
      store.dispatch({
        type: 'TEST_REPLACE',
        state: {
          ...store.getState(),
          snapshotReducers: { switchingSnapshotWithinProject: false }
        }
      })
    );
    expect(viewer.setOrientation).toHaveBeenCalledTimes(1);
  });
});
