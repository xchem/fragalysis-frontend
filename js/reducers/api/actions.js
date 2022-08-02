/**
 * Created by abradley on 03/03/2018.
 */
import { constants } from './constants';

export const setOpenDiscourseErrorModal = open => {
  return { type: constants.SET_OPEN_DISCOURSE_ERROR_MODAL, payload: open };
};

export const setTargetIdList = function(input_json) {
  return {
    type: constants.SET_TARGET_ID_LIST,
    target_id_list: input_json
  };
};

export const setDuckYankData = function(input_json) {
  return {
    type: constants.SET_DUCK_YANK_DATA,
    duck_yank_data: input_json
  };
};

export const setTargetOn = function(target_id, skipTracking = false) {
  return {
    type: constants.SET_TARGET_ON,
    target_on: target_id,
    skipTracking: skipTracking
  };
};

export const setPanddaSiteList = function(pandda_site_list) {
  return {
    type: constants.SET_PANNDA_SITE_LIST,
    pandda_site_list: pandda_site_list
  };
};

export const setPanddaEventList = function(pandda_event_list) {
  return {
    type: constants.SET_PANNDA_EVENT_LIST,
    pandda_event_list: pandda_event_list
  };
};

export const setPanddaSiteOn = function(pandda_site_id) {
  return {
    type: constants.SET_PANNDA_SITE_ON,
    pandda_site_id: pandda_site_id
  };
};
export const setPanddaEventOn = function(pandda_event_id) {
  return {
    type: constants.SET_PANNDA_EVENT_ON,
    pandda_event_id: pandda_event_id
  };
};

export const setMolGroupOn = function(mol_group_id) {
  return {
    type: constants.SET_MOL_GROUP_ON,
    mol_group_on: mol_group_id
  };
};

export const setMolGroupOff = function(mol_group_id) {
  return {
    type: constants.SET_MOL_GROUP_OFF,
    mol_group_off: mol_group_id
  };
};

export const setMolGroupList = function(mol_group_list) {
  return {
    type: constants.SET_MOL_GROUP_LIST,
    mol_group_list: mol_group_list
  };
};

export const setMoleculeList = function(molecule_list) {
  return {
    type: constants.SET_MOLECULE_LIST,
    molecule_list: molecule_list
  };
};

export const setCachedMolLists = function(cached_mol_lists) {
  return {
    type: constants.SET_CACHED_MOL_LISTS,
    cached_mol_lists: cached_mol_lists
  };
};

export const setAllMolLists = all_mol_lists => {
  return {
    type: constants.SET_ALL_MOL_LISTS,
    all_mol_lists: all_mol_lists
  };
};

export const setMoleculeTags = moleculeTags => {
  return {
    type: constants.SET_MOLECULE_TAGS,
    moleculeTags: moleculeTags
  };
};

export const setNoTagsReceived = noTagsReceived => {
  return {
    type: constants.SET_NO_TAGS_RECEIVED,
    noTagsReceived: noTagsReceived
  };
};

export const setDownloadTags = downloadTags => {
  return {
    type: constants.SET_DOWNLOAD_TAGS,
    downloadTags: downloadTags
  };
};

export const appendToDownloadTags = tag => {
  return {
    type: constants.APPEND_TO_DOWNLOAD_TAGS,
    tag: tag
  };
};

export const appendMoleculeTag = moleculeTag => {
  return {
    type: constants.APPEND_MOLECULE_TAG,
    moleculeTag: moleculeTag
  };
};

export const updateMoleculeTag = tag => {
  return {
    type: constants.UPDATE_MOLECULE_TAG,
    tag: tag
  };
};

export const updateMoleculeInMolLists = mol => {
  return {
    type: constants.UPDATE_MOL_IN_ALL_MOL_LISTS,
    mol: mol
  };
};

export const setSavingState = function(savingState) {
  return {
    type: constants.SET_SAVING_STATE,
    savingState: savingState
  };
};

export const setSeshListSaving = function(seshListSaving) {
  return {
    type: constants.SET_SESH_LIST_SAVING,
    seshListSaving
  };
};

export const setLatestSnapshot = function(uuid) {
  return {
    type: constants.SET_LATEST_SNAPSHOT,
    latestSnapshot: uuid
  };
};

export const setLatestSession = function(uuid) {
  return {
    type: constants.SET_LATEST_SESSION,
    latestSession: uuid
  };
};

export const setSessionTitle = function(sessionTitle) {
  return {
    type: constants.SET_SESSION_TITLE,
    sessionTitle: sessionTitle
  };
};

export const setSessionId = function(id) {
  return {
    type: constants.SET_SESSION_ID,
    sessionId: id
  };
};

export const setSessionIdList = function(input_json) {
  return {
    type: constants.SET_SESSION_ID_LIST,
    sessionIdList: input_json
  };
};

export const updateSessionIdList = function(input_json) {
  return {
    type: constants.UPDATE_SESSION_ID_LIST,
    sessionIdList: input_json
  };
};

export const setTargetUnrecognised = function(bool) {
  return {
    type: constants.SET_TARGET_UNRECOGNISED,
    targetUnrecognised: bool
  };
};

export const setUuid = function(uuid) {
  return {
    type: constants.SET_UUID,
    uuid: uuid
  };
};

export const setDirectAccess = directAccessParams => {
  return {
    type: constants.SET_DIRECT_ACCESS,
    direct_access: directAccessParams
  };
};

export const setDirectAccessProcessed = directAccessProcessedParams => {
  return {
    type: constants.SET_DIRECT_ACCESS_PROCESSED,
    direct_access_processed: directAccessProcessedParams
  };
};

export const setDirectDownloadInProgress = directDownloadInProgress => {
  return {
    type: constants.SET_DIRECT_DOWNLOAD_IN_PROGRESS,
    directDownloadInProgress: directDownloadInProgress
  };
};

export const setSnapshotDownloadUrl = snapshotDownloadUrl => {
  return {
    type: constants.SET_SNAPSHOT_DOWNLOAD_URL,
    snapshotDownloadUrl: snapshotDownloadUrl
  };
};

export const reloadApiState = function(apiReducers) {
  const cachedMolList = apiReducers.cached_mol_lists;
  let fixedCachedMolList = {};
  if (cachedMolList) {
    Object.keys(cachedMolList).forEach(moleculeID => {
      const currentCachedMolecule = cachedMolList[moleculeID];
      if (currentCachedMolecule && Array.isArray(currentCachedMolecule)) {
        fixedCachedMolList[moleculeID] = currentCachedMolecule;
      } else if (
        currentCachedMolecule &&
        currentCachedMolecule.results &&
        Array.isArray(currentCachedMolecule.results)
      ) {
        fixedCachedMolList[moleculeID] = currentCachedMolecule.results;
      }
    });
  }

  return {
    type: constants.RELOAD_API_STATE,
    target_on_name: apiReducers.target_on_name,
    target_on: apiReducers.target_on,
    target_id: apiReducers.target_id,
    molecule_list: apiReducers.molecule_list,
    cached_mol_lists: fixedCachedMolList,
    mol_group_list: apiReducers.mol_group_list,
    mol_group_on: apiReducers.mol_group_on,
    hotspot_list: apiReducers.hotspot_list,
    hotspot_on: apiReducers.hotspot_on,
    app_on: apiReducers.app_on,
    sessionIdList: apiReducers.sessionIdList,
    latestSession: apiReducers.latestSession,
    project_id: apiReducers.project_id,
    group_id: apiReducers.group_id,
    group_type: apiReducers.group_type,
    pandda_event_on: apiReducers.pandda_event_on,
    pandda_site_on: apiReducers.pandda_site_on,
    pandda_event_list: apiReducers.pandda_event_list,
    pandda_site_list: apiReducers.pandda_site_list
  };
};

export const resetTargetState = () => ({ type: constants.RESET_TARGET_STATE });

export const updateTag = (item, skipTracking = false) => {
  return {
    type: constants.UPDATE_TAG,
    item: item,
    skipTracking
  };
};

export const setTagList = function(tagList, skipTracking = false) {
  return {
    type: constants.SET_TAG_LIST,
    tagList: tagList,
    skipTracking
  };
};

export const appendTagList = function(item, skipTracking = false) {
  return {
    type: constants.APPEND_TAG_LIST,
    item: item,
    skipTracking
  };
};

export const removeFromTagList = function(item, skipTracking = false) {
  return {
    type: constants.REMOVE_FROM_TAG_LIST,
    item: item,
    skipTracking
  };
};

export const setCategoryList = function(categoryList, skipTracking = false) {
  return {
    type: constants.SET_CATEGORY_LIST,
    categoryList: categoryList,
    skipTracking
  };
};
