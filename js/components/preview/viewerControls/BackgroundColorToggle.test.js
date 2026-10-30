import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, legacy_createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { ThemeProvider } from '../../../ui/styles';
import { getTheme } from '../../../theme';
import { NglContext } from '../../nglView/nglProvider';
import { BackgroundColorToggle } from './BackgroundColorToggle';
import nglReducers from '../../../reducers/ngl/nglReducers';
import { setNglViewParams } from '../../../reducers/ngl/actions';
import ViewerAdapter from '../../../viewer/ViewerAdapter';

jest.mock('../../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));

const renderToggles = backgroundColor => {
  const initial = { ...nglReducers(undefined, {}) };
  if (backgroundColor !== undefined) initial.viewParams = { ...initial.viewParams, backgroundColor };
  const store = legacy_createStore(
    (state = { nglReducers: initial }, action) => ({ nglReducers: nglReducers(state.nglReducers, action) }),
    applyMiddleware(thunk)
  );
  const adapter = new ViewerAdapter();
  jest.spyOn(adapter, 'setParameters').mockImplementation(() => {});
  render(
    <Provider store={store}>
      <ThemeProvider theme={getTheme()}>
        <NglContext.Provider value={{ getViewerAdapter: () => adapter }}>
          <BackgroundColorToggle showLabel />
          <BackgroundColorToggle />
        </NglContext.Provider>
      </ThemeProvider>
    </Provider>
  );
  return { store, adapter, switches: screen.getAllByRole('switch', { name: 'Light background' }) };
};

describe('viewer background controls', () => {
  it('defaults to light grey and keeps the toolbar and settings toggles synchronized', () => {
    expect.hasAssertions();
    const { store, adapter, switches } = renderToggles();
    expect(store.getState().nglReducers.viewParams.backgroundColor).toBe('#ededed');
    switches.forEach(control => expect(control).toBeChecked());
    expect(screen.getByText('Light')).toBeInTheDocument();
    fireEvent.click(switches[0]);
    switches.forEach(control => expect(control).not.toBeChecked());
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(adapter.setParameters).toHaveBeenLastCalledWith({ backgroundColor: 'black' });
    fireEvent.click(switches[1]);
    switches.forEach(control => expect(control).toBeChecked());
    expect(adapter.setParameters).toHaveBeenLastCalledWith({ backgroundColor: '#ededed' });
    expect(store.getState().nglReducers.viewParams.backgroundColor).toBe('#ededed');
  });

  it.each(['black', 'white'])('retains a saved %s background and follows restored settings', backgroundColor => {
    expect.hasAssertions();
    const { store, adapter, switches } = renderToggles(backgroundColor);
    expect(store.getState().nglReducers.viewParams.backgroundColor).toBe(backgroundColor);
    switches.forEach(control => expect(control.checked).toBe(backgroundColor === 'white'));
    expect(adapter.setParameters).not.toHaveBeenCalled();
    act(() => {
      store.dispatch(setNglViewParams('backgroundColor', '#ededed'));
    });
    switches.forEach(control => expect(control).toBeChecked());
    expect(screen.getByText('Light')).toBeInTheDocument();
  });
});
