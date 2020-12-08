import {
  setCurrentActionsList,
  setIsTrackingMoleculesRestoring,
  setIsTrackingCompoundsRestoring,
  setIsUndoRedoAction
} from './actions';
import { createInitAction } from './trackingActions';
import { actionType, actionObjectType } from './constants';
import { VIEWS } from '../../../js/constants/constants';
import { setCurrentVector, appendToBuyList, removeFromToBuyList, setHideAll } from '../selection/actions';
import {
  resetReducersForRestoringActions,
  shouldLoadProtein,
  loadProteinOfRestoringActions
} from '../../components/preview/redux/dispatchActions';
import { setCurrentProject } from '../../components/projects/redux/actions';
import {
  selectMoleculeGroup,
  onDeselectMoleculeGroup,
  loadMoleculeGroupsOfTarget
} from '../../components/preview/moleculeGroups/redux/dispatchActions';
import { loadTargetList } from '../../components/target/redux/dispatchActions';
import { resetTargetState, setTargetOn } from '../api/actions';
import {
  addComplex,
  addLigand,
  addHitProtein,
  addSurface,
  addVector,
  removeComplex,
  removeLigand,
  removeHitProtein,
  removeSurface,
  removeVector
} from '../../components/preview/molecule/redux/dispatchActions';
import { colourList } from '../../components/preview/molecule/moleculeView';
import {
  addDatasetComplex,
  addDatasetLigand,
  addDatasetHitProtein,
  addDatasetSurface,
  removeDatasetComplex,
  removeDatasetLigand,
  removeDatasetHitProtein,
  removeDatasetSurface,
  loadDataSets,
  loadDatasetCompoundsWithScores
} from '../../components/datasets/redux/dispatchActions';
import {
  appendMoleculeToCompoundsOfDatasetToBuy,
  removeMoleculeFromCompoundsOfDatasetToBuy,
  setMoleculeListIsLoading
} from '../../components/datasets/redux/actions';
import { setAllMolLists } from '../api/actions';
import { getUrl, loadAllMolsFromMolGroup } from '../../../js/utils/genericList';
import {
  removeComponentRepresentation,
  addComponentRepresentation,
  updateComponentRepresentation
} from '../../../js/reducers/ngl/actions';
import * as listType from '../../constants/listTypes';
import { assignRepresentationToComp } from '../../components/nglView/generatingObjects';
import { deleteObject, setOrientation } from '../../../js/reducers/ngl/dispatchActions';
import { setSendActionsList, setIsActionsSending, setIsActionsLoading, setActionsList } from './actions';
import { api, METHOD } from '../../../js/utils/api';
import { base_url } from '../../components/routes/constants';
import { CONSTANTS } from '../../../js/constants/constants';
import moment from 'moment';
import {
  appendToActionList,
  appendToSendActionList,
  setProjectActionList,
  setIsActionsSaving,
  setIsActionsRestoring,
  appendToUndoRedoActionList,
  resetTrackingState
} from './actions';
import {
  setSelectedAll,
  setDeselectedAll,
  setSelectedAllByType,
  setDeselectedAllByType
} from '../../../js/reducers/selection/actions';
import {
  setSelectedAll as setSelectedAllOfDataset,
  setDeselectedAll as setDeselectedAllOfDataset,
  setSelectedAllByType as setSelectedAllByTypeOfDataset,
  setDeselectedAllByType as setDeselectedAllByTypeOfDataset
} from '../../components/datasets/redux/actions';

export const saveCurrentActionsList = (snapshotID, projectID, nglViewList) => async (dispatch, getState) => {
  let actionList = await dispatch(getTrackingActions(projectID));
  dispatch(saveActionsList(snapshotID, actionList, nglViewList));
};

export const saveActionsList = (snapshotID, actionList, nglViewList) => (dispatch, getState) => {
  const state = getState();

  const currentTargetOn = state.apiReducers.target_on;
  const currentSites = state.selectionReducers.mol_group_selection;
  const currentLigands = state.selectionReducers.fragmentDisplayList;
  const currentProteins = state.selectionReducers.proteinList;
  const currentComplexes = state.selectionReducers.complexList;
  const currentSurfaces = state.selectionReducers.surfaceList;
  const currentVectors = state.selectionReducers.vectorOnList;
  const currentBuyList = state.selectionReducers.to_buy_list;
  const currentVector = state.selectionReducers.currentVector;
  const currentSelectionAll = state.selectionReducers.moleculeAllSelection;

  const currentDatasetLigands = state.datasetsReducers.ligandLists;
  const currentDatasetProteins = state.datasetsReducers.proteinLists;
  const currentDatasetComplexes = state.datasetsReducers.complexLists;
  const currentDatasetSurfaces = state.datasetsReducers.surfaceLists;
  const currentDatasetSelectionAll = state.datasetsReducers.moleculeAllSelection;

  const currentDatasetBuyList = state.datasetsReducers.compoundsToBuyDatasetMap;
  const currentobjectsInView = state.nglReducers.objectsInView;

  const currentTargets = (currentTargetOn && [currentTargetOn]) || [];
  const currentVectorSmiles = (currentVector && [currentVector]) || [];

  let orderedActionList = actionList.reverse((a, b) => a.timestamp - b.timestamp);

  let currentActions = [];

  getCurrentActionList(orderedActionList, actionType.TARGET_LOADED, getCollection(currentTargets), currentActions);
  getCurrentActionList(orderedActionList, actionType.SITE_TURNED_ON, getCollection(currentSites), currentActions);
  getCurrentActionList(orderedActionList, actionType.LIGAND_TURNED_ON, getCollection(currentLigands), currentActions);

  getCurrentActionListOfAllSelection(
    orderedActionList,
    actionType.ALL_TURNED_ON,
    getCollection(currentSelectionAll),
    currentActions,
    getCollection(currentLigands),
    getCollection(currentProteins),
    getCollection(currentComplexes)
  );

  getCurrentActionListOfAllSelectionByType(
    orderedActionList,
    actionType.ALL_TURNED_ON_BY_TYPE,
    'ligand',
    getCollection(currentLigands),
    currentActions
  );

  getCurrentActionListOfAllSelectionByType(
    orderedActionList,
    actionType.ALL_TURNED_ON_BY_TYPE,
    'protein',
    getCollection(currentProteins),
    currentActions
  );

  getCurrentActionListOfAllSelectionByType(
    orderedActionList,
    actionType.ALL_TURNED_ON_BY_TYPE,
    'complex',
    getCollection(currentComplexes),
    currentActions
  );

  getCurrentActionListOfAllSelectionByTypeOfDataset(
    orderedActionList,
    actionType.ALL_TURNED_ON_BY_TYPE,
    'ligand',
    getCollectionOfDataset(currentDatasetLigands),
    currentActions
  );

  getCurrentActionListOfAllSelectionByTypeOfDataset(
    orderedActionList,
    actionType.ALL_TURNED_ON_BY_TYPE,
    'protein',
    getCollectionOfDataset(currentDatasetProteins),
    currentActions
  );

  getCurrentActionListOfAllSelectionByTypeOfDataset(
    orderedActionList,
    actionType.ALL_TURNED_ON_BY_TYPE,
    'complex',
    getCollectionOfDataset(currentDatasetComplexes),
    currentActions
  );

  getCurrentActionListOfAllSelection(
    orderedActionList,
    actionType.ALL_TURNED_ON,
    getCollectionOfDataset(currentDatasetSelectionAll),
    currentActions,
    getCollectionOfDataset(currentDatasetLigands),
    getCollectionOfDataset(currentDatasetProteins),
    getCollectionOfDataset(currentDatasetComplexes)
  );

  getCurrentActionList(
    orderedActionList,
    actionType.SIDECHAINS_TURNED_ON,
    getCollection(currentProteins),
    currentActions
  );

  getCurrentActionList(
    orderedActionList,
    actionType.INTERACTIONS_TURNED_ON,
    getCollection(currentComplexes),
    currentActions
  );
  getCurrentActionList(orderedActionList, actionType.SURFACE_TURNED_ON, getCollection(currentSurfaces), currentActions);
  getCurrentActionList(orderedActionList, actionType.VECTORS_TURNED_ON, getCollection(currentVectors), currentActions);
  getCurrentActionList(
    orderedActionList,
    actionType.VECTOR_SELECTED,
    getCollection(currentVectorSmiles),
    currentActions
  );

  getCurrentActionList(
    orderedActionList,
    actionType.MOLECULE_ADDED_TO_SHOPPING_CART,
    getCollectionOfShoppingCart(currentBuyList),
    currentActions
  );

  getCurrentActionList(
    orderedActionList,
    actionType.LIGAND_TURNED_ON,
    getCollectionOfDataset(currentDatasetLigands),
    currentActions
  );

  getCurrentActionList(
    orderedActionList,
    actionType.SIDECHAINS_TURNED_ON,
    getCollectionOfDataset(currentDatasetProteins),
    currentActions
  );

  getCurrentActionList(
    orderedActionList,
    actionType.INTERACTIONS_TURNED_ON,
    getCollectionOfDataset(currentDatasetComplexes),
    currentActions
  );

  getCurrentActionList(
    orderedActionList,
    actionType.SURFACE_TURNED_ON,
    getCollectionOfDataset(currentDatasetSurfaces),
    currentActions
  );

  getCurrentActionList(
    orderedActionList,
    actionType.COMPOUND_SELECTED,
    getCollectionOfDataset(currentDatasetBuyList),
    currentActions
  );

  getCurrentActionList(
    orderedActionList,
    actionType.REPRESENTATION_ADDED,
    getCollectionOfDatasetOfRepresentation(currentobjectsInView),
    currentActions
  );

  getCurrentActionList(
    orderedActionList,
    actionType.REPRESENTATION_CHANGED,
    getCollectionOfDatasetOfRepresentation(currentobjectsInView),
    currentActions
  );

  if (nglViewList) {
    let nglStateList = nglViewList.map(nglView => {
      return { id: nglView.id, orientation: nglView.stage.viewerControls.getOrientation() };
    });

    let trackAction = {
      type: actionType.NGL_STATE,
      timestamp: Date.now(),
      nglStateList: nglStateList
    };

    currentActions.push(Object.assign({ ...trackAction }));
  }

  dispatch(setCurrentActionsList(currentActions));
  dispatch(saveTrackingActions(currentActions, snapshotID));
};

export const saveTrackingActions = (currentActions, snapshotID) => (dispatch, getState) => {
  const state = getState();
  const project = state.projectReducers.currentProject;
  const projectID = project && project.projectID;

  if (snapshotID) {
    dispatch(setIsActionsSaving(true));

    const dataToSend = {
      session_project: projectID,
      author: project.authorID,
      snapshot: snapshotID,
      last_update_date: moment().format(),
      actions: JSON.stringify(currentActions)
    };
    return api({
      url: `${base_url}/api/snapshot-actions/`,
      method: METHOD.POST,
      data: JSON.stringify(dataToSend)
    })
      .then(response => {
        dispatch(setCurrentActionsList([]));
      })
      .catch(error => {
        throw new Error(error);
      })
      .finally(() => {
        dispatch(setIsActionsSaving(false));
      });
  } else {
    return Promise.resolve();
  }
};

const getCurrentActionList = (orderedActionList, type, collection, currentActions) => {
  let actionList = orderedActionList.filter(action => action.type === type);

  if (collection) {
    collection.forEach(data => {
      let action = actionList.find(action => action.object_id === data.id && action.dataset_id === data.datasetId);

      if (action) {
        currentActions.push(Object.assign({ ...action }));
      }
    });
  }
};

const getCurrentActionListOfAllSelection = (
  orderedActionList,
  type,
  collection,
  currentActions,
  ligandList,
  proteinList,
  complexList
) => {
  let actionList = orderedActionList.filter(action => action.type === type);

  if (collection) {
    collection.forEach(data => {
      let action = actionList.find(action => action.object_id === data.id && action.dataset_id === data.datasetId);

      if (action) {
        let ligandAction = ligandList.find(
          data => data.id === action.object_id && action.dataset_id === data.datasetId
        );
        let proteinAction = proteinList.find(
          data => data.id === action.object_id && action.dataset_id === data.datasetId
        );
        let complexAction = complexList.find(
          data => data.id === action.object_id && action.dataset_id === data.datasetId
        );

        let isLigand = ligandAction && ligandAction != null ? true : false;
        let isProtein = proteinAction && proteinAction != null ? true : false;
        let isComplex = complexAction && complexAction != null ? true : false;
        currentActions.push(
          Object.assign({ ...action, isLigand: isLigand, isProtein: isProtein, isComplex: isComplex })
        );
      }
    });
  }
};

const getCurrentActionListOfAllSelectionByType = (orderedActionList, type, controlType, collection, currentActions) => {
  let action = orderedActionList.find(
    action =>
      action.type === type &&
      action.control_type === controlType &&
      (action.object_type === actionObjectType.MOLECULE || action.object_type === actionObjectType.INSPIRATION)
  );
  if (action && collection) {
    let actionItems = action.items;
    let items = [];
    collection.forEach(data => {
      let item = actionItems.find(action => action.id === data.id && action.dataset_id === data.datasetId);
      if (item) {
        items.push(item);
      }
    });

    currentActions.push(Object.assign({ ...action, items: items }));
  }
};

const getCurrentActionListOfAllSelectionByTypeOfDataset = (
  orderedActionList,
  type,
  controlType,
  collection,
  currentActions
) => {
  let action = orderedActionList.find(
    action =>
      action.type === type &&
      action.control_type === controlType &&
      (action.object_type === actionObjectType.COMPOUND || action.object_type === actionObjectType.CROSS_REFERENCE)
  );
  if (action && collection) {
    let actionItems = action.items;
    let items = [];
    collection.forEach(data => {
      let item = actionItems.find(item => item.molecule.id === data.id && item.datasetID === data.datasetId);
      if (item) {
        items.push(item);
      }
    });

    currentActions.push(Object.assign({ ...action, items: items }));
  }
};

const getCollection = dataList => {
  let list = [];
  if (dataList) {
    var result = dataList.map(value => ({ id: value }));
    list.push(...result);
  }
  return list;
};

const getCollectionOfDataset = dataList => {
  let list = [];
  if (dataList) {
    for (const datasetId in dataList) {
      let values = dataList[datasetId];
      if (values) {
        var result = values.map(value => ({ id: value, datasetId: datasetId }));
        list.push(...result);
      }
    }
  }
  return list;
};

const getCollectionOfShoppingCart = dataList => {
  let list = [];
  if (dataList) {
    dataList.forEach(data => {
      let value = data.vector;
      if (value) {
        list.push({ id: value });
      }
    });
  }
  return list;
};

const getCollectionOfDatasetOfRepresentation = dataList => {
  let list = [];
  for (const view in dataList) {
    let objectView = dataList[view];
    if (objectView && objectView !== null && objectView.display_div === VIEWS.MAJOR_VIEW) {
      let value = dataList[view].name;
      if (value) {
        list.push({ id: value });
      }
    }
  }
  return list;
};

export const resetRestoringState = () => (dispatch, getState) => {
  dispatch(setActionsList([]));
  dispatch(setProjectActionList([]));
  dispatch(setSendActionsList([]));

  dispatch(setTargetOn(undefined));
  dispatch(setIsActionsRestoring(false, false));
};

export const restoreCurrentActionsList = snapshotID => async (dispatch, getState) => {
  dispatch(resetTrackingState());
  dispatch(setIsActionsRestoring(true, false));

  await dispatch(restoreTrackingActions(snapshotID));
  dispatch(setIsTrackingMoleculesRestoring(true));
  dispatch(setIsTrackingCompoundsRestoring(true));
  dispatch(resetTargetState());
  dispatch(resetReducersForRestoringActions());
  dispatch(restoreStateBySavedActionList());
};

const restoreTrackingActions = snapshotID => async (dispatch, getState) => {
  if (snapshotID) {
    try {
      const response = await api({
        url: `${base_url}/api/snapshot-actions/?snapshot=${snapshotID}`
      });
      let results = response.data.results;
      let listToSet = [];
      results.forEach(r => {
        let resultActions = JSON.parse(r.actions);
        listToSet.push(...resultActions);
      });

      let snapshotActions = [...listToSet];
      dispatch(setCurrentActionsList(snapshotActions));
    } catch (error) {
      throw new Error(error);
    }
  } else {
    return Promise.resolve();
  }
};

const restoreStateBySavedActionList = () => (dispatch, getState) => {
  const state = getState();

  const currentActionList = state.trackingReducers.current_actions_list;
  const orderedActionList = currentActionList.sort((a, b) => a.timestamp - b.timestamp);

  let onCancel = () => {};
  dispatch(loadTargetList(onCancel))
    .then(() => dispatch(restoreTargetActions(orderedActionList)))
    .catch(error => {
      throw new Error(error);
    });
  return () => {
    onCancel();
  };
};

const restoreTargetActions = orderedActionList => (dispatch, getState) => {
  const state = getState();

  let targetAction = orderedActionList.find(action => action.type === actionType.TARGET_LOADED);
  if (targetAction) {
    let target = getTarget(targetAction.object_name, state);
    if (target) {
      dispatch(setTargetOn(target.id));
    }
  }
};

export const restoreAfterTargetActions = (stages, projectId) => async (dispatch, getState) => {
  const state = getState();

  const currentActionList = state.trackingReducers.current_actions_list;
  const orderedActionList = currentActionList.sort((a, b) => a.timestamp - b.timestamp);
  const targetId = state.apiReducers.target_on;

  if (targetId && stages && stages.length > 0) {
    const majorView = stages.find(view => view.id === VIEWS.MAJOR_VIEW);
    const summaryView = stages.find(view => view.id === VIEWS.SUMMARY_VIEW);

    await dispatch(loadProteinOfRestoringActions({ nglViewList: stages }));

    await dispatch(
      loadMoleculeGroupsOfTarget({
        summaryView: summaryView.stage,
        isStateLoaded: false,
        setOldUrl: url => {},
        target_on: targetId
      })
    )
      .catch(error => {
        throw error;
      })
      .finally(() => {});

    await dispatch(restoreSitesActions(orderedActionList, summaryView));
    await dispatch(loadData(orderedActionList, targetId, majorView));
    await dispatch(restoreActions(orderedActionList, majorView.stage));
    await dispatch(restoreRepresentationActions(orderedActionList, stages));
    await dispatch(restoreProject(projectId));
    await dispatch(restoreNglStateAction(orderedActionList, stages));
    dispatch(setIsActionsRestoring(false, true));
  }
};

const restoreNglStateAction = (orderedActionList, stages) => (dispatch, getState) => {
  let action = orderedActionList.find(action => action.type === actionType.NGL_STATE);
  if (action && action.nglStateList) {
    action.nglStateList.forEach(nglView => {
      dispatch(setOrientation(nglView.id, nglView.orientation));
      let viewStage = stages.find(s => s.id === nglView.id);
      if (viewStage) {
        viewStage.stage.viewerControls.orient(nglView.orientation.elements);
      }
    });
  }
};

const restoreActions = (orderedActionList, stage) => (dispatch, getState) => {
  dispatch(restoreMoleculesActions(orderedActionList, stage));
};

const loadData = (orderedActionList, targetId, majorView) => async (dispatch, getState) => {
  await dispatch(loadAllMolecules(orderedActionList, targetId, majorView.stage));
  await dispatch(loadAllDatasets(orderedActionList, targetId, majorView.stage));
};

const loadAllDatasets = (orderedActionList, target_on, stage) => async (dispatch, getState) => {
  dispatch(setMoleculeListIsLoading(true));

  await dispatch(loadDataSets(target_on));
  await dispatch(loadDatasetCompoundsWithScores());
  dispatch(setMoleculeListIsLoading(false));

  dispatch(restoreCompoundsActions(orderedActionList, stage));
};

const loadAllMolecules = (orderedActionList, target_on, stage) => async (dispatch, getState) => {
  const state = getState();
  const list_type = listType.MOLECULE;

  let molGroupList = state.apiReducers.mol_group_list;

  let promises = [];
  molGroupList.forEach(molGroup => {
    let id = molGroup.id;
    let url = getUrl({ list_type, target_on, mol_group_on: id });
    promises.push(
      loadAllMolsFromMolGroup({
        url,
        mol_group: id
      })
    );
  });
  try {
    const results = await Promise.all(promises);
    let listToSet = {};
    results.forEach(molResult => {
      listToSet[molResult.mol_group] = molResult.molecules;
    });
    dispatch(setAllMolLists(listToSet));
  } catch (error) {
    throw new Error(error);
  }
};

const restoreSitesActions = (orderedActionList, summaryView) => (dispatch, getState) => {
  const state = getState();

  let sitesAction = orderedActionList.filter(action => action.type === actionType.SITE_TURNED_ON);
  if (sitesAction) {
    sitesAction.forEach(action => {
      let molGroup = getMolGroup(action.object_name, state);
      if (molGroup) {
        dispatch(selectMoleculeGroup(molGroup, summaryView.stage));
      }
    });
  }
};

const restoreMoleculesActions = (orderedActionList, stage) => (dispatch, getState) => {
  const state = getState();
  let moleculesAction = orderedActionList.filter(
    action => action.object_type === actionObjectType.MOLECULE || action.object_type === actionObjectType.INSPIRATION
  );

  if (moleculesAction) {
    dispatch(addNewType(moleculesAction, actionType.LIGAND_TURNED_ON, 'ligand', stage, state));
    dispatch(addNewType(moleculesAction, actionType.SIDECHAINS_TURNED_ON, 'protein', stage, state));
    dispatch(addNewType(moleculesAction, actionType.INTERACTIONS_TURNED_ON, 'complex', stage, state));
    dispatch(addNewType(moleculesAction, actionType.SURFACE_TURNED_ON, 'surface', stage, state));
    dispatch(addNewType(moleculesAction, actionType.VECTORS_TURNED_ON, 'vector', stage, state));
  }

  let vectorAction = orderedActionList.find(action => action.type === actionType.VECTOR_SELECTED);
  if (vectorAction) {
    dispatch(setCurrentVector(vectorAction.object_name));
  }

  dispatch(restoreCartActions(moleculesAction));
  dispatch(restoreAllSelectionActions(orderedActionList, stage, true));
  dispatch(restoreAllSelectionByTypeActions(orderedActionList, stage, true));
  dispatch(setIsTrackingMoleculesRestoring(false));
};

const restoreCartActions = moleculesAction => (dispatch, getState) => {
  let shoppingCartActions = moleculesAction.filter(
    action => action.type === actionType.MOLECULE_ADDED_TO_SHOPPING_CART
  );
  if (shoppingCartActions) {
    shoppingCartActions.forEach(action => {
      let data = action.item;
      if (data) {
        dispatch(appendToBuyList(data));
      }
    });
  }
};

const restoreAllSelectionActions = (moleculesAction, stage, isSelection) => (dispatch, getState) => {
  let state = getState();

  let actions =
    isSelection === true
      ? moleculesAction.filter(
          action =>
            action.type === actionType.ALL_TURNED_ON &&
            (action.object_type === actionObjectType.INSPIRATION || action.object_type === actionObjectType.MOLECULE)
        )
      : moleculesAction.filter(
          action =>
            action.type === actionType.ALL_TURNED_ON &&
            (action.object_type === actionObjectType.CROSS_REFERENCE ||
              action.object_type === actionObjectType.COMPOUND)
        );

  if (actions) {
    actions.forEach(action => {
      if (action) {
        if (isSelection) {
          dispatch(setSelectedAll(action.item, action.isLigand, action.isProtein, action.isComplex));
        } else {
          dispatch(
            setSelectedAllOfDataset(action.dataset_id, action.item, action.isLigand, action.isProtein, action.isComplex)
          );
        }

        if (action.isLigand) {
          dispatch(handleMoleculeAction(action, 'ligand', true, stage, state, true));
        }

        if (action.isProtein) {
          dispatch(handleMoleculeAction(action, 'protein', true, stage, state, true));
        }

        if (action.isComplex) {
          dispatch(handleMoleculeAction(action, 'complex', true, stage, state, true));
        }
      }
    });
  }
};

const restoreAllSelectionByTypeActions = (moleculesAction, stage, isSelection) => (dispatch, getState) => {
  let state = getState();

  let actions =
    isSelection === true
      ? moleculesAction.filter(
          action =>
            action.type === actionType.ALL_TURNED_ON_BY_TYPE &&
            (action.object_type === actionObjectType.INSPIRATION || action.object_type === actionObjectType.MOLECULE)
        )
      : moleculesAction.filter(
          action =>
            action.type === actionType.ALL_TURNED_ON_BY_TYPE &&
            (action.object_type === actionObjectType.CROSS_REFERENCE ||
              action.object_type === actionObjectType.COMPOUND)
        );

  if (actions) {
    actions.forEach(action => {
      if (action) {
        let actionItems = action.items;
        let type = action.control_type;

        if (isSelection) {
          dispatch(setSelectedAllByType(type, actionItems, action.object_type === actionObjectType.INSPIRATION));

          actionItems.forEach(data => {
            if (data) {
              if (type === 'ligand') {
                dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true, true));
              } else {
                dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true));
              }
            }
          });
        } else {
          dispatch(
            setSelectedAllByTypeOfDataset(
              type,
              action.dataset_id,
              actionItems,
              action.object_type === actionObjectType.CROSS_REFERENCE
            )
          );

          actionItems.forEach(data => {
            if (data && data.molecule) {
              dispatch(
                addTypeCompound[type](
                  stage,
                  data.molecule,
                  colourList[data.molecule.id % colourList.length],
                  data.datasetID,
                  true
                )
              );
            }
          });
        }
      }
    });
  }
};

const restoreRepresentationActions = (moleculesAction, stages) => (dispatch, getState) => {
  const nglView = stages.find(view => view.id === VIEWS.MAJOR_VIEW);

  let representationsActions = moleculesAction.filter(action => action.type === actionType.REPRESENTATION_ADDED);
  if (representationsActions) {
    representationsActions.forEach(action => {
      dispatch(addRepresentation(action.object_id, action.representation, nglView));
    });
  }

  let representationsChangesActions = moleculesAction.filter(
    action => action.type === actionType.REPRESENTATION_CHANGED
  );
  if (representationsChangesActions) {
    representationsChangesActions.forEach(action => {
      dispatch(changeRepresentation(true, action.change, action.object_id, action.representation, nglView));
    });
  }
};

const restoreProject = projectId => (dispatch, getState) => {
  if (projectId !== undefined) {
    return api({ url: `${base_url}/api/session-projects/${projectId}/` }).then(response => {
      let promises = [];
      promises.push(
        dispatch(
          setCurrentProject({
            projectID: response.data.id,
            authorID: (response.data.author && response.data.author.id) || null,
            title: response.data.title,
            description: response.data.description,
            targetID: response.data.target.id,
            tags: JSON.parse(response.data.tags)
          })
        )
      );
      return Promise.all(promises);
    });
  }
};

const restoreCompoundsActions = (orderedActionList, stage) => (dispatch, getState) => {
  const state = getState();

  let compoundsAction = orderedActionList.filter(
    action =>
      action.object_type === actionObjectType.COMPOUND || action.object_type === actionObjectType.CROSS_REFERENCE
  );

  if (compoundsAction) {
    dispatch(addNewTypeCompound(compoundsAction, actionType.LIGAND_TURNED_ON, 'ligand', stage, state));
    dispatch(addNewTypeCompound(compoundsAction, actionType.SIDECHAINS_TURNED_ON, 'protein', stage, state));
    dispatch(addNewTypeCompound(compoundsAction, actionType.INTERACTIONS_TURNED_ON, 'complex', stage, state));
    dispatch(addNewTypeCompound(compoundsAction, actionType.SURFACE_TURNED_ON, 'surface', stage, state));
  }

  let compoundsSelectedAction = compoundsAction.filter(action => action.type === actionType.COMPOUND_SELECTED);

  compoundsSelectedAction.forEach(action => {
    let data = getCompound(action, state);
    if (data) {
      dispatch(appendMoleculeToCompoundsOfDatasetToBuy(action.dataset_id, data.id, data.name));
    }
  });

  dispatch(restoreAllSelectionActions(orderedActionList, stage, false));
  dispatch(restoreAllSelectionByTypeActions(orderedActionList, stage, false));
  dispatch(setIsTrackingCompoundsRestoring(false));
};

const addType = {
  ligand: addLigand,
  protein: addHitProtein,
  complex: addComplex,
  surface: addSurface,
  vector: addVector
};

const addTypeCompound = {
  ligand: addDatasetLigand,
  protein: addDatasetHitProtein,
  complex: addDatasetComplex,
  surface: addDatasetSurface
};

const addNewType = (moleculesAction, actionType, type, stage, state, skipTracking = false) => dispatch => {
  let actions = moleculesAction.filter(action => action.type === actionType);
  if (actions) {
    actions.forEach(action => {
      let data = getMolecule(action.object_name, state);
      if (data) {
        if (type === 'ligand') {
          dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true, skipTracking));
        } else {
          dispatch(addType[type](stage, data, colourList[data.id % colourList.length], skipTracking));
        }
      }
    });
  }
};

const addNewTypeOfAction = (action, type, stage, state, skipTracking = false) => dispatch => {
  if (action) {
    let data = getMolecule(action.object_name, state);
    if (data) {
      if (type === 'ligand') {
        dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true, skipTracking));
      } else {
        dispatch(addType[type](stage, data, colourList[data.id % colourList.length], skipTracking));
      }
    }
  }
};

const addNewTypeCompound = (moleculesAction, actionType, type, stage, state, skipTracking = false) => dispatch => {
  let actions = moleculesAction.filter(action => action.type === actionType);
  if (actions) {
    actions.forEach(action => {
      let data = getCompound(action, state);
      if (data) {
        dispatch(
          addTypeCompound[type](stage, data, colourList[data.id % colourList.length], action.dataset_id, skipTracking)
        );
      }
    });
  }
};

const addNewTypeCompoundOfAction = (action, type, stage, state, skipTracking = false) => dispatch => {
  if (action) {
    let data = getCompound(action, state);
    if (data) {
      dispatch(
        addTypeCompound[type](stage, data, colourList[data.id % colourList.length], action.dataset_id, skipTracking)
      );
    }
  }
};

const getTarget = (targetName, state) => {
  let targetList = state.apiReducers.target_id_list;
  let target = targetList.find(target => target.title === targetName);
  return target;
};

const getMolGroup = (molGroupName, state) => {
  let molGroupList = state.apiReducers.mol_group_list;
  let molGroup = molGroupList.find(group => group.description === molGroupName);
  return molGroup;
};

const getMolecule = (moleculeName, state) => {
  let moleculeList = state.apiReducers.all_mol_lists;
  let molecule = null;

  if (moleculeList) {
    for (const group in moleculeList) {
      let molecules = moleculeList[group];
      molecule = molecules.find(m => m.protein_code === moleculeName);
      if (molecule && molecule != null) {
        break;
      }
    }
  }
  return molecule;
};

const getCompound = (action, state) => {
  let moleculeList = state.datasetsReducers.moleculeLists;
  let molecule = null;

  let name = action.object_name;
  let datasetID = action.dataset_id;

  if (moleculeList) {
    let moleculeListOfDataset = moleculeList[datasetID];
    if (moleculeListOfDataset) {
      molecule = moleculeListOfDataset.find(m => m.name === name);
    }
  }
  return molecule;
};

export const undoAction = (stages = []) => (dispatch, getState) => {
  const state = getState();
  let action = null;

  dispatch(setIsUndoRedoAction(true));

  const actionUndoList = state.undoableTrackingReducers.future;
  let actions = actionUndoList && actionUndoList[0];
  if (actions) {
    let actionsLenght = actions.undo_redo_actions_list.length;
    actionsLenght = actionsLenght > 0 ? actionsLenght - 1 : actionsLenght;
    action = actions.undo_redo_actions_list[actionsLenght];

    Promise.resolve(dispatch(handleUndoAction(action, stages))).then(() => {
      dispatch(setIsUndoRedoAction(false));
    });
  }
};

export const redoAction = (stages = []) => (dispatch, getState) => {
  const state = getState();
  let action = null;

  dispatch(setIsUndoRedoAction(true));

  const actions = state.undoableTrackingReducers.present;
  if (actions) {
    let actionsLenght = actions.undo_redo_actions_list.length;
    actionsLenght = actionsLenght > 0 ? actionsLenght - 1 : actionsLenght;
    action = actions.undo_redo_actions_list[actionsLenght];

    Promise.resolve(dispatch(dispatch(handleRedoAction(action, stages)))).then(() => {
      dispatch(setIsUndoRedoAction(false));
    });
  }
};

const handleUndoAction = (action, stages) => (dispatch, getState) => {
  const state = getState();

  if (action) {
    const majorView = stages.find(view => view.id === VIEWS.MAJOR_VIEW);
    const summaryView = stages.find(view => view.id === VIEWS.SUMMARY_VIEW);
    const stageSummaryView = summaryView.stage;
    const majorViewStage = majorView.stage;

    const type = action.type;
    switch (type) {
      case actionType.ALL_HIDE:
        dispatch(handleAllHideAction(action, true, majorViewStage));
        break;
      case actionType.ALL_TURNED_ON:
        dispatch(handleAllAction(action, false, majorViewStage, state));
        break;
      case actionType.ALL_TURNED_OFF:
        dispatch(handleAllAction(action, true, majorViewStage, state));
        break;
      case actionType.ALL_TURNED_ON_BY_TYPE:
        dispatch(handleAllActionByType(action, false, majorViewStage));
        break;
      case actionType.ALL_TURNED_OFF_BY_TYPE:
        dispatch(handleAllActionByType(action, true, majorViewStage));
        break;
      case actionType.LIGAND_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'ligand', false, majorViewStage, state));
        break;
      case actionType.SIDECHAINS_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'protein', false, majorViewStage, state));
        break;
      case actionType.INTERACTIONS_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'complex', false, majorViewStage, state));
        break;
      case actionType.SURFACE_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'surface', false, majorViewStage, state));
        break;
      case actionType.VECTORS_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'vector', false, majorViewStage, state));
        break;
      case actionType.LIGAND_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'ligand', true, majorViewStage, state));
        break;
      case actionType.SIDECHAINS_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'protein', true, majorViewStage, state));
        break;
      case actionType.INTERACTIONS_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'complex', true, majorViewStage, state));
        break;
      case actionType.SURFACE_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'surface', true, majorViewStage, state));
        break;
      case actionType.VECTORS_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'vector', true, majorViewStage, state));
        break;
      case actionType.VECTOR_SELECTED:
        dispatch(setCurrentVector(undefined));
        break;
      case actionType.VECTOR_DESELECTED:
        dispatch(setCurrentVector(action.object_name));
        break;
      case actionType.TARGET_LOADED:
        dispatch(handleTargetAction(action, false));
        break;
      case actionType.SITE_TURNED_ON:
        dispatch(handleMoleculeGroupAction(action, false, stageSummaryView, majorViewStage));
        break;
      case actionType.SITE_TURNED_OFF:
        dispatch(handleMoleculeGroupAction(action, true, stageSummaryView, majorViewStage));
        break;
      case actionType.MOLECULE_ADDED_TO_SHOPPING_CART:
        dispatch(handleShoppingCartAction(action, false));
        break;
      case actionType.MOLECULE_REMOVED_FROM_SHOPPING_CART:
        dispatch(handleShoppingCartAction(action, true));
        break;
      case actionType.COMPOUND_SELECTED:
        dispatch(handleCompoundAction(action, false));
        break;
      case actionType.COMPOUND_DESELECTED:
        dispatch(handleCompoundAction(action, true));
        break;
      case actionType.REPRESENTATION_CHANGED:
        dispatch(handleChangeRepresentationAction(action, false, majorView));
        break;
      case actionType.REPRESENTATION_ADDED:
        dispatch(handleRepresentationAction(action, false, majorView));
        break;
      case actionType.REPRESENTATION_REMOVED:
        dispatch(handleRepresentationAction(action, true, majorView));
        break;
      default:
        break;
    }
  }
};

const handleRedoAction = (action, stages) => (dispatch, getState) => {
  const state = getState();

  if (action) {
    const majorView = stages.find(view => view.id === VIEWS.MAJOR_VIEW);
    const summaryView = stages.find(view => view.id === VIEWS.SUMMARY_VIEW);
    const stageSummaryView = summaryView.stage;
    const majorViewStage = majorView.stage;

    const type = action.type;
    switch (type) {
      case actionType.ALL_HIDE:
        dispatch(handleAllHideAction(action, false, majorViewStage));
        break;
      case actionType.ALL_TURNED_ON:
        dispatch(handleAllAction(action, true, majorViewStage, state));
        break;
      case actionType.ALL_TURNED_OFF:
        dispatch(handleAllAction(action, false, majorViewStage, state));
        break;
      case actionType.ALL_TURNED_ON_BY_TYPE:
        dispatch(handleAllActionByType(action, true, majorViewStage));
        break;
      case actionType.ALL_TURNED_OFF_BY_TYPE:
        dispatch(handleAllActionByType(action, false, majorViewStage));
        break;
      case actionType.LIGAND_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'ligand', true, majorViewStage, state));
        break;
      case actionType.SIDECHAINS_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'protein', true, majorViewStage, state));
        break;
      case actionType.INTERACTIONS_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'complex', true, majorViewStage, state));
        break;
      case actionType.SURFACE_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'surface', true, majorViewStage, state));
        break;
      case actionType.VECTORS_TURNED_ON:
        dispatch(handleMoleculeAction(action, 'vector', true, majorViewStage, state));
        break;
      case actionType.LIGAND_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'ligand', false, majorViewStage, state));
        break;
      case actionType.SIDECHAINS_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'protein', false, majorViewStage, state));
        break;
      case actionType.INTERACTIONS_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'complex', false, majorViewStage, state));
        break;
      case actionType.SURFACE_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'surface', false, majorViewStage, state));
        break;
      case actionType.VECTORS_TURNED_OFF:
        dispatch(handleMoleculeAction(action, 'vector', false, majorViewStage, state));
        break;
      case actionType.VECTOR_SELECTED:
        dispatch(setCurrentVector(action.object_name));
        break;
      case actionType.VECTOR_DESELECTED:
        dispatch(setCurrentVector(undefined));
        break;
      case actionType.TARGET_LOADED:
        dispatch(handleTargetAction(action, true));
        break;
      case actionType.SITE_TURNED_ON:
        dispatch(handleMoleculeGroupAction(action, true, stageSummaryView, majorViewStage));
        break;
      case actionType.SITE_TURNED_OFF:
        dispatch(handleMoleculeGroupAction(action, false, stageSummaryView, majorViewStage));
        break;
      case actionType.MOLECULE_ADDED_TO_SHOPPING_CART:
        dispatch(handleShoppingCartAction(action, true));
        break;
      case actionType.MOLECULE_REMOVED_FROM_SHOPPING_CART:
        dispatch(handleShoppingCartAction(action, false));
        break;
      case actionType.COMPOUND_SELECTED:
        dispatch(handleCompoundAction(action, true));
        break;
      case actionType.COMPOUND_DESELECTED:
        dispatch(handleCompoundAction(action, false));
        break;
      case actionType.REPRESENTATION_CHANGED:
        dispatch(handleChangeRepresentationAction(action, true, majorView));
        break;
      case actionType.REPRESENTATION_ADDED:
        dispatch(handleRepresentationAction(action, true, majorView));
        break;
      case actionType.REPRESENTATION_REMOVED:
        dispatch(handleRepresentationAction(action, false, majorView));
        break;
      default:
        break;
    }
  }
};

const handleAllActionByType = (action, isAdd, stage) => (dispatch, getState) => {
  let actionItems = action.items;
  let type = action.control_type;
  if (action.object_type === actionObjectType.MOLECULE || action.object_type === actionObjectType.INSPIRATION) {
    if (isAdd) {
      dispatch(setSelectedAllByType(type, actionItems, action.object_type === actionObjectType.INSPIRATION));

      actionItems.forEach(data => {
        if (data) {
          if (type === 'ligand') {
            dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true, true));
          } else {
            dispatch(addType[type](stage, data, colourList[data.id % colourList.length], true));
          }
        }
      });
    } else {
      dispatch(setDeselectedAllByType(type, actionItems, action.object_type === actionObjectType.INSPIRATION));

      actionItems.forEach(data => {
        if (data) {
          if (type === 'ligand') {
            dispatch(removeType[type](stage, data, true));
          } else {
            dispatch(removeType[type](stage, data, colourList[data.id % colourList.length], true));
          }
        }
      });
    }
  } else if (
    action.object_type === actionObjectType.COMPOUND ||
    action.object_type === actionObjectType.CROSS_REFERENCE
  ) {
    if (isAdd) {
      dispatch(
        setSelectedAllByTypeOfDataset(
          type,
          action.dataset_id,
          actionItems,
          action.object_type === actionObjectType.CROSS_REFERENCE
        )
      );

      actionItems.forEach(data => {
        if (data && data.molecule) {
          dispatch(
            addTypeCompound[type](
              stage,
              data.molecule,
              colourList[data.molecule.id % colourList.length],
              data.datasetID,
              true
            )
          );
        }
      });
    } else {
      dispatch(
        setDeselectedAllByTypeOfDataset(
          type,
          action.dataset_id,
          actionItems,
          action.object_type === actionObjectType.CROSS_REFERENCE
        )
      );

      actionItems.forEach(data => {
        if (data && data.molecule) {
          dispatch(
            removeTypeCompound[type](
              stage,
              data.molecule,
              colourList[data.molecule.id % colourList.length],
              data.datasetID,
              true
            )
          );
        }
      });
    }
  }
};

const handleAllHideAction = (action, isAdd, stage) => (dispatch, getState) => {
  let data = action.data;
  let ligandDataList = data.ligandList;
  let proteinDataList = data.proteinList;
  let complexDataList = data.complexList;
  let surfaceDataList = data.surfaceList;
  let vectorOnDataList = data.vectorOnList;

  dispatch(setHideAll(data, !isAdd));

  if (isAdd) {
    ligandDataList.forEach(data => {
      if (data) {
        dispatch(addType['ligand'](stage, data, colourList[data.id % colourList.length], true, true));
      }
    });

    proteinDataList.forEach(data => {
      if (data) {
        dispatch(addType['protein'](stage, data, colourList[data.id % colourList.length], true));
      }
    });

    complexDataList.forEach(data => {
      if (data) {
        dispatch(addType['complex'](stage, data, colourList[data.id % colourList.length], true));
      }
    });

    surfaceDataList.forEach(data => {
      if (data) {
        dispatch(addType['surface'](stage, data, colourList[data.id % colourList.length], true));
      }
    });
    vectorOnDataList.forEach(data => {
      if (data) {
        dispatch(addType['vector'](stage, data, true));
      }
    });
  } else {
    ligandDataList.forEach(data => {
      if (data) {
        dispatch(removeType['ligand'](stage, data, true));
      }
    });

    proteinDataList.forEach(data => {
      if (data) {
        dispatch(removeType['protein'](stage, data, colourList[data.id % colourList.length], true));
      }
    });

    complexDataList.forEach(data => {
      if (data) {
        dispatch(removeType['complex'](stage, data, colourList[data.id % colourList.length], true));
      }
    });

    surfaceDataList.forEach(data => {
      if (data) {
        dispatch(removeType['surface'](stage, data, colourList[data.id % colourList.length], true));
      }
    });
    vectorOnDataList.forEach(data => {
      if (data) {
        dispatch(removeType['vector'](stage, data, true));
      }
    });
  }
};

const handleAllAction = (action, isSelected, majorViewStage, state) => (dispatch, getState) => {
  let isSelection =
    action.object_type === actionObjectType.MOLECULE || action.object_type === actionObjectType.INSPIRATION;

  if (isSelected) {
    if (isSelection) {
      dispatch(setSelectedAll(action.item, true, true, true));
    } else {
      dispatch(setSelectedAllOfDataset(action.dataset_id, action.item, true, true, true));
    }
  } else {
    if (isSelection) {
      dispatch(setDeselectedAll(action.item, action.isLigand, action.isProtein, action.isComplex));
    } else {
      dispatch(
        setDeselectedAllOfDataset(action.dataset_id, action.item, action.isLigand, action.isProtein, action.isComplex)
      );
    }
  }

  if (action.isLigand) {
    dispatch(handleMoleculeAction(action, 'ligand', isSelected, majorViewStage, state, true));
  }

  if (action.isProtein) {
    dispatch(handleMoleculeAction(action, 'protein', isSelected, majorViewStage, state, true));
  }

  if (action.isComplex) {
    dispatch(handleMoleculeAction(action, 'complex', isSelected, majorViewStage, state, true));
  }
};

const handleTargetAction = (action, isSelected, stages) => (dispatch, getState) => {
  const state = getState();
  if (action) {
    if (isSelected === false) {
      dispatch(setTargetOn(undefined));
    } else {
      let target = getTarget(action.object_name, state);
      if (target) {
        dispatch(setTargetOn(target.id));
        dispatch(shouldLoadProtein({ nglViewList: stages, currentSnapshotID: null, isLoadingCurrentSnapshot: false }));
      }
    }
  }
};

const handleCompoundAction = (action, isSelected) => (dispatch, getState) => {
  const state = getState();
  if (action) {
    let data = getCompound(action, state);
    if (data) {
      if (isSelected === true) {
        dispatch(appendMoleculeToCompoundsOfDatasetToBuy(action.dataset_id, data.id, data.name));
      } else {
        dispatch(removeMoleculeFromCompoundsOfDatasetToBuy(action.dataset_id, data.id, data.name));
      }
    }
  }
};

const handleShoppingCartAction = (action, isAdd) => (dispatch, getState) => {
  if (action) {
    let data = action.item;
    if (isAdd) {
      dispatch(appendToBuyList(data));
    } else {
      dispatch(removeFromToBuyList(data));
    }
  }
};

const handleRepresentationAction = (action, isAdd, nglView) => (dispatch, getState) => {
  if (action) {
    if (isAdd === true) {
      dispatch(addRepresentation(action.object_id, action.representation, nglView));
    } else {
      dispatch(removeRepresentation(action.object_id, action.representation, nglView));
    }
  }
};

const addRepresentation = (parentKey, representation, nglView) => (dispatch, getState) => {
  const oldRepresentation = representation;
  const newRepresentationType = oldRepresentation.type;
  const comp = nglView.stage.getComponentsByName(parentKey).first;
  const newRepresentation = assignRepresentationToComp(
    newRepresentationType,
    oldRepresentation.params,
    comp,
    oldRepresentation.lastKnownID
  );
  dispatch(addComponentRepresentation(parentKey, newRepresentation));
};

const handleChangeRepresentationAction = (action, isAdd, nglView) => (dispatch, getState) => {
  if (action) {
    dispatch(changeRepresentation(isAdd, action.change, action.object_id, action.representation, nglView));
  }
};

const changeRepresentation = (isAdd, change, parentKey, representation, nglView) => (dispatch, getState) => {
  const comp = nglView.stage.getComponentsByName(parentKey).first;
  const r = comp.reprList.find(rep => rep.uuid === representation.uuid || rep.uuid === representation.lastKnownID);
  if (r && change) {
    let key = change.key;
    let value = isAdd ? change.value : change.oldValue;

    r.setParameters({ [key]: value });
    representation.params[key] = value;

    dispatch(updateComponentRepresentation(parentKey, representation.uuid, representation));
  }
};

const removeRepresentation = (parentKey, representation, nglView) => (dispatch, getState) => {
  const comp = nglView.stage.getComponentsByName(parentKey).first;
  let foundedRepresentation = undefined;
  comp.eachRepresentation(r => {
    if (r.uuid === representation.uuid || r.uuid === representation.lastKnownID) {
      foundedRepresentation = r;
    }
  });
  if (foundedRepresentation) {
    comp.removeRepresentation(foundedRepresentation);

    if (comp.reprList.length === 0) {
      dispatch(deleteObject(nglView, nglView.stage, true));
    } else {
      dispatch(removeComponentRepresentation(parentKey, representation));
    }
  }
};

const handleMoleculeGroupAction = (action, isSelected, stageSummaryView, majorViewStage) => (dispatch, getState) => {
  const state = getState();
  if (action) {
    let moleculeGroup = getMolGroup(action.object_name, state);
    if (moleculeGroup) {
      if (isSelected === true) {
        dispatch(selectMoleculeGroup(moleculeGroup, stageSummaryView));
      } else {
        dispatch(onDeselectMoleculeGroup({ moleculeGroup, stageSummaryView, majorViewStage }));
      }
    }
  }
};

const handleMoleculeAction = (action, type, isAdd, stage, state, skipTracking) => (dispatch, getState) => {
  if (action.object_type === actionObjectType.MOLECULE || action.object_type === actionObjectType.INSPIRATION) {
    if (isAdd) {
      dispatch(addNewTypeOfAction(action, type, stage, state, skipTracking));
    } else {
      dispatch(removeNewType(action, type, stage, state, skipTracking));
    }
  } else if (
    action.object_type === actionObjectType.COMPOUND ||
    action.object_type === actionObjectType.CROSS_REFERENCE
  ) {
    if (isAdd) {
      dispatch(addNewTypeCompoundOfAction(action, type, stage, state, skipTracking));
    } else {
      dispatch(removeNewTypeCompound(action, type, stage, state, skipTracking));
    }
  }
};

const removeType = {
  ligand: removeLigand,
  protein: removeHitProtein,
  complex: removeComplex,
  surface: removeSurface,
  vector: removeVector
};

const removeTypeCompound = {
  ligand: removeDatasetLigand,
  protein: removeDatasetHitProtein,
  complex: removeDatasetComplex,
  surface: removeDatasetSurface
};

const removeNewType = (action, type, stage, state, skipTracking) => dispatch => {
  if (action) {
    let data = getMolecule(action.object_name, state);
    if (data) {
      if (type === 'ligand') {
        dispatch(removeType[type](stage, data, skipTracking));
      } else {
        dispatch(removeType[type](stage, data, colourList[data.id % colourList.length], skipTracking));
      }
    }
  }
};

const removeNewTypeCompound = (action, type, stage, state, skipTracking) => dispatch => {
  if (action) {
    let data = getCompound(action, state);
    if (data) {
      dispatch(
        removeTypeCompound[type](stage, data, colourList[data.id % colourList.length], action.dataset_id, skipTracking)
      );
    }
  }
};

export const getCanUndo = () => (dispatch, getState) => {
  const state = getState();
  return state.undoableTrackingReducers.past.length > 0;
};

export const getCanRedo = () => (dispatch, getState) => {
  const state = getState();
  return state.undoableTrackingReducers.future.length > 0;
};

export const appendAndSendTrackingActions = trackAction => (dispatch, getState) => {
  const state = getState();
  const isUndoRedoAction = state.trackingReducers.isUndoRedoAction;

  if (trackAction && trackAction !== null) {
    dispatch(appendToActionList(trackAction, isUndoRedoAction));
    dispatch(appendToSendActionList(trackAction));

    if (isUndoRedoAction === false) {
      dispatch(appendToUndoRedoActionList(trackAction));
    }
  }

  dispatch(checkSendTrackingActions());
};

export const manageSendTrackingActions = (projectID, copy) => (dispatch, getState) => {
  if (copy) {
    dispatch(checkActionsProject(projectID));
  } else {
    dispatch(checkSendTrackingActions(true));
  }
};

export const checkSendTrackingActions = (save = false) => (dispatch, getState) => {
  const state = getState();
  const currentProject = state.projectReducers.currentProject;
  const sendActions = state.trackingReducers.send_actions_list;
  const length = sendActions.length;

  if (length >= CONSTANTS.COUNT_SEND_TRACK_ACTIONS || save) {
    dispatch(sendTrackingActions(sendActions, currentProject));
  }
};

const sendTrackingActions = (sendActions, project, clear = true) => (dispatch, getState) => {
  if (project) {
    const projectID = project && project.projectID;

    if (projectID && sendActions && sendActions.length > 0) {
      dispatch(setIsActionsSending(true));

      const dataToSend = {
        session_project: projectID,
        author: project.authorID,
        last_update_date: moment().format(),
        actions: JSON.stringify(sendActions)
      };
      return api({
        url: `${base_url}/api/session-actions/`,
        method: METHOD.POST,
        data: JSON.stringify(dataToSend)
      })
        .then(() => {
          if (clear === true) {
            dispatch(setSendActionsList([]));
          }
        })
        .catch(error => {
          throw new Error(error);
        })
        .finally(() => {
          dispatch(setIsActionsSending(false));
        });
    } else {
      return Promise.resolve();
    }
  } else {
    return Promise.resolve();
  }
};

export const setProjectTrackingActions = () => (dispatch, getState) => {
  const state = getState();
  const currentProject = state.projectReducers.currentProject;
  const projectID = currentProject && currentProject.projectID;

  dispatch(getTrackingActions(projectID));
};

const getTrackingActions = projectID => (dispatch, getState) => {
  const state = getState();
  const sendActions = state.trackingReducers.send_actions_list;

  if (projectID) {
    dispatch(setIsActionsLoading(true));
    return api({
      url: `${base_url}/api/session-actions/?session_project=${projectID}`
    })
      .then(response => {
        let results = response.data.results;
        let listToSet = [];
        results.forEach(r => {
          let resultActions = JSON.parse(r.actions);
          listToSet.push(...resultActions);
        });

        let projectActions = [...listToSet, ...sendActions];
        dispatch(setProjectActionList(projectActions));
        return Promise.resolve(projectActions);
      })
      .catch(error => {
        throw new Error(error);
      })
      .finally(() => {
        dispatch(setIsActionsLoading(false));
      });
  } else {
    let projectActions = [...sendActions];
    dispatch(setProjectActionList(projectActions));
    return Promise.resolve(projectActions);
  }
};

const checkActionsProject = projectID => (dispatch, getState) => {
  const state = getState();
  const currentProject = state.projectReducers.currentProject;
  const currentProjectID = currentProject && currentProject.projectID;

  Promise.resolve(dispatch(getTrackingActions(projectID))).then(() => {
    dispatch(copyActionsToProject(currentProject, true, currentProjectID && currentProjectID != null ? true : false));
  });
};

const copyActionsToProject = (toProject, setActionList = true, clearSendList = true) => (dispatch, getState) => {
  const state = getState();
  const actionList = state.trackingReducers.project_actions_list;

  if (toProject) {
    let newActionsList = [];

    actionList.forEach(r => {
      newActionsList.push(Object.assign({ ...r }));
    });

    if (setActionList === true) {
      dispatch(setActionsList(newActionsList));
    }
    dispatch(sendTrackingActions(newActionsList, toProject, clearSendList));
  }
};

export const sendTrackingActionsByProjectId = (projectID, authorID) => (dispatch, getState) => {
  const state = getState();
  const currentProject = state.projectReducers.currentProject;
  const currentProjectID = currentProject && currentProject.projectID;

  const project = { projectID, authorID };

  Promise.resolve(dispatch(getTrackingActions(currentProjectID))).then(() => {
    dispatch(copyActionsToProject(project, false, currentProjectID && currentProjectID != null ? true : false));
  });
};

export const sendInitTrackingActionByProjectId = target_on => (dispatch, getState) => {
  const state = getState();
  const snapshotID = state.projectReducers.currentSnapshot && state.projectReducers.currentSnapshot.id;

  let trackAction = dispatch(createInitAction(target_on));
  if (trackAction && trackAction != null) {
    let actions = [];
    actions.push(trackAction);
    dispatch(appendToSendActionList(trackAction));
    dispatch(checkSendTrackingActions(true));
    dispatch(saveTrackingActions(actions, snapshotID));
  }
};
