import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, legacy_createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { ThemeProvider } from '../../../ui/styles';
import { getTheme } from '../../../theme';
import { BackgroundColorToggle } from './BackgroundColorToggle';
import nglReducers from '../../../reducers/ngl/nglReducers';
import { setNglViewParams } from '../../../reducers/ngl/actions';

jest.mock('../../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));

const renderToggles = backgroundColor => {
  const initial = { ...nglReducers(undefined, {}) };
  if (backgroundColor !== undefined) initial.viewParams = { ...initial.viewParams, backgroundColor };
  const store = legacy_createStore(
    (state = { nglReducers: initial }, action) => ({ nglReducers: nglReducers(state.nglReducers, action) }),
    applyMiddleware(thunk)
  );
  render(
    <Provider store={store}>
      <ThemeProvider theme={getTheme()}>
        <BackgroundColorToggle showLabel />
        <BackgroundColorToggle />
      </ThemeProvider>
    </Provider>
  );
  return { store, switches: screen.getAllByRole('switch', { name: 'Light background' }) };
};

describe('viewer background controls', () => {
  it('defaults to black and keeps the toolbar and settings toggles synchronized', () => {
    expect.hasAssertions();
    const { store, switches } = renderToggles();
    const initial = store.getState().nglReducers.viewParams;
    expect(initial.backgroundColor).toBe('black');
    switches.forEach(control => expect(control).not.toBeChecked());
    expect(screen.getByText('Dark')).toBeInTheDocument();
    fireEvent.click(switches[0]);
    switches.forEach(control => expect(control).toBeChecked());
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(store.getState().nglReducers.viewParams).toStrictEqual({ ...initial, backgroundColor: '#ededed' });
    fireEvent.click(switches[1]);
    switches.forEach(control => expect(control).not.toBeChecked());
    expect(store.getState().nglReducers.viewParams).toStrictEqual(initial);
  });

  it.each(['black', 'white'])('retains a saved %s background and follows restored settings', backgroundColor => {
    expect.hasAssertions();
    const { store, switches } = renderToggles(backgroundColor);
    expect(store.getState().nglReducers.viewParams.backgroundColor).toBe(backgroundColor);
    switches.forEach(control => expect(control.checked).toBe(backgroundColor === 'white'));
    act(() => {
      store.dispatch(setNglViewParams('backgroundColor', '#ededed'));
    });
    switches.forEach(control => expect(control).toBeChecked());
    expect(screen.getByText('Light')).toBeInTheDocument();
  });
});
