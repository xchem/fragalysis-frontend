import { base_url, URLS } from '../../components/routes/constants';
import { api } from '../../../js/utils/api';
import { setCurrentSnapshot } from '../../components/projects/redux/actions';
import { setCurrentActionsList, setIsActionsRestoring, setSkipOrientationChange, setIsSnapshotDirty } from './actions';
import { resetSelectionState } from '../selection/actions';
import { resetDatasetsStateOnSnapshotChange, resetDatasetScrolledMap } from '../../components/datasets/redux/actions';
import { resetViewerControlsState } from '../../components/preview/viewerControls/redux/actions';
import { resetNglTrackingState } from '../nglTracking/dispatchActions';
import { removeAllNglComponents } from '../ngl/actions';
import {
  restoreStateBySavedActionList,
  restoreViewerControlActions,
  restoreSitesActions,
  restoreTagActions,
  restoreMoleculesActions,
  restoreRepresentationActions,
  restoreMoleculeSelectionActions,
  restoreTabActions,
  restoreCartActions,
  restoreSnapshotImageActions,
  restoreNglStateAction,
  restoreNglSettingsAction,
  restoreCompoundsActions,
  getMolecule,
  getCompound,
  restoreNglOrientationAnim
} from './dispatchActions';
import { VIEWS } from '../../../js/constants/constants';
import { loadProteinOfRestoringActions } from '../../components/preview/redux/dispatchActions';
import { actionType, snapshotSwitchManualActions, actionObjectType } from './constants';
import { getMoleculeForId } from '../../components/preview/tags/redux/dispatchActions';
import {
  addLigand,
  removeLigand,
  removeHitProtein,
  addHitProtein,
  removeSurface,
  addSurface,
  removeQuality,
  addQuality,
  removeComplex,
  addComplex,
  removeVector,
  addVector,
  removeDensity,
  addDensity,
  addDensityCustomView
} from '../../components/preview/molecule/redux/dispatchActions';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import {
  addDatasetLigand,
  removeDatasetLigand,
  removeDatasetHitProtein,
  addDatasetHitProtein,
  removeDatasetSurface,
  addDatasetSurface,
  removeDatasetComplex,
  addDatasetComplex
} from '../../components/datasets/redux/dispatchActions';
import { getDifference } from './utils';
import { setSnapshotLoadingInProgress } from '../api/actions';

/**
 * The goal of this method is to restore the state of the app based on the tracking
 * action. All of the dispatched actions were added by trial and error - in case you
 * need to alter, remove or add anything, you should properly test the changes.
 */
export const restoreAfterSnapshotChange = (stages, projectId) => async (dispatch, getState) => {
  console.count(`restoreAfterSnapshotChange start`);
  const state = getState();

  const currentActionList = state.trackingReducers.current_actions_list;
  const filteredActionList = currentActionList.filter(action => !snapshotSwitchManualActions.includes(action.type));
  const orderedActionList = filteredActionList.sort((a, b) => a.timestamp - b.timestamp);
  const targetId = state.apiReducers.target_on;

  if (targetId && stages && stages.length > 0) {
    console.count(`BEFORE restoration orientation from snapshot`);
    await dispatch(restoreNglOrientationAnim(orderedActionList, stages));
    console.count(`AFTER restoration orientation from snapshot`);

    dispatch(setSkipOrientationChange(true));
    const majorView = stages.find(view => view.id === VIEWS.MAJOR_VIEW);

    dispatch(restoreViewerControlActions(orderedActionList));

    // await dispatch(loadProteinOfRestoringActions({ nglViewList: stages }));

    await dispatch(restoreSitesActions(orderedActionList));
    await dispatch(restoreTagActions(orderedActionList));
    await dispatch(restoreMoleculesActions(orderedActionList, majorView.stage));

    await dispatch(handleLigandsOfMols(currentActionList, majorView.stage));
    await dispatch(handleProteinsOfMols(currentActionList, majorView.stage));
    await dispatch(handleComplexesOfMols(currentActionList, majorView.stage));
    await dispatch(handleShowAllOfMols(currentActionList, majorView.stage));
    await dispatch(handleSurfacesOfMols(currentActionList, majorView.stage));
    await dispatch(handleQualityOfMols(currentActionList, majorView.stage));
    await dispatch(handleVectorsOfMols(currentActionList, majorView.stage));
    await dispatch(handleDensityOfMols(currentActionList, majorView.stage));
    // await dispatch(handleDensityTypeOfMols(currentActionList, majorView.stage));
    await dispatch(handleCustomDensityOfMols(currentActionList, majorView.stage));

    await dispatch(restoreRepresentationActions(orderedActionList, stages));
    await dispatch(restoreMoleculeSelectionActions(orderedActionList));
    await dispatch(restoreTabActions(orderedActionList));
    await dispatch(restoreCartActions(orderedActionList, majorView.stage));
    await dispatch(restoreSnapshotImageActions(projectId));
    // console.count(`BEFORE restoration orientation from snapshot`);
    // dispatch(restoreNglStateAction(orderedActionList, stages));
    // console.count(`AFTER restoration orientation from snapshot`);
    await dispatch(restoreNglSettingsAction(orderedActionList, majorView.stage));
    // dispatch(restoreCompoundsActions(orderedActionList, majorView.stage));

    await dispatch(handleLigandsOfCompounds(currentActionList, majorView.stage));
    await dispatch(handleProteinsOfCompounds(currentActionList, majorView.stage));
    await dispatch(handleComplexesOfCompounds(currentActionList, majorView.stage));
    await dispatch(handleSurfacesOfCompounds(currentActionList, majorView.stage));
    await dispatch(handleShowAllOfCompounds(currentActionList, majorView.stage));
    await dispatch(restoreCompoundsActions(orderedActionList, majorView.stage));

    dispatch(setSkipOrientationChange(false));
    // console.count(`BEFORE restoration orientation from snapshot`);
    // await dispatch(restoreNglStateAction(orderedActionList, stages, true));
    // console.count(`AFTER restoration orientation from snapshot`);

    dispatch(resetDatasetScrolledMap()); // Have a look at useScrollToSelected.js
    dispatch(setIsActionsRestoring(false, true));

    console.count(`restoreAfterSnapshotChange end`);
  }
};

/**
 * The goal of this method is to change the snapshot without reloading the page.
 * All of the dispatched actions were added by trial and error - in case you need
 * to alter, remove or add anything, you should properly test the changes.
 */
export const changeSnapshot = (projectID, snapshotID, nglViewList, stage) => async (dispatch, getState) => {
  console.count(`Change snapshot - start`);
  dispatch(setSnapshotLoadingInProgress(true));
  // A hacky way of changing the URL without triggering react-router
  window.history.replaceState(null, null, `${URLS.projects}${projectID}/${snapshotID}`);

  // Load the needed data
  const snapshotResponse = await api({ url: `${base_url}/api/snapshots/${snapshotID}` });
  const actionsResponse = await api({
    url: `${base_url}/api/snapshot-actions/?snapshot=${snapshotID}`
  });

  dispatch(
    setCurrentSnapshot({
      id: snapshotResponse.data.id,
      type: snapshotResponse.data.type,
      title: snapshotResponse.data.title,
      author: snapshotResponse.data.author,
      description: snapshotResponse.data.description,
      created: snapshotResponse.data.created,
      children: snapshotResponse.data.children,
      parent: snapshotResponse.data.parent,
      data: snapshotResponse.data.data
    })
  );

  let results = actionsResponse.data.results;
  let listToSet = [];
  results.forEach(r => {
    let resultActions = JSON.parse(r.actions);
    listToSet.push(...resultActions);
  });
  let snapshotActions = [...listToSet];
  dispatch(setCurrentActionsList(snapshotActions));

  dispatch(resetSelectionState()); //here what is visible from the LHS is reset
  dispatch(resetDatasetsStateOnSnapshotChange()); //here what is visible from RHS is reset
  dispatch(resetViewerControlsState()); //LHS and RHS is/isn't visible
  dispatch(resetNglTrackingState()); //????

  //   dispatch(removeAllNglComponents(stage)); //this removes everything from ngl view

  dispatch(restoreStateBySavedActionList());
  await dispatch(restoreAfterSnapshotChange(nglViewList, projectID));

  dispatch(setIsSnapshotDirty(false));
  dispatch(setSnapshotLoadingInProgress(false));

  console.count(`Change snapshot - end`);
};

//ALL_TURNED_ON is a mass action so it needs special treatment
const handleShowAllOfMols = (actions, stage) => async (dispatch, getState) => {
  const state = getState();
  const molIds = dispatch(getMoleculeIdsFromActions(actions, actionType.ALL_TURNED_ON));
  const ligands = state.selectionReducers.fragmentDisplayList;
  const proteins = state.selectionReducers.proteinList;
  const complexes = state.selectionReducers.complexList;

  for (const molId of molIds) {
    const mol = dispatch(getMoleculeForId(molId.id));
    if (mol) {
      const action = actions.find(
        a =>
          a.type === actionType.ALL_TURNED_ON && a.object_id === molId.id && a.object_type === actionObjectType.MOLECULE
      );
      if (action.isLigand && !ligands.find(l => l === molId.id)) {
        await dispatch(addLigand(stage, mol, getRandomColor(mol), false, true, true));
      }
      if (action.isProtein && !proteins.find(p => p === molId.id)) {
        await dispatch(addHitProtein(stage, mol, getRandomColor(mol), true, true));
      }
      if (action.isComplex && !complexes.find(c => c === molId.id)) {
        await dispatch(addComplex(stage, mol, getRandomColor(mol), true));
      }
    }
  }
};

//ALL_TURNED_ON is a mass action so it needs special treatment
const handleShowAllOfCompounds = (actions, stage) => async (dispatch, getState) => {
  const state = getState();
  const compounds = dispatch(getCompoundsIdsFromActions(actions, actionType.ALL_TURNED_ON));
  const ligands = state.datasetsReducers.ligandLists;
  const proteins = state.datasetsReducers.proteinLists;
  const complexes = state.datasetsReducers.complexLists;

  for (const [datasetId, cmpIds] of Object.entries(compounds)) {
    for (const cmpId of cmpIds) {
      const cmp = dispatch(getCompoundById(cmpId.id, datasetId));
      if (cmp) {
        const action = actions.find(
          a =>
            a.type === actionType.ALL_TURNED_ON &&
            a.object_id === cmpId.id &&
            a.object_type === actionObjectType.COMPOUND
        );
        if (action.isLigand && !ligands[datasetId]?.find(l => l === cmpId.id)) {
          await dispatch(addDatasetLigand(stage, cmp, getRandomColor(cmp), datasetId, true));
        }
        if (action.isProtein && !proteins[datasetId]?.find(p => p === cmpId.id)) {
          await dispatch(addDatasetHitProtein(stage, cmp, getRandomColor(cmp), datasetId, true));
        }
        if (action.isComplex && !complexes[datasetId]?.find(c => c === cmpId.id)) {
          await dispatch(addDatasetComplex(stage, cmp, getRandomColor(cmp), datasetId, true));
        }
      }
    }
  }
};

const handleLigandsOfMols = (actions, stage) => async (dispatch, getState) => {
  const state = getState();
  const instructions = dispatch(
    getRestoreInstructionsForMols(actions, actionType.LIGAND_TURNED_ON, state.selectionReducers.fragmentDisplayList)
  );

  instructions.toTurnOff.forEach(molId => {
    const mol = dispatch(getMoleculeForId(molId));
    if (mol) {
      dispatch(removeLigand(stage, mol, true));
    }
  });

  for (const molId of instructions.toTurnOn) {
    const mol = dispatch(getMoleculeForId(molId));
    if (mol) {
      await dispatch(addLigand(stage, mol, getRandomColor(mol), false, true, true));
    }
  }
};

const handleLigandsOfCompounds = (actions, stage) => async (dispatch, getState) => {
  const state = getState();
  const instructions = dispatch(
    getRestoreInstructionsForCompounds(actions, actionType.LIGAND_TURNED_ON, state.datasetsReducers.ligandLists)
  );

  for (const [datasetId, cmpIds] of Object.entries(instructions)) {
    cmpIds.toTurnOff.forEach(cmpId => {
      const cmp = dispatch(getCompoundById(cmpId, datasetId));
      if (cmp) {
        dispatch(removeDatasetLigand(stage, cmp, getRandomColor(cmp), datasetId, true));
      }
    });
    for (const cmpId of cmpIds.toTurnOn) {
      const cmp = dispatch(getCompoundById(cmpId, datasetId));
      if (cmp) {
        await dispatch(addDatasetLigand(stage, cmp, getRandomColor(cmp), datasetId, true));
      }
    }
  }
};

const handleProteinsOfMols = (actions, stage) => async (dispatch, getState) => {
  const state = getState();
  const instructions = dispatch(
    getRestoreInstructionsForMols(actions, actionType.SIDECHAINS_TURNED_ON, state.selectionReducers.proteinList)
  );

  instructions.toTurnOff.forEach(molId => {
    const mol = dispatch(getMoleculeForId(molId));
    if (mol) {
      dispatch(removeHitProtein(stage, mol, getRandomColor(mol), true));
    }
  });
  for (const molId of instructions.toTurnOn) {
    const mol = dispatch(getMoleculeForId(molId));
    if (mol) {
      await dispatch(addHitProtein(stage, mol, getRandomColor(mol), true, true));
    }
  }
};

const handleProteinsOfCompounds = (actions, stage) => async (dispatch, getState) => {
  const state = getState();
  const instructions = dispatch(
    getRestoreInstructionsForCompounds(actions, actionType.SIDECHAINS_TURNED_ON, state.datasetsReducers.proteinLists)
  );

  for (const [datasetId, cmpIds] of Object.entries(instructions)) {
    cmpIds.toTurnOff.forEach(cmpId => {
      const cmp = dispatch(getCompoundById(cmpId, datasetId));
      if (cmp) {
        dispatch(removeDatasetHitProtein(stage, cmp, getRandomColor(cmp), datasetId, true));
      }
    });
    for (const cmpId of cmpIds.toTurnOn) {
      const cmp = dispatch(getCompoundById(cmpId, datasetId));
      if (cmp) {
        await dispatch(addDatasetHitProtein(stage, cmp, getRandomColor(cmp), datasetId, true));
      }
    }
  }
};

const handleSurfacesOfMols = (actions, stage) => async (dispatch, getState) => {
  const state = getState();
  const instructions = dispatch(
    getRestoreInstructionsForMols(actions, actionType.SURFACE_TURNED_ON, state.selectionReducers.surfaceList)
  );

  instructions.toTurnOff.forEach(molId => {
    const mol = dispatch(getMoleculeForId(molId));
    if (mol) {
      dispatch(removeSurface(stage, mol, getRandomColor(mol), true));
    }
  });

  for (const molId of instructions.toTurnOn) {
    const mol = dispatch(getMoleculeForId(molId));
    if (mol) {
      await dispatch(addSurface(stage, mol, getRandomColor(mol), true, true));
    }
  }
};

const handleSurfacesOfCompounds = (actions, stage) => async (dispatch, getState) => {
  const state = getState();
  const instructions = dispatch(
    getRestoreInstructionsForCompounds(actions, actionType.SURFACE_TURNED_ON, state.datasetsReducers.surfaceLists)
  );

  for (const [datasetId, cmpIds] of Object.entries(instructions)) {
    cmpIds.toTurnOff.forEach(cmpId => {
      const cmp = dispatch(getCompoundById(cmpId, datasetId));
      if (cmp) {
        dispatch(removeDatasetSurface(stage, cmp, getRandomColor(cmp), datasetId, true));
      }
    });
    for (const cmpId of cmpIds.toTurnOn) {
      const cmp = dispatch(getCompoundById(cmpId, datasetId));
      if (cmp) {
        await dispatch(addDatasetSurface(stage, cmp, getRandomColor(cmp), datasetId, true));
      }
    }
  }
};

const handleQualityOfMols = (actions, stage) => async (dispatch, getState) => {
  const state = getState();

  //quality is turned on implicitly by turning on ligands so in this case we just need to turn off quality
  //for mols which are in the snapshot. Just make sure that ligands are turned on first (and that action is awaited)
  let molIds = dispatch(getMoleculeIdsFromActions(actions, actionType.QUALITY_TURNED_OFF));
  molIds.forEach(async molId => {
    const mol = dispatch(getMoleculeForId(molId.id));
    if (mol) {
      await dispatch(removeQuality(stage, mol, getRandomColor(mol), true));
    }
  });

  //now we need to get all the ligands that should be on and turn on quality for them if the quality
  //was off in current snapshot. This is because if ligand is on in both snapshots it's not rerendered
  // (which implicitly turns on quality) so we need to render it manually
  molIds = dispatch(getMoleculeIdsFromActions(actions, actionType.LIGAND_TURNED_ON));
  const currentlyOnQuality = state.selectionReducers.qualityList;
  for (const molId of molIds) {
    if (!currentlyOnQuality.find(q => q === molId.id)) {
      const mol = dispatch(getMoleculeForId(molId.id));
      if (mol) {
        await dispatch(addQuality(stage, mol, getRandomColor(mol), true));
      }
    }
  }
};

const handleComplexesOfMols = (actions, stage) => async (dispatch, getState) => {
  const state = getState();
  const instructions = dispatch(
    getRestoreInstructionsForMols(actions, actionType.INTERACTIONS_TURNED_ON, state.selectionReducers.complexList)
  );

  instructions.toTurnOff.forEach(molId => {
    const mol = dispatch(getMoleculeForId(molId));
    if (mol) {
      dispatch(removeComplex(stage, mol, getRandomColor(mol), true));
    }
  });

  for (const molId of instructions.toTurnOn) {
    const mol = dispatch(getMoleculeForId(molId));
    if (mol) {
      await dispatch(addComplex(stage, mol, getRandomColor(mol), true));
    }
  }
};

const handleComplexesOfCompounds = (actions, stage) => async (dispatch, getState) => {
  const state = getState();
  const instructions = dispatch(
    getRestoreInstructionsForCompounds(actions, actionType.INTERACTIONS_TURNED_ON, state.datasetsReducers.complexLists)
  );

  for (const [datasetId, cmpIds] of Object.entries(instructions)) {
    cmpIds.toTurnOff.forEach(cmpId => {
      const cmp = dispatch(getCompoundById(cmpId, datasetId));
      if (cmp) {
        dispatch(removeDatasetComplex(stage, cmp, getRandomColor(cmp), datasetId, true));
      }
    });
    for (const cmpId of cmpIds.toTurnOn) {
      const cmp = dispatch(getCompoundById(cmpId, datasetId));
      if (cmp) {
        await dispatch(addDatasetComplex(stage, cmp, getRandomColor(cmp), datasetId, true));
      }
    }
  }
};

const handleVectorsOfMols = (actions, stage) => async (dispatch, getState) => {
  const state = getState();
  const instructions = dispatch(
    getRestoreInstructionsForMols(actions, actionType.VECTORS_TURNED_ON, state.selectionReducers.fragmentDisplayList) //TODO ???????
  );

  instructions.toTurnOff.forEach(molId => {
    const mol = dispatch(getMoleculeForId(molId));
    if (mol) {
      dispatch(removeVector(stage, mol, true));
    }
  });

  for (const molId of instructions.toTurnOn) {
    const mol = dispatch(getMoleculeForId(molId));
    if (mol) {
      await dispatch(addVector(stage, mol, true));
    }
  }
};

const handleDensityOfMols = (actions, stage) => async (dispatch, getState) => {
  const state = getState();
  const instructions = dispatch(
    getRestoreInstructionsForMols(actions, actionType.DENSITY_TURNED_ON, state.selectionReducers.densityList)
  );

  instructions.toTurnOff.forEach(molId => {
    const mol = dispatch(getMoleculeForId(molId));
    if (mol) {
      dispatch(removeDensity(stage, mol, getRandomColor(mol), false, true));
    }
  });
  for (const molId of instructions.toTurnOn) {
    const mol = dispatch(getMoleculeForId(molId));
    if (mol) {
      await dispatch(addDensity(stage, mol, getRandomColor(mol), true, true));
    }
  }
};

const handleCustomDensityOfMols = (actions, stage) => async (dispatch, getState) => {
  const state = getState();
  const instructions = dispatch(
    getRestoreInstructionsForMols(
      actions,
      actionType.DENSITY_CUSTOM_TURNED_ON,
      state.selectionReducers.densityListCustom
    )
  );

  instructions.toTurnOff.forEach(molId => {
    const mol = dispatch(getMoleculeForId(molId));
    if (mol) {
      dispatch(removeDensity(stage, mol, getRandomColor(mol), false, true));
    }
  });

  for (const molId of instructions.toTurnOn) {
    const mol = dispatch(getMoleculeForId(molId));
    if (mol) {
      await dispatch(addDensityCustomView(stage, mol, getRandomColor(mol), true, true));
    }
  }
};

//this one is wrong. If testing shows that we need to handle this in this way then it will need fixing
//it needs to get which maps are enabled from the action and also which is disabled so actually
//the implementation will be more akin to handleShowAllOfMols
const handleDensityTypeOfMols = (actions, stage) => async (dispatch, getState) => {};

const getInstructions = (idObjects, visibleIds) => {
  const cmpIdsFromActions = idObjects.map(idObject => idObject.id);
  const molsToTurnOff = getDifference(visibleIds, cmpIdsFromActions);
  const molsToTurnOn = getDifference(cmpIdsFromActions, visibleIds);

  return { toTurnOn: molsToTurnOn, toTurnOff: molsToTurnOff };
};

const getRestoreInstructionsForMols = (actions, actionType, list) => (dispatch, getState) => {
  const molIds = dispatch(getMoleculeIdsFromActions(actions, actionType));

  return getInstructions(molIds, list);
};

const getRestoreInstructionsForCompounds = (actions, actionType, compoundsLists) => (dispatch, getState) => {
  const state = getState();
  const compounds = dispatch(getCompoundsIdsFromActions(actions, actionType));
  const allDatasets = state.datasetsReducers.datasets;

  const result = {};
  const datasetsVisited = {};

  Object.entries(compounds).map(([datasetId, cmpIds]) => {
    datasetsVisited[datasetId] = true;
    const list = compoundsLists[datasetId];
    const instructions = getInstructions(cmpIds, list);
    result[datasetId] = instructions;
  });

  //this is here because if someone selectes A button on the compound (RHS which turns on L, P and C)
  //whitout ever using button on other compounds from given dataset then we need to turn them off
  //this way because turn on and off instructions are not generated for the action and dataset combo which is not in the snapshot
  allDatasets.forEach(dataset => {
    if (!datasetsVisited.hasOwnProperty(dataset.id) || !datasetsVisited[dataset.id]) {
      const list = compoundsLists[dataset.id];
      const instructions = getInstructions([], list);
      result[dataset.id] = instructions;
    }
  });

  return result;
};

const getMoleculeIdsFromActions = (actions, actionType) => (dispatch, getState) => {
  const state = getState();
  const result = actions
    .filter(action => action.type === actionType && action.object_type === actionObjectType.MOLECULE)
    .map(action => {
      const mol = getMolecule(action.object_name, state);
      if (mol) {
        return { id: mol?.id, name: mol?.code };
      }
    });

  return result;
};

const getCompoundsIdsFromActions = (actions, actionType) => (dispatch, getState) => {
  const state = getState();

  let cmpOjects = actions
    .filter(action => action.type === actionType && action.object_type === actionObjectType.COMPOUND)
    .map(action => {
      const cmp = getCompound(action, state);
      if (cmp) {
        return { datasetId: action.dataset_id, id: cmp?.id, name: cmp.name };
      }
    });
  const result = {};
  cmpOjects.forEach(cmp => {
    if (cmp) {
      let datasetCmps = [];
      if (result.hasOwnProperty(cmp.datasetId)) {
        datasetCmps = result[cmp.datasetId];
      }
      datasetCmps = [...datasetCmps, { id: cmp.id, name: cmp.name }];
      result[cmp.datasetId] = datasetCmps;
    }
  });

  return result;
};

export const getCompoundById = (id, datasetId) => (dispatch, getState) => {
  const state = getState();
  const datasetCmps = state.datasetsReducers.moleculeLists[datasetId];
  return datasetCmps?.find(cmp => cmp.id === id);
};
