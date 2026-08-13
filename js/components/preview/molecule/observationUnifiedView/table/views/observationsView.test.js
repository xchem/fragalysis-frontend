import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { Provider } from 'react-redux';
import { combineReducers, legacy_createStore } from 'redux';
import { getTheme } from '../../../../../../theme';
import { setObservationsForLHSCmp } from '../../../../../../reducers/selection/actions';
import { selectionReducers } from '../../../../../../reducers/selection/selectionReducers';
import { ObservationsView } from './observationsView';

jest.mock('../../../../../tooltip/RichTooltip', () => ({ children }) => children);

describe('ObservationsView', () => {
  let consoleWarn;

  beforeEach(() => {
    consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarn.mockRestore();
  });

  it('assigns dialog ownership to the navigator that opened it and clears ownership on close', () => {
    const store = legacy_createStore(combineReducers({ selectionReducers }));
    const observations = [{ id: 926 }, { id: 927 }];
    const handleRef = jest.fn();

    render(
      <Provider store={store}>
        <ThemeProvider theme={getTheme()}>
          <ObservationsView
            data={{ id: 'rhs-pose' }}
            observations={observations}
            isAnyObservationOn={false}
            handleRef={handleRef}
            dialogSide="rhs"
          />
        </ThemeProvider>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: '2' }));

    expect(store.getState().selectionReducers).toMatchObject({
      isObservationDialogOpen: true,
      observationsDialogSide: 'rhs',
      poseIdForObservationsDialog: 'rhs-pose',
      observationsForLHSCmp: observations
    });
    expect(handleRef).toHaveBeenCalledTimes(1);

    const openedState = store.getState();
    store.dispatch(setObservationsForLHSCmp([...observations]));
    expect(store.getState()).toBe(openedState);

    fireEvent.click(screen.getByRole('button', { name: '2' }));

    expect(store.getState().selectionReducers).toMatchObject({
      isObservationDialogOpen: false,
      observationsDialogSide: null
    });
    expect(handleRef).toHaveBeenCalledTimes(2);
  });
});
