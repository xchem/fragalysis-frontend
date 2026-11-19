import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider, useSelector } from 'react-redux';
import { combineReducers, legacy_createStore } from 'redux';
import { ThemeProvider } from '../../../../ui/styles';
import { getTheme } from '../../../../theme';
import { selectionReducers } from '../../../../reducers/selection/selectionReducers';
import apiReducers from '../../../../reducers/api/apiReducers';
import { appendFragmentDisplayList } from '../../../../reducers/selection/actions';
import ObservationUnifiedViewWrapper from './observationUnifiedViewWrapper';
import { COLUMN_TYPES } from './table';

const mockRowRender = jest.fn();
jest.mock('@loschmidt/jsme-react', () => ({ jsmeSetup: () => {} }));
jest.mock('../../../tooltip/RichTooltip', () => ({ children }) => children);
jest.mock('./hooks', () => ({
  useFilters: items => ({ filteredItems: items, getColumnFilter: () => null, applyFiltersAndSort: values => values })
}));
jest.mock('./observationUnifiedView', () => {
  const React = require('react');
  return React.memo(props => {
    mockRowRender(props.data.id);
    return (
      <tr>
        <td data-testid={`row-${props.data.id}`}>
          {String(props.L)}
          <button onClick={() => props.onPoseTransfer?.(props.data)}>Transfer {props.data.id}</button>
        </td>
      </tr>
    );
  });
});

const columns = [
  {
    name: 'detail',
    displayName: 'Observation',
    type: COLUMN_TYPES.OBSERVATION,
    visible: true,
    width: 230,
    minWidth: 60
  }
];
const viewConfig = { kind: 'lhs', getBaseColumns: () => columns, getColumnsWithoutExtras: () => columns };
const items = [
  { id: 100, associatedObs: [{ id: 1 }] },
  { id: 200, associatedObs: [{ id: 2 }] }
];
const empty = [];
const ConnectedTable = () => {
  const selection = useSelector(state => state.selectionReducers);
  return (
    <ObservationUnifiedViewWrapper
      viewConfig={viewConfig}
      items={items}
      navigationItems={[...items]}
      onPoseTransfer={() => {}}
      allSelectedMolecules={empty}
      fragmentDisplayList={selection.fragmentDisplayList}
      proteinList={selection.proteinList}
      complexList={selection.complexList}
      surfaceList={selection.surfaceList}
      densityList={selection.densityList}
      qualityList={selection.qualityList}
      vectorOnList={selection.vectorOnList}
      informationList={selection.informationList}
    />
  );
};

describe('pose table row props', () => {
  it('keeps unchanged row props stable while the parent receives updated global selection lists', () => {
    expect.hasAssertions();
    const store = legacy_createStore(combineReducers({ selectionReducers, apiReducers }));
    render(
      <Provider store={store}>
        <ThemeProvider theme={getTheme()}>
          <ConnectedTable />
        </ThemeProvider>
      </Provider>
    );
    mockRowRender.mockClear();
    act(() => {
      store.dispatch(appendFragmentDisplayList({ id: 900 }));
    });
    expect(mockRowRender).not.toHaveBeenCalled();
    act(() => {
      store.dispatch(appendFragmentDisplayList({ id: 1 }));
    });
    expect(mockRowRender).toHaveBeenCalledTimes(1);
    expect(mockRowRender).toHaveBeenCalledWith(100);
    expect(screen.getByTestId('row-100')).toHaveTextContent('true');
    expect(screen.getByTestId('row-200')).toHaveTextContent('false');
  });

  it('forwards transfers when navigation controls are configured', () => {
    expect.hasAssertions();
    const store = legacy_createStore(combineReducers({ selectionReducers, apiReducers }));
    const onTransfer = jest.fn();
    render(
      <Provider store={store}>
        <ThemeProvider theme={getTheme()}>
          <ObservationUnifiedViewWrapper
            viewConfig={viewConfig}
            items={items}
            allSelectedMolecules={empty}
            poseTransferConfig={{ controlsWidth: 0 }}
            onPoseTransfer={onTransfer}
          />
        </ThemeProvider>
      </Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Transfer 100' }));
    expect(onTransfer).toHaveBeenCalledWith(items[0]);
  });
});
