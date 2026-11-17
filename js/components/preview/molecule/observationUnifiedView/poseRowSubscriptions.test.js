import React, { Profiler } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, legacy_createStore } from 'redux';
import { thunk } from 'redux-thunk';
import { Table, TableBody } from '@mui/material';
import { ThemeProvider } from '../../../../ui/styles';
import { getTheme } from '../../../../theme';
import { NglContext } from '../../../nglView/nglProvider';
import { selectionReducers } from '../../../../reducers/selection/selectionReducers';
import apiReducers from '../../../../reducers/api/apiReducers';
import nglReducers from '../../../../reducers/ngl/nglReducers';
import { previewReducers } from '../../redux';
import {
  appendFragmentDisplayList,
  removeFromFragmentDisplayList,
  setOpenObservationsDialog,
  setPoseIdForObservationsDialog
} from '../../../../reducers/selection/actions';
import ObservationUnifiedView from './observationUnifiedView';
import { COLUMN_TYPES } from './table';
import { removeLigand } from '../redux/dispatchActions';

jest.mock('../../../nglView/nglProvider', () => ({ NglContext: require('react').createContext() }));
jest.mock('../../../../utils/djangoContext', () => ({ DJANGO_CONTEXT: { username: 'NOT_LOGGED_IN', pk: null } }));
jest.mock('../../../tooltip/RichTooltip', () => ({ children }) => children);
jest.mock('../../../rdkit/RDKitContext', () => ({ useRDKit: () => ({ RDKitModule: null }) }));
jest.mock('../../../datasets/redux/selectors', () => ({ isAnyInspirationTurnedOn: () => false }));
jest.mock('../../compounds/redux/dispatchActions', () => ({ isCompoundFromVectorSelector: () => false }));
jest.mock('./table/views/ProteinButtonPopover', () => ({
  __esModule: true,
  default: () => null,
  DEFAULT_PROTEIN_SETTINGS: { protein: true, artefact: false }
}));
jest.mock('./table/views/DensityButtonPopover', () => ({ __esModule: true, default: () => null }));
jest.mock('../redux/dispatchActions', () => {
  const actions = Object.fromEntries(
    [
      'addVector',
      'removeVector',
      'addHitProtein',
      'removeHitProtein',
      'addArtefactChain',
      'removeArtefactChain',
      'addComplex',
      'removeComplex',
      'addSurface',
      'removeSurface',
      'addDensity',
      'removeDensity',
      'addLigand',
      'removeLigand',
      'addQuality',
      'removeQuality',
      'getDensityMapData',
      'getQualityInformation',
      'generateAndStoreMolImage'
    ].map(name => [name, jest.fn((...args) => ({ type: `test/${name}`, args }))])
  );
  return {
    ...actions,
    getCategoryById: () => () => null,
    withDisabledMoleculeNglControlButton: (id, type, callback) => async () => callback()
  };
});

const columns = [{ name: 'detail', type: COLUMN_TYPES.OBSERVATION, visible: true }];
const getColumnWidth = () => 300;
const observations = [
  [
    { id: 1, code: 'first', compound_code: 'one', tags_set: [] },
    { id: 2, code: 'second', tags_set: [] }
  ],
  [{ id: 3, code: 'third', compound_code: 'three', tags_set: [] }]
];
const data = observations.map((associatedObs, index) => ({
  id: index + 100,
  code: `pose-${index}`,
  main_site_observation: associatedObs[0].id,
  associatedObs
}));
const setup = () => {
  const store = legacy_createStore(
    combineReducers({ selectionReducers, apiReducers, nglReducers, previewReducers }),
    applyMiddleware(thunk)
  );
  const commits = [jest.fn(), jest.fn()];
  const anchors = jest.fn();
  const viewerContext = { getNglView: () => undefined };
  render(
    <Provider store={store}>
      <ThemeProvider theme={getTheme()}>
        <NglContext.Provider value={viewerContext}>
          <Table>
            <TableBody>
              {data.map((item, index) => (
                <Profiler key={item.id} id={String(item.id)} onRender={commits[index]}>
                  <ObservationUnifiedView
                    data={item}
                    observations={observations[index]}
                    index={index}
                    columns={columns}
                    getColumnWidth={getColumnWidth}
                    setRef={anchors}
                  />
                </Profiler>
              ))}
            </TableBody>
          </Table>
        </NglContext.Provider>
      </ThemeProvider>
    </Provider>
  );
  commits.forEach(commit => commit.mockClear());
  return { store, commits, anchors };
};

describe('pose row subscriptions', () => {
  it('keeps real row and detail controls idle through 930 unrelated ligand completions', () => {
    expect.hasAssertions();
    const { store, commits } = setup();
    for (let id = 10; id < 940; id++) {
      act(() => {
        store.dispatch(appendFragmentDisplayList({ id }));
      });
    }
    expect(commits[0]).not.toHaveBeenCalled();
    expect(commits[1]).not.toHaveBeenCalled();
    act(() => {
      store.dispatch(appendFragmentDisplayList({ id: 1 }));
    });
    expect(commits[0].mock.calls.length).toBeGreaterThan(0);
    expect(commits[1]).not.toHaveBeenCalled();
  });

  it('updates a multi-observation pose and removes its latest selected subset in observation order', () => {
    expect.hasAssertions();
    removeLigand.mockClear();
    const { store, commits } = setup();
    act(() => {
      store.dispatch(appendFragmentDisplayList({ id: 1 }));
    });
    commits[0].mockClear();
    act(() => {
      store.dispatch(appendFragmentDisplayList({ id: 2 }));
    });
    expect(commits[0].mock.calls.length).toBeGreaterThan(0);
    fireEvent.click(document.querySelector('#detail-view-sidechains-0'));
    expect(removeLigand.mock.calls.map(call => call[1].id)).toStrictEqual([1, 2]);
    expect(commits[1]).not.toHaveBeenCalled();
  });

  it('keeps open observation dialog ownership and closes/refreshed selections working', () => {
    expect.hasAssertions();
    const { store, anchors } = setup();
    act(() => {
      store.dispatch(setPoseIdForObservationsDialog(100));
      store.dispatch(setOpenObservationsDialog(true));
    });
    expect(store.getState().selectionReducers.observationsForLHSCmp).toStrictEqual(observations[0]);
    expect(anchors).toHaveBeenCalledWith(expect.any(HTMLTableRowElement));
    act(() => {
      store.dispatch(appendFragmentDisplayList({ id: 1 }));
    });
    expect(store.getState().selectionReducers.observationsForLHSCmp).toStrictEqual(observations[0]);
    act(() => {
      store.dispatch(removeFromFragmentDisplayList({ id: 1 }));
    });
    expect(store.getState().selectionReducers.poseIdForObservationsDialog).toBe(100);
    expect(screen.getByText('first')).toBeInTheDocument();
  });
});
