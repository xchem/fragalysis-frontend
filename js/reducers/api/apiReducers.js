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
  legacy_target_id_list: [],
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
  noTagsReceived: true,
  downloadTags: [],
  directDownloadInProgress: false,
  snapshotDownloadUrl: null,
  tagList: [],
  categoryList: [],
  target_data_loading_in_progress: false,
  all_data_loaded: false,
  isSnapshot: false,
  lhs_compounds_list: []
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
  open_discourse_error_modal: false,
  // direct_access_processed: false
  downloadTags: [],
  directDownloadInProgress: false,
  snapshotDownloadUrl: null,
  tagList: [],
  target_data_loading_in_progress: false,
  all_data_loaded: false,
  snapshotLoadingInProgress: false,
  lhs_compounds_list: []
};

export default function apiReducers(state = INITIAL_STATE, action = {}) {
  switch (action.type) {
    case constants.SET_OPEN_DISCOURSE_ERROR_MODAL:
      return Object.assign({}, state, { open_discourse_error_modal: action.payload });

    case constants.SET_TARGET_ID_LIST:
      return Object.assign({}, state, {
        target_id_list: action.target_id_list
      });

    case constants.SET_LEGACY_TARGET_ID_LIST:
      return { ...state, legacy_target_id_list: action.legacy_target_id_list };

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

    case constants.SET_TARGET_DATA_LOADING_IN_PROGRESS:
      return { ...state, target_data_loading_in_progress: action.targetDataLoadingInProgress };

    case constants.SET_ALL_DATA_LOADED:
      return { ...state, all_data_loaded: action.allDataLoaded };

    case constants.SET_MOLECULE_TAGS:
      return { ...state, moleculeTags: [...action.moleculeTags] };

    case constants.APPEND_MOLECULE_TAG:
      state.moleculeTags.push(action.moleculeTag);
      return { ...state };

    case constants.SET_SNAPSHOT_LOADING_IN_PROGRESS:
      return { ...state, snapshotLoadingInProgress: action.snapshotLoadingInProgress };

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
        return { ...state, all_mol_lists: [...newList] };
      } else {
        return state;
      }

    case constants.SET_LHS_COMPOUNDS_LIST:
      return { ...state, lhs_compounds_list: action.lhs_compounds_list };

    case constants.UPDATE_LHS_COMPOUND: {
      let newList = [...state.lhs_compounds_list];
      const indexOfCmp = newList.findIndex(c => c.id === action.cmp.id);
      if (indexOfCmp >= 0) {
        newList[indexOfCmp] = { ...action.cmp };
        return { ...state, lhs_compounds_list: [...newList] };
      } else {
        return state;
      }
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

    case constants.SET_IS_SNAPSHOT:
      return { ...state, isSnapshot: action.isSnapshot };

    case constants.SET_SESSION_ID:
      return Object.assign({}, state, {
        sessionId: action.sessionId
      });

    case constants.SET_DIRECT_ACCESS:
      return { ...state, direct_access: action.direct_access };

    case constants.SET_DIRECT_ACCESS_PROCESSED:
      return { ...state, direct_access_processed: action.direct_access_processed };

    case constants.SET_DOWNLOAD_TAGS:
      return { ...state, downloadTags: [...action.downloadTags] };

    case constants.APPEND_TO_DOWNLOAD_TAGS:
      if (!state.downloadTags.find(dt => action.tag.tag)) {
        return { ...state, downloadTags: [...state.downloadTags, action.tag] };
      } else {
        return state;
      }

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

    case constants.SET_DIRECT_DOWNLOAD_IN_PROGRESS:
      return { ...state, directDownloadInProgress: action.directDownloadInProgress };

    case constants.SET_SNAPSHOT_DOWNLOAD_URL:
      return { ...state, snapshotDownloadUrl: action.snapshotDownloadUrl };

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

    case constants.SET_TAG_LIST:
      let newTagList = new Set();
      action.tagList.forEach(f => {
        newTagList.add(f);
      });
      return Object.assign({}, state, { tagList: [...newTagList] });

    case constants.UPDATE_TAG:
      let listWithUpdatedTag = [...state.tagList];
      let foundTags = listWithUpdatedTag.filter(t => t.id === action.item.id);
      if (foundTags && foundTags.length > 0) {
        let foundTag = foundTags[0];
        foundTag.tag = action.item.tag;
        foundTag.colour = action.item.colour;
        foundTag.category = action.item.category;
        foundTag.discourse_url = action.item.discourse_url;

        return { ...state, tagList: [...listWithUpdatedTag] };
      } else {
        return state;
      }

    case constants.APPEND_TAG_LIST:
      return Object.assign({}, state, { tagList: [...new Set([...state.tagList, action.item])] });

    case constants.REMOVE_FROM_TAG_LIST:
      let diminishedTagList = new Set(state.tagList);
      diminishedTagList.delete(action.item);
      return Object.assign({}, state, { tagList: [...diminishedTagList] });

    case constants.SET_CATEGORY_LIST:
      let newCategoryList = new Set();
      action.categoryList.forEach(f => {
        newCategoryList.add(f);
      });
      return Object.assign({}, state, { categoryList: [...newCategoryList] });

    case constants.RESET_TARGET_STATE:
      return Object.assign({}, state, RESET_TARGET_STATE);
    // Cases like: @@redux/INIT
    default:
      return state;
  }
}
