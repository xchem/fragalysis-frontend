/**
 * Created by abradley on 06/03/2018.
 */
import apiReducers from '../reducers/api/apiReducers';
import * as types from '../reducers/actonTypes';

function getInitialState() {
  return {
    project_id: undefined,
    target_id: undefined,
    target_id_list: [],
    mol_group_list: [],
    molecule_list: [],
    cached_mol_lists: {},
    duck_yank_data: {},
    pandda_event_on: undefined,
    pandda_site_on: undefined,
    pandda_event_list: [],
    pandda_site_list: [],
    mol_group_on: undefined,
    mol_group_selection: [],
    target_on: undefined,
    target_on_name: undefined,
    group_id: undefined,
    isFetching: false,
    app_on: 'PREVIEW',
    group_type: 'MC',
    hotspot_on: undefined,
    hotspot_list: [],
    savingState: 'UNSET',
    seshListSaving: true,
    latestSession: undefined,
    latestSnapshot: undefined,
    sessionId: undefined,
    errorMessage: undefined,
    targetUnrecognised: undefined,
    uuid: 'UNSET',
    sessionIdList: [],
    sessionTitle: undefined,
    user_id: undefined
  };
}

describe('API Redcuer', () => {
  it('should return the initial state', () => {
    expect(apiReducers(undefined, {})).toEqual(getInitialState());
  });

  it('should handle LOAD_TARGETS', () => {
    expect(
      apiReducers(undefined, {
        type: types.LOAD_TARGETS,
        project_id: 1
      })
    ).toEqual({
      project_id: 1,
      target_id: undefined,
      target_id_list: [],
      mol_group_list: [],
      molecule_list: [],
      cached_mol_lists: {},
      duck_yank_data: {},
      pandda_event_on: undefined,
      pandda_site_on: undefined,
      pandda_event_list: [],
      pandda_site_list: [],
      mol_group_on: undefined,
      mol_group_selection: [],
      target_on: undefined,
      target_on_name: undefined,
      group_id: undefined,
      isFetching: false,
      app_on: 'PREVIEW',
      group_type: 'MC',
      hotspot_on: undefined,
      hotspot_list: [],
      savingState: 'UNSET',
      seshListSaving: true,
      latestSession: undefined,
      latestSnapshot: undefined,
      sessionId: undefined,
      errorMessage: undefined,
      targetUnrecognised: undefined,
      uuid: 'UNSET',
      sessionIdList: [],
      sessionTitle: undefined,
      user_id: undefined
    });
    expect(
      apiReducers(undefined, {
        type: types.LOAD_TARGETS
      })
    ).toEqual({
      project_id: undefined,
      target_id: undefined,
      target_id_list: [],
      mol_group_list: [],
      molecule_list: [],
      cached_mol_lists: {},
      duck_yank_data: {},
      pandda_event_on: undefined,
      pandda_site_on: undefined,
      pandda_event_list: [],
      pandda_site_list: [],
      mol_group_on: undefined,
      mol_group_selection: [],
      target_on: undefined,
      target_on_name: undefined,
      group_id: undefined,
      isFetching: false,
      app_on: 'PREVIEW',
      group_type: 'MC',
      hotspot_on: undefined,
      hotspot_list: [],
      savingState: 'UNSET',
      seshListSaving: true,
      latestSession: undefined,
      latestSnapshot: undefined,
      sessionId: undefined,
      errorMessage: undefined,
      targetUnrecognised: undefined,
      uuid: 'UNSET',
      sessionIdList: [],
      sessionTitle: undefined,
      user_id: undefined
    });
  });
  it('should handle LOAD_MOL_GROUPS', () => {
    expect(
      apiReducers(undefined, {
        type: types.LOAD_MOL_GROUPS,
        group_id: 1
      })
    ).toEqual({
      project_id: undefined,
      target_id: undefined,
      target_id_list: [],
      mol_group_list: [],
      molecule_list: [],
      cached_mol_lists: {},
      duck_yank_data: {},
      pandda_event_on: undefined,
      pandda_site_on: undefined,
      pandda_event_list: [],
      pandda_site_list: [],
      mol_group_on: undefined,
      mol_group_selection: [],
      target_on: undefined,
      target_on_name: undefined,
      group_id: 1,
      isFetching: false,
      app_on: 'PREVIEW',
      group_type: 'MC',
      hotspot_on: undefined,
      hotspot_list: [],
      savingState: 'UNSET',
      seshListSaving: true,
      latestSession: undefined,
      latestSnapshot: undefined,
      sessionId: undefined,
      errorMessage: undefined,
      targetUnrecognised: undefined,
      uuid: 'UNSET',
      sessionIdList: [],
      sessionTitle: undefined,
      user_id: undefined
    });
    expect(
      apiReducers(undefined, {
        type: types.LOAD_MOL_GROUPS,
        group_type: 'PC',
        group_id: 1
      })
    ).toEqual({
      project_id: undefined,
      target_id: undefined,
      target_id_list: [],
      mol_group_list: [],
      molecule_list: [],
      cached_mol_lists: {},
      duck_yank_data: {},
      pandda_event_on: undefined,
      pandda_site_on: undefined,
      pandda_event_list: [],
      pandda_site_list: [],
      mol_group_on: undefined,
      mol_group_selection: [],
      target_on: undefined,
      target_on_name: undefined,
      group_id: 1,
      isFetching: false,
      app_on: 'PREVIEW',
      group_type: 'PC',
      hotspot_on: undefined,
      hotspot_list: [],
      savingState: 'UNSET',
      seshListSaving: true,
      latestSession: undefined,
      latestSnapshot: undefined,
      sessionId: undefined,
      errorMessage: undefined,
      targetUnrecognised: undefined,
      uuid: 'UNSET',
      sessionIdList: [],
      sessionTitle: undefined,
      user_id: undefined
    });
  });
  it('should handle LOAD_MOLECULES', () => {
    expect(
      apiReducers(undefined, {
        type: types.LOAD_MOLECULES,
        target_id: 1,
        group_id: 1
      })
    ).toEqual({
      project_id: undefined,
      target_id: 1,
      group_id: 1,
      isFetching: false,
      group_type: 'MC',
      pandda_event_on: undefined,
      pandda_site_on: undefined,
      pandda_event_list: [],
      pandda_site_list: [],
      app_on: 'PREVIEW',
      target_id_list: [],
      mol_group_list: [],
      molecule_list: [],
      cached_mol_lists: {},
      duck_yank_data: {},
      mol_group_on: undefined,
      mol_group_selection: [],
      target_on: undefined,
      hotspot_list: [],
      hotspot_on: undefined,
      savingState: 'UNSET',
      seshListSaving: true,
      latestSession: undefined,
      latestSnapshot: undefined,
      sessionId: undefined,
      target_on_name: undefined,
      errorMessage: undefined,
      targetUnrecognised: undefined,
      uuid: 'UNSET',
      sessionIdList: [],
      sessionTitle: undefined,
      user_id: undefined
    });
    expect(
      apiReducers(undefined, {
        type: types.LOAD_MOLECULES,
        target_id: 1
      })
    ).toEqual({
      project_id: undefined,
      target_id: 1,
      target_id_list: [],
      mol_group_list: [],
      molecule_list: [],
      cached_mol_lists: {},
      duck_yank_data: {},
      pandda_event_on: undefined,
      pandda_site_on: undefined,
      pandda_event_list: [],
      pandda_site_list: [],
      mol_group_on: undefined,
      mol_group_selection: [],
      target_on: undefined,
      target_on_name: undefined,
      group_id: undefined,
      isFetching: false,
      app_on: 'PREVIEW',
      group_type: 'MC',
      hotspot_on: undefined,
      hotspot_list: [],
      savingState: 'UNSET',
      seshListSaving: true,
      latestSession: undefined,
      latestSnapshot: undefined,
      sessionId: undefined,
      errorMessage: undefined,
      targetUnrecognised: undefined,
      uuid: 'UNSET',
      sessionIdList: [],
      sessionTitle: undefined,
      user_id: undefined
    });
  });
});
