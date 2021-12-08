/**
 * Created by abradley on 06/03/2018.
 */
import { constants } from './constants';
import { savingStateConst } from '../../components/snapshot/constants';
import { tags } from '../../components/preview/tags/redux/tempData';

export const INITIAL_STATE = {
  project_id: undefined,
  target_id: undefined,
  target_id_list: [],
  mol_group_list: [],
  molecule_list: [],
  cached_mol_lists: {},
  all_mol_lists: [],
  allMolecules: [],
  moleculeTags: [],
  duck_yank_data: {},
  pandda_event_on: undefined,
  pandda_site_on: undefined,
  pandda_event_list: [],
  pandda_site_list: [],
  mol_group_on: undefined,
  target_on: undefined,
  target_on_name: undefined,
  group_id: undefined,
  isFetching: false,
  app_on: 'PREVIEW',
  group_type: 'MC',
  hotspot_on: undefined,
  hotspot_list: [],
  savingState: savingStateConst.UNSET,
  seshListSaving: false,
  latestSession: undefined,
  latestSnapshot: undefined,
  targetUnrecognised: undefined,
  uuid: savingStateConst.UNSET, // used only for reloading from scene
  sessionId: undefined,
  sessionIdList: [],
  sessionTitle: undefined,
  user_id: undefined,
  direct_access: {},
  direct_access_processed: false,
  open_discourse_error_modal: false,
  noTagsReceived: true
};

export const RESET_TARGET_STATE = {
  mol_group_list: [],
  molecule_list: [],
  cached_mol_lists: {},
  all_mol_lists: [],
  duck_yank_data: {},
  pandda_event_on: undefined,
  pandda_site_on: undefined,
  pandda_event_list: [],
  pandda_site_list: [],
  mol_group_on: undefined,
  target_on: undefined,
  target_on_name: undefined,
  group_id: undefined,
  isFetching: false,
  app_on: 'PREVIEW',
  group_type: 'MC',
  hotspot_on: undefined,
  hotspot_list: [],
  savingState: savingStateConst.UNSET,
  seshListSaving: false,
  latestSession: undefined,
  latestSnapshot: undefined,
  targetUnrecognised: undefined,
  uuid: savingStateConst.UNSET,
  sessionId: undefined,
  sessionIdList: [],
  sessionTitle: undefined,
  user_id: undefined,
  direct_access: {},
  open_discourse_error_modal: false
  // direct_access_processed: false
};

export default function apiReducers(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case constants.SET_OPEN_DISCOURSE_ERROR_MODAL:
      return Object.assign({}, state, { open_discourse_error_modal: action.payload });

    case constants.SET_TARGET_ID_LIST:
      return Object.assign({}, state, {
        target_id_list: action.target_id_list
      });

    case constants.SET_TARGET_ON:
      var target_on_name = undefined;
      for (var ind in state.target_id_list) {
        if (state.target_id_list[ind].id === action.target_on) {
          target_on_name = state.target_id_list[ind].title;
        }
      }
      return Object.assign({}, state, {
        target_on_name: target_on_name,
        target_on: action.target_on
      });

    case constants.SET_MOL_GROUP_LIST:
      return Object.assign({}, state, {
        mol_group_list: action.mol_group_list
      });

    case constants.SET_MOL_GROUP_ON:
      return Object.assign({}, state, {
        mol_group_on: action.mol_group_on
      });

    case constants.SET_MOLECULE_LIST:
      return Object.assign({}, state, {
        molecule_list: action.molecule_list
      });

    case constants.SET_CACHED_MOL_LISTS:
      return Object.assign({}, state, {
        cached_mol_lists: action.cached_mol_lists
      });

    case constants.SET_MOLECULE_TAGS:
      return { ...state, moleculeTags: [...action.moleculeTags] };

    case constants.APPEND_MOLECULE_TAG:
      state.moleculeTags.push(action.moleculeTag);
      return { ...state };

    case constants.UPDATE_MOLECULE_TAG:
      let newMolTagsList = [...state.moleculeTags];
      const indexOfTag = newMolTagsList.findIndex(t => t.id === action.tag.id);
      if (indexOfTag >= 0) {
        newMolTagsList[indexOfTag] = { ...action.tag };
        return { ...state, moleculeTags: newMolTagsList };
      } else {
        return state;
      }

    case constants.SET_ALL_MOL_LISTS:
      return { ...state, all_mol_lists: action.all_mol_lists };

    case constants.UPDATE_MOL_IN_ALL_MOL_LISTS:
      let newList = [...state.all_mol_lists];
      const indexOfMol = newList.findIndex(m => m.id === action.mol.id);
      if (indexOfMol >= 0) {
        newList[indexOfMol] = { ...action.mol };
        return { ...state, all_mol_lists: newList };
      } else {
        return state;
      }

    case constants.SET_PANNDA_EVENT_LIST:
      return Object.assign({}, state, {
        pandda_event_list: action.pandda_event_list
      });

    case constants.SET_PANNDA_SITE_LIST:
      return Object.assign({}, state, {
        pandda_site_list: action.pandda_site_list
      });

    case constants.SET_PANNDA_EVENT_ON:
      return Object.assign({}, state, {
        pandda_event_on: action.pandda_event_id
      });

    case constants.SET_PANNDA_SITE_ON:
      return Object.assign({}, state, {
        pandda_site_on: action.pandda_site_id
      });

    case constants.SET_DUCK_YANK_DATA:
      return Object.assign({}, state, {
        duck_yank_data: action.duck_yank_data
      });

    case constants.SET_SAVING_STATE:
      return Object.assign({}, state, {
        savingState: action.savingState
      });

    case constants.SET_SESH_LIST_SAVING:
      return Object.assign({}, state, {
        seshListSaving: action.seshListSaving
      });

    case constants.SET_LATEST_SNAPSHOT:
      return Object.assign({}, state, {
        latestSnapshot: action.latestSnapshot
      });

    case constants.SET_LATEST_SESSION:
      return Object.assign({}, state, {
        latestSession: action.latestSession
      });

    case constants.SET_NO_TAGS_RECEIVED:
      return { ...state, noTagsReceived: action.noTagsReceived };

    case constants.SET_SESSION_TITLE:
      return Object.assign({}, state, {
        sessionTitle: action.sessionTitle
      });

    case constants.SET_SESSION_ID:
      return Object.assign({}, state, {
        sessionId: action.sessionId
      });

    case constants.SET_DIRECT_ACCESS:
      return { ...state, direct_access: action.direct_access };

    case constants.SET_DIRECT_ACCESS_PROCESSED:
      return { ...state, direct_access_processed: action.direct_access_processed };

    case constants.SET_SESSION_ID_LIST:
      let sessionSummaryNew = [];
      for (var key in action.sessionIdList) {
        sessionSummaryNew.push({
          id: action.sessionIdList[key].id,
          uuid: action.sessionIdList[key].uuid,
          title: action.sessionIdList[key].title,
          created: action.sessionIdList[key].created,
          modified: action.sessionIdList[key].modified,
          user_id: action.sessionIdList[key].user_id,
          target_on_name: JSON.parse(JSON.parse(JSON.parse(action.sessionIdList[key].scene)).state).apiReducers
            .target_on_name
        });
      }
      return Object.assign({}, state, {
        sessionIdList: sessionSummaryNew
      });

    case constants.UPDATE_SESSION_ID_LIST:
      let sessionSummary = [];
      for (var key in action.sessionIdList) {
        sessionSummary.push({
          id: action.sessionIdList[key].id,
          uuid: action.sessionIdList[key].uuid,
          title: action.sessionIdList[key].title,
          created: action.sessionIdList[key].created,
          modified: action.sessionIdList[key].modified,
          user_id: action.sessionIdList[key].user_id,
          target_on_name: action.sessionIdList[key].target_on_name
        });
      }
      return Object.assign({}, state, {
        sessionIdList: sessionSummary
      });

    case constants.SET_TARGET_UNRECOGNISED:
      return Object.assign({}, state, {
        targetUnrecognised: action.targetUnrecognised
      });

    case constants.SET_UUID:
      return Object.assign({}, state, {
        uuid: action.uuid
      });

    case constants.RELOAD_API_STATE:
      return Object.assign({}, state, {
        project_id: action.project_id,
        target_on_name: action.target_on_name,
        target_on: action.target_on,
        target_id: action.target_id,
        group_id: action.group_id,
        group_type: action.group_type,
        molecule_list: action.molecule_list,
        cached_mol_lists: action.cached_mol_lists,
        mol_group_list: action.mol_group_list,
        mol_group_on: action.mol_group_on,
        hotspot_list: action.hotspot_list,
        hotspot_on: action.hotspot_on,
        app_on: action.app_on,
        sessionIdList: action.sessionIdList,
        pandda_event_on: action.pandda_event_on,
        pandda_site_on: action.pandda_site_on,
        pandda_event_list: action.pandda_event_list,
        pandda_site_list: action.pandda_site_list,
        latestSession: action.latestSession,
        direct_access: action.direct_access
        // direct_access_processed: action.direct_access_processed
      });

    case constants.RESET_TARGET_STATE:
      return Object.assign({}, state, RESET_TARGET_STATE);
    // Cases like: @@redux/INIT
    default:
      return state;
  }
}
