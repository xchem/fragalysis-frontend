import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, legacy_createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '../../../../../../theme';
import { selectionReducers } from '../../../../../../reducers/selection/selectionReducers';
import {
  appendDensityList,
  appendToBeDisplayedList,
  updateInToBeDisplayedList
} from '../../../../../../reducers/selection/actions';
import { NglContext } from '../../../../../nglView/nglProvider';
import { generateDensityObject } from '../../../../../nglView/generatingObjects';
import { loadObject } from '../../../../../../reducers/ngl/dispatchActions';
import { useDisplayDensityLHS } from '../../../../../../reducers/ngl/useDisplayDensityLHS';
import { deleteDensityObject } from '../../../redux/dispatchActions';
import DensityButtonPopover from './DensityButtonPopover';

jest.mock('../../../../../nglView/nglProvider', () => ({ NglContext: require('react').createContext() }));
jest.mock('../../../../../nglView/generatingObjects', () => ({ generateDensityObject: jest.fn() }));
jest.mock('../../../../../../reducers/ngl/dispatchActions', () => ({ loadObject: jest.fn() }));
jest.mock('../../../redux/dispatchActions', () => ({
  deleteDensityObject: jest.fn(),
  getDensityChangedParams: settings => () => ({ densitySettings: settings }),
  getDensityMapData: jest.fn(),
  getProteinData: jest.fn(),
  removeQuality: jest.fn(),
  toggleDensityWireframe: () => ({ type: 'TEST_TOGGLE_WIREFRAME' })
}));
jest.mock('react-color', () => ({
  SketchPicker: ({ onChange }) => <button onClick={() => onChange({ hex: '#123456' })}>Choose map color</button>
}));

const deferred = () => {
  let resolve;
  const promise = new Promise(accept => {
    resolve = accept;
  });
  return { promise, resolve };
};

const settings = {
  id: 1,
  isWireframeStyle: true,
  color: '#abcdef',
  render_event: true,
  render_2FoFc: false,
  render_FoFc: false,
  contour_event: 1,
  contour_2FoFc: 1.2,
  contour_FoFc: 3
};

// Both D-button handlers omit the flags for unselected map types.
const leftClickSettings = flag => {
  const initial = { ...settings };
  for (const key of ['render_event', 'render_2FoFc', 'render_FoFc']) delete initial[key];
  return { ...initial, [flag]: true };
};

const mol = {
  id: 1,
  code: 'observation',
  proteinData: { event_info: '/event.ccp4', sigmaa_info: '/2fofc.ccp4', diff_info: '/fofc.ccp4' }
};

const createStore = (densitySettings = settings, displayed = true) => {
  jest.clearAllMocks();
  generateDensityObject.mockImplementation(() => async () => ({ name: 'observation_DENSITY' }));
  loadObject.mockImplementation(() => async () => {});
  deleteDensityObject.mockImplementation(() => async () => {});
  const actions = [];
  const store = legacy_createStore(
    combineReducers({
      selectionReducers,
      apiReducers: (state = { all_mol_lists: [mol], target_id_list: [] }) => state
    }),
    applyMiddleware(thunk, () => next => action => {
      actions.push(action);
      // Turn an update loop into a bounded, explanatory regression failure.
      if (actions.length > 50) throw new Error('Density settings repeatedly dispatched without acknowledgement');
      return next(action);
    })
  );
  if (densitySettings) {
    store.dispatch(
      appendToBeDisplayedList({
        id: mol.id,
        type: 'DENSITY',
        display: true,
        rendered: displayed,
        center: false,
        densityData: mol.proteinData,
        densityObject: densitySettings
      })
    );
    if (displayed) store.dispatch(appendDensityList(densitySettings));
  }
  actions.length = 0;
  return { store, actions };
};

const DisplayDensity = () => {
  useDisplayDensityLHS();
  return null;
};

const stage = {};
const context = { getNglView: () => ({ stage }) };
const theme = getTheme();
const ui = (store, { display = false, open = true } = {}) => (
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <NglContext.Provider value={context}>
          {display && <DisplayDensity />}
          {open && <DensityButtonPopover mol={mol} />}
        </NglContext.Provider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

describe('density customization', () => {
  it.each([
    ['Event', 'render_event'],
    ['2FoFc', 'render_2FoFc'],
    ['FoFc', 'render_FoFc']
  ])('keeps the left-clicked %s map loaded when first opening and reopening the dialog', async (label, flag) => {
    expect.hasAssertions();
    const initial = leftClickSettings(flag);
    const { store, actions } = createStore(initial);
    const selection = store.getState().selectionReducers;
    const view = render(ui(store, { display: true, open: false }));
    view.rerender(ui(store, { display: true }));
    await act(async () => {});

    expect(screen.getByRole('checkbox', { name: label })).toBeChecked();
    expect(actions).toHaveLength(0);
    expect(store.getState().selectionReducers).toBe(selection);
    expect(deleteDensityObject).not.toHaveBeenCalled();
    expect(loadObject).not.toHaveBeenCalled();

    view.rerender(ui(store, { display: true, open: false }));
    view.rerender(ui(store, { display: true }));
    await act(async () => {});

    expect(actions).toHaveLength(0);
    expect(store.getState().selectionReducers).toBe(selection);
    expect(deleteDensityObject).not.toHaveBeenCalled();
    expect(loadObject).not.toHaveBeenCalled();
  });

  it('does not replace a left-clicked map when its initial load finishes after opening the dialog', async () => {
    expect.hasAssertions();
    const initial = leftClickSettings('render_event');
    const { store, actions } = createStore(initial, false);
    const coordinates = deferred();
    generateDensityObject.mockImplementationOnce(() => () => coordinates.promise);
    const view = render(ui(store, { display: true, open: false }));
    await act(async () => {});
    view.rerender(ui(store, { display: true }));
    expect(actions).toHaveLength(0);

    await act(async () => coordinates.resolve({ name: 'observation_DENSITY' }));

    expect(generateDensityObject).toHaveBeenCalledTimes(1);
    expect(loadObject).toHaveBeenCalledTimes(1);
    expect(deleteDensityObject).not.toHaveBeenCalled();
    expect(store.getState().selectionReducers.densityList).toStrictEqual([initial]);
    expect(store.getState().selectionReducers.toBeDisplayedList[0]).toMatchObject({
      rendered: true,
      densityObject: initial
    });
  });

  it('still loads default density once when opening without an existing map', async () => {
    expect.hasAssertions();
    const { store } = createStore(null, false);
    const view = render(ui(store, { display: true }));
    await act(async () => {});
    expect(loadObject).toHaveBeenCalledTimes(1);
    expect(deleteDensityObject).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: 'Event' })).toBeChecked();
    view.rerender(ui(store, { display: true, open: false }));
    view.rerender(ui(store, { display: true }));
    await act(async () => {});
    expect(loadObject).toHaveBeenCalledTimes(1);
    expect(deleteDensityObject).not.toHaveBeenCalled();
  });

  it('applies real edits and allows returning to the appearance shown on opening', () => {
    expect.hasAssertions();
    const initial = leftClickSettings('render_event');
    const { store, actions } = createStore(initial);
    render(ui(store));
    expect(actions).toHaveLength(0);
    fireEvent.click(screen.getByRole('radio', { name: 'Surface' }));
    expect(store.getState().selectionReducers.toBeDisplayedList[0].densityObject.isWireframeStyle).toBe(false);
    fireEvent.click(screen.getByRole('radio', { name: 'Wireframe' }));
    expect(store.getState().selectionReducers.toBeDisplayedList[0].densityObject).toStrictEqual(settings);
    expect(actions).toHaveLength(2);
  });

  it.each([
    ['Event', 'render_event'],
    ['2FoFc', 'render_2FoFc'],
    ['FoFc', 'render_FoFc']
  ])('removes the last selected %s map before acknowledging unchecked settings', async (label, flag) => {
    expect.hasAssertions();
    const initial = { ...settings, render_event: false, [flag]: true };
    const { store } = createStore(initial);
    const deletion = deferred();
    deleteDensityObject.mockImplementationOnce(() => () => deletion.promise);
    render(ui(store, { display: true }));

    fireEvent.click(screen.getByRole('checkbox', { name: label }));
    await act(async () => {});

    expect(deleteDensityObject).toHaveBeenCalledWith(mol, stage, initial);
    expect(store.getState().selectionReducers.densityList).toStrictEqual([initial]);
    expect(store.getState().selectionReducers.toBeDisplayedList[0].rendered).toBe(false);

    await act(async () => deletion.resolve());

    const unchecked = { ...initial, [flag]: false };
    expect(store.getState().selectionReducers.densityList).toStrictEqual([unchecked]);
    expect(store.getState().selectionReducers.toBeDisplayedList[0]).toMatchObject({
      rendered: true,
      densityObject: unchecked
    });
    expect(loadObject.mock.calls[0][0].target.densitySettings).toStrictEqual(unchecked);
    expect(screen.getByRole('checkbox', { name: label })).not.toBeChecked();
  });

  it('updates a displayed 2FoFc selection once with a valid queue identity', () => {
    expect.hasAssertions();
    const { store, actions } = createStore();
    render(ui(store));
    expect(actions).toHaveLength(0);

    fireEvent.click(screen.getByRole('checkbox', { name: '2FoFc' }));

    expect(actions).toHaveLength(1);
    expect(store.getState().selectionReducers.toBeDisplayedList).toStrictEqual([
      expect.objectContaining({
        id: 1,
        type: 'DENSITY',
        display: true,
        rendered: false,
        densityData: mol.proteinData,
        densityObject: { ...settings, render_2FoFc: true }
      })
    ]);
    expect(store.getState().selectionReducers.densityList).toStrictEqual([settings]);
  });

  it('keeps legacy checkboxes controlled and preserves a zero contour on reopen', () => {
    expect.hasAssertions();
    const { store } = createStore({ ...settings, render_2FoFc: undefined, render_FoFc: undefined, contour_event: 0 });
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(ui(store));
      expect(screen.getByRole('checkbox', { name: '2FoFc' })).not.toBeChecked();
      expect(screen.getAllByRole('slider')[0]).toHaveAttribute('aria-valuenow', '0');

      fireEvent.click(screen.getByRole('checkbox', { name: '2FoFc' }));

      expect(screen.getByRole('checkbox', { name: '2FoFc' })).toBeChecked();
      expect(store.getState().selectionReducers.toBeDisplayedList[0].densityObject).toMatchObject({
        render_2FoFc: true,
        render_FoFc: false,
        contour_event: 0
      });
      expect(errors).not.toHaveBeenCalled();
    } finally {
      errors.mockRestore();
    }
  });

  it('finishes replacing maps with the latest settings after the popover closes', async () => {
    expect.hasAssertions();
    const { store } = createStore();
    const deletion = deferred();
    const rendering = deferred();
    deleteDensityObject.mockImplementationOnce(() => () => deletion.promise);
    loadObject.mockImplementationOnce(() => () => rendering.promise);
    const view = render(ui(store, { display: true }));
    await act(async () => {});
    expect(loadObject).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('checkbox', { name: '2FoFc' }));
    await act(async () => {});
    expect(deleteDensityObject).toHaveBeenCalledTimes(1);
    expect(deleteDensityObject).toHaveBeenCalledWith(mol, stage, settings);
    expect(loadObject).not.toHaveBeenCalled();
    expect(store.getState().selectionReducers.densityList).toStrictEqual([settings]);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Event' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Surface' }));
    fireEvent.change(screen.getAllByRole('slider')[1], { target: { value: 2.1 } });
    fireEvent.click(screen.getByRole('button', { name: 'Choose map color' }));
    const desired = store.getState().selectionReducers.toBeDisplayedList[0].densityObject;
    expect(desired).toStrictEqual({
      ...settings,
      render_event: false,
      render_2FoFc: true,
      isWireframeStyle: false,
      contour_2FoFc: 2.1,
      color: '#123456'
    });
    view.rerender(ui(store, { display: true, open: false }));
    await act(async () => {
      deletion.resolve();
    });

    expect(deleteDensityObject).toHaveBeenCalledTimes(1);
    expect(loadObject).toHaveBeenCalledTimes(1);
    expect(loadObject.mock.calls[0][0].target.densitySettings).toStrictEqual(desired);
    expect(store.getState().selectionReducers.densityList).toStrictEqual([]);
    expect(store.getState().selectionReducers.toBeDisplayedList[0].rendered).toBe(false);

    await act(async () => {
      rendering.resolve();
    });
    expect(store.getState().selectionReducers.densityList).toStrictEqual([desired]);
    expect(store.getState().selectionReducers.toBeDisplayedList[0]).toMatchObject({
      display: true,
      rendered: true,
      densityObject: desired
    });
  });

  it('orders edits made during coordinate fetching and rendering without acknowledging stale settings', async () => {
    expect.hasAssertions();
    const { store } = createStore(settings, false);
    const coordinates = deferred();
    const rendering = deferred();
    const deletion = deferred();
    generateDensityObject.mockImplementationOnce(() => () => coordinates.promise);
    loadObject.mockImplementationOnce(() => () => rendering.promise);
    deleteDensityObject.mockImplementationOnce(() => () => deletion.promise);
    render(ui(store, { display: true }));
    await act(async () => {});

    fireEvent.click(screen.getByRole('checkbox', { name: '2FoFc' }));
    await act(async () => {
      coordinates.resolve({ name: 'observation_DENSITY' });
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'FoFc' }));
    expect(generateDensityObject).toHaveBeenCalledTimes(1);
    expect(loadObject).toHaveBeenCalledTimes(1);
    expect(deleteDensityObject).not.toHaveBeenCalled();

    await act(async () => {
      rendering.resolve();
    });
    expect(deleteDensityObject).toHaveBeenCalledTimes(1);
    expect(store.getState().selectionReducers.toBeDisplayedList[0].rendered).toBe(false);
    expect(store.getState().selectionReducers.densityList).toStrictEqual([settings]);

    await act(async () => {
      deletion.resolve();
    });
    expect(generateDensityObject).toHaveBeenCalledTimes(2);
    expect(loadObject).toHaveBeenCalledTimes(2);
    expect(store.getState().selectionReducers.densityList).toStrictEqual([
      { ...settings, render_2FoFc: true, render_FoFc: true }
    ]);
    expect(store.getState().selectionReducers.toBeDisplayedList[0].rendered).toBe(true);
  });

  it('honors removal requested while a settings replacement is deleting the old map', async () => {
    expect.hasAssertions();
    const { store } = createStore();
    const deletion = deferred();
    deleteDensityObject.mockImplementationOnce(() => () => deletion.promise);
    render(ui(store, { display: true }));
    fireEvent.click(screen.getByRole('checkbox', { name: '2FoFc' }));
    await act(async () => {
      store.dispatch(updateInToBeDisplayedList({ id: 1, type: 'DENSITY', display: false }));
    });
    await act(async () => {
      deletion.resolve();
    });

    expect(loadObject).not.toHaveBeenCalled();
    expect(store.getState().selectionReducers.densityList).toStrictEqual([]);
    expect(store.getState().selectionReducers.toBeDisplayedList).toStrictEqual([]);
  });

  it('does not continuously retry a failed map load while the popover remains open', async () => {
    expect.hasAssertions();
    const { store } = createStore(settings, false);
    loadObject.mockImplementationOnce(() => async () => {
      throw new Error('Map load failed');
    });
    render(ui(store, { display: true }));
    await act(async () => {});

    expect(loadObject).toHaveBeenCalledTimes(1);
    expect(store.getState().selectionReducers.densityList).toStrictEqual([]);
    expect(store.getState().selectionReducers.toBeDisplayedList).toStrictEqual([]);
  });
});
