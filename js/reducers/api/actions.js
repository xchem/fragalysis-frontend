/**
 * Created by abradley on 03/03/2018.
 */
import { constants } from './constants';

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

export const setMolGroupOff = function(mol_group_id, selectionGroups) {
  return {
    type: constants.SET_MOL_GROUP_OFF,
    mol_group_off: mol_group_id,
    selectionGroups
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

export const setAllMolecules = molecules => {
  return {
    type: constants.SET_ALL_MOLECULES,
    allMolecules: molecules
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
