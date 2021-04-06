import { deleteObject, loadObject, setOrientation } from '../../../../reducers/ngl/dispatchActions';
import {
  appendProteinList,
  appendComplexList,
  appendSurfaceList,
  appendDensityList,
  appendDensityListCustom,
  appendFragmentDisplayList,
  appendQualityList,
  appendVectorOnList,
  appendInformationList,
  decrementCountOfPendingVectorLoadRequests,
  incrementCountOfPendingVectorLoadRequests,
  removeFromProteinList,
  removeFromComplexList,
  removeFromSurfaceList,
  removeFromDensityList,
  removeFromDensityListCustom,
  removeFromFragmentDisplayList,
  removeFromQualityList,
  removeFromVectorOnList,
  resetCompoundsOfVectors,
  setVectorList,
  updateVectorCompounds,
  updateBondColorMapOfCompounds,
  resetBondColorMapOfVectors,
  setCurrentVector,
  setHideAll,
  removeFromInformationList
} from '../../../../reducers/selection/actions';
import { base_url } from '../../../routes/constants';
import {
  generateArrowObject,
  generateMoleculeId,
  generateCylinderObject,
  getVectorWithColorByCountOfCompounds,
  generateHitProteinObject,
  generateComplexObject,
  generateSurfaceObject,
  generateDensityObject,
  generateMoleculeObject
} from '../../../nglView/generatingObjects';
import { VIEWS } from '../../../../constants/constants';
import { api } from '../../../../utils/api';
import { selectVectorAndResetCompounds } from '../../../../reducers/selection/dispatchActions';
import { colourList } from '../moleculeView';
import { appendMoleculeOrientation } from '../../../../reducers/ngl/actions';
import { setCompoundImage } from '../../summary/redux/actions';
import { noCompoundImage } from '../../summary/redux/reducer';
import { getMoleculeOfCurrentVector } from '../../../../reducers/selection/selectors';
import { resetCurrentCompoundSettingsWithoutSelection } from '../../compounds/redux/actions';
import { selectMoleculeGroup } from '../../moleculeGroups/redux/dispatchActions';
import { setDirectAccessProcessed } from '../../../../reducers/api/actions';
import { MOL_TYPE } from './constants';
import { addImageToCache } from './actions';
import { OBJECT_TYPE } from '../../../nglView/constants';
import { getRepresentationsByType } from '../../../nglView/generatingObjects';
import { readQualityInformation } from '../../../nglView/renderingHelpers';

/**
 * Convert the JSON into a list of arrow objects
 */
const generateObjectList = (out_data, data) => {
  const colour = [1, 0, 0];
  const deletions = out_data.deletions;
  const additions = out_data.additions;
  const linkers = out_data.linkers;
  const rings = out_data.ring;
  let outList = [];

  for (let d in deletions) {
    outList.push(generateArrowObject(data, deletions[d][0], deletions[d][1], d, colour));
  }

  for (let a in additions) {
    outList.push(generateArrowObject(data, additions[a][0], additions[a][1], a, colour));
  }

  for (let l in linkers) {
    outList.push(generateCylinderObject(data, linkers[l][0], linkers[l][1], l, colour));
  }

  for (let r in rings) {
    outList.push(generateCylinderObject(data, rings[r][0], rings[r][2], r, colour));
  }
  return outList;
};

const generateBondColorMap = inputDict => {
  var out_d = {};
  for (let keyItem in inputDict) {
    for (let vector in inputDict[keyItem]) {
      const vect = vector.split('_')[0];
      out_d[vect] = inputDict[keyItem][vector];
    }
  }
  return out_d;
};

const getViewUrl = (get_view, data) => {
  const url = new URL(base_url + '/api/' + get_view + '/' + data.id + '/');
  return url;
};

const handleVector = (json, stage, data) => (dispatch, getState) => {
  const state = getState();
  const { vector_list, compoundsOfVectors } = state.selectionReducers;

  var objList = generateObjectList(json['3d'], data);
  dispatch(setVectorList([...vector_list, ...objList]));

  const currentVectorCompounds = compoundsOfVectors && compoundsOfVectors[data.smiles];

  // loading vector objects
  objList.map(item =>
    dispatch(
      loadObject({
        target: {
          display_div: VIEWS.MAJOR_VIEW,
          ...getVectorWithColorByCountOfCompounds(item, currentVectorCompounds)
        },
        stage,
        orientationMatrix: null
      })
    )
  );
  var vectorBondColorMap = generateBondColorMap(json['indices']);
  dispatch(updateBondColorMapOfCompounds(data.smiles, vectorBondColorMap));
};

export const addVector = (stage, data, skipTracking = false) => async (dispatch, getState) => {
  const currentVector = getState().selectionReducers.currentVector;

  dispatch(incrementCountOfPendingVectorLoadRequests());
  dispatch(appendVectorOnList(generateMoleculeId(data), skipTracking));
  dispatch(selectVectorAndResetCompounds(currentVector));

  return api({ url: getViewUrl('graph', data) })
    .then(response => {
      const result = response.data.graph;
      var new_dict = {};
      // Uniquify
      if (result) {
        Object.keys(result).forEach(key => {
          var smiSet = new Set();
          new_dict[key] = {};
          new_dict[key]['addition'] = [];
          new_dict[key]['vector'] = result[key]['vector'];
          Object.keys(result[key]['addition']).forEach(index => {
            var newSmi = result[key]['addition'][index]['end'];
            if (smiSet.has(newSmi) !== true) {
              new_dict[key]['addition'].push(result[key]['addition'][index]);
              smiSet.add(newSmi);
            }
          });
        });
      }
      return dispatch(updateVectorCompounds(data.smiles, new_dict));
    })
    .then(() => api({ url: getViewUrl('vector', data) }))
    .then(response => dispatch(handleVector(response.data.vectors, stage, data)))
    .finally(() => {
      dispatch(decrementCountOfPendingVectorLoadRequests());
      const currentOrientation = stage.viewerControls.getOrientation();
      dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
    });
};

export const removeCurrentVector = currentMoleculeSmile => (dispatch, getState) => {
  const state = getState();
  const moleculeOfCurrentVector = getMoleculeOfCurrentVector(state);
  if (moleculeOfCurrentVector && moleculeOfCurrentVector.smiles === currentMoleculeSmile) {
    dispatch(setCurrentVector(null));
    dispatch(resetCurrentCompoundSettingsWithoutSelection([]));
  }
};

export const removeVector = (stage, data, skipTracking = false) => async (dispatch, getState) => {
  const state = getState();
  const vector_list = state.selectionReducers.vector_list;
  vector_list
    .filter(item => item.moleculeId === data.id)
    .forEach(item => dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item), stage)));

  await dispatch(removeCurrentVector(data.smiles));

  dispatch(updateVectorCompounds(data.smiles, undefined));
  dispatch(updateBondColorMapOfCompounds(data.smiles, undefined));
  dispatch(removeFromVectorOnList(generateMoleculeId(data), skipTracking));

  dispatch(setVectorList(vector_list.filter(item => item.moleculeId !== data.id)));
};

export const addHitProtein = (
  stage,
  data,
  colourToggle,
  skipTracking = false,
  representations = undefined
) => dispatch => {
  dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateHitProteinObject(data, colourToggle, base_url)),
      stage,
      previousRepresentations: representations,
      orientationMatrix: null
    })
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendProteinList(generateMoleculeId(data), skipTracking));
};

export const removeHitProtein = (stage, data, colourToggle, skipTracking = false) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateHitProteinObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromProteinList(generateMoleculeId(data), skipTracking));
};

export const addComplex = (
  stage,
  data,
  colourToggle,
  skipTracking = false,
  representations = undefined
) => dispatch => {
  dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
      stage,
      previousRepresentations: representations,
      orientationMatrix: null
    })
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendComplexList(generateMoleculeId(data), skipTracking));
};

export const removeComplex = (stage, data, colourToggle, skipTracking = false) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromComplexList(generateMoleculeId(data), skipTracking));
};

export const addSurface = (
  stage,
  data,
  colourToggle,
  skipTracking = false,
  representations = undefined
) => dispatch => {
  dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url)),
      stage,
      previousRepresentations: representations,
      orientationMatrix: null
    })
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendSurfaceList(generateMoleculeId(data), skipTracking));
};

export const removeSurface = (stage, data, colourToggle, skipTracking = false) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromSurfaceList(generateMoleculeId(data), skipTracking));
};

export const addDensity = (
  stage,
  data,
  colourToggle,
  isWireframeStyle,
  skipTracking = false,
  representations = undefined
) => dispatch => {
  // add default style by isWireframeStyle

  //dispatch(
  // loadObject({
  //   target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateDensityObject(data, colourToggle, base_url)),
  //   stage,
  //   previousRepresentations: representations,
  //   orientationMatrix: null
  // })
  // ).finally(() => {
  //   const currentOrientation = stage.viewerControls.getOrientation();
  //   dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  // });
  dispatch(appendDensityList(generateMoleculeId(data), skipTracking));
};

export const addDensityCustomView = (
  stage,
  data,
  colourToggle,
  isWireframeStyle,
  skipTracking = false,
  representations = undefined
) => dispatch => {
  // delete object at first (removeDensity)
  // load other object
  // swap other style by isWireframeStyle

  //dispatch(
  // loadObject({
  //   target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateDensityObject(data, colourToggle, base_url)),
  //   stage,
  //   previousRepresentations: representations,
  //   orientationMatrix: null
  // })
  // ).finally(() => {
  //   const currentOrientation = stage.viewerControls.getOrientation();
  //   dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  // });
  dispatch(appendDensityListCustom(generateMoleculeId(data), skipTracking));
};

export const removeDensity = (stage, data, colourToggle, skipTracking = false) => dispatch => {
  //dispatch(
  //  deleteObject(
  //   Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateDensityObject(data, colourToggle, base_url)),
  //   stage
  // )
  // );
  dispatch(removeFromDensityList(generateMoleculeId(data), skipTracking));
  dispatch(removeFromDensityListCustom(generateMoleculeId(data), true));
};

export const addLigand = (
  stage,
  data,
  colourToggle,
  centerOn = false,
  withQuality = false,
  skipTracking = false,
  representations = undefined
) => (dispatch, getState) => {
  const currentOrientation = stage.viewerControls.getOrientation();
  dispatch(appendFragmentDisplayList(generateMoleculeId(data), skipTracking));

  let moleculeObject = generateMoleculeObject(data, colourToggle);
  let qualityInformation = dispatch(readQualityInformation(moleculeObject.name, moleculeObject.sdf_info));

  let hasAdditionalInformation =
    withQuality === true && qualityInformation && qualityInformation.badids && qualityInformation.badids.length !== 0;
  if (hasAdditionalInformation) {
    dispatch(addInformation(data));
    dispatch(appendQualityList(generateMoleculeId(data), true));
  }

  return dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, moleculeObject),
      stage,
      previousRepresentations: representations,
      loadQuality: hasAdditionalInformation,
      quality: qualityInformation
    })
  ).finally(() => {
    const ligandOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, ligandOrientation));

    dispatch(appendMoleculeOrientation(data?.id, ligandOrientation));
    if (centerOn === false) {
      // keep current orientation of NGL View
      stage.viewerControls.orient(currentOrientation);
    }
  });
};

export const removeLigand = (stage, data, skipTracking = false, withVector = true) => dispatch => {
  dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data)), stage));
  dispatch(removeFromFragmentDisplayList(generateMoleculeId(data), skipTracking));
  dispatch(removeFromQualityList(generateMoleculeId(data), true));

  if (withVector === true) {
    // remove vector
    dispatch(removeVector(stage, data, skipTracking));
  }

  dispatch(removeInformation(data));
};

export const addQuality = (stage, data, colourToggle, skipTracking = false, representations = undefined) => (
  dispatch,
  getState
) => {
  dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data)), stage));
  dispatch(addLigand(stage, data, colourToggle, false, true, skipTracking, representations));
  dispatch(appendQualityList(generateMoleculeId(data), skipTracking));
};

export const removeQuality = (stage, data, colourToggle, skipTracking = false) => dispatch => {
  dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data)), stage));
  dispatch(addLigand(stage, data, colourToggle, false, false, skipTracking));
  dispatch(removeFromQualityList(generateMoleculeId(data), skipTracking));
};

export const addInformation = data => dispatch => {
  dispatch(appendInformationList(generateMoleculeId(data)));
};

export const removeInformation = data => dispatch => {
  dispatch(removeFromInformationList(generateMoleculeId(data)));
};

/**
 * Turn on the complex of the first ligand of the site
 */
export const initializeMolecules = (majorView, moleculeList, first) => dispatch => {
  if (moleculeList && majorView) {
    const firstMolecule = first || moleculeList[0];
    if (firstMolecule) {
      dispatch(addHitProtein(majorView, firstMolecule, colourList[firstMolecule.id % colourList.length]));
      dispatch(addLigand(majorView, firstMolecule, colourList[firstMolecule.id % colourList.length], true, true));
    }
  }
};

export const hideAllSelectedMolecules = (stage, currentMolecules, isHideAll, skipTracking) => (dispatch, getState) => {
  const state = getState();
  const fragmentDisplayList = state.selectionReducers.fragmentDisplayList;
  const complexList = state.selectionReducers.complexList;
  const vectorOnList = state.selectionReducers.vectorOnList;
  const surfaceList = state.selectionReducers.surfaceList;
  const proteinList = state.selectionReducers.proteinList;
  const densityList = state.selectionReducers.densityList;
  const densityListCustom = state.selectionReducers.densityListCustom;
  const qualityList = state.selectionReducers.qualityList;

  let ligandDataList = [];
  let complexDataList = [];
  let vectorOnDataList = [];
  let surfaceDataList = [];
  let proteinDataList = [];
  let densityDataList = [];
  let densityDataListCustom = [];
  let qualityDataList = [];

  fragmentDisplayList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      ligandDataList.push(data);
      dispatch(removeLigand(stage, data, skipTracking));
    }
  });
  complexList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      complexDataList.push(data);
      dispatch(removeComplex(stage, data, colourList[0], skipTracking));
    }
  });
  vectorOnList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      vectorOnDataList.push(data);
      dispatch(removeVector(stage, data, skipTracking));
    }
  });

  // remove Surface
  surfaceList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      surfaceDataList.push(data);
      dispatch(removeSurface(stage, data, colourList[0], skipTracking));
    }
  });

  // remove Protein
  proteinList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      proteinDataList.push(data);
      dispatch(removeHitProtein(stage, data, colourList[0], skipTracking));
    }
  });

  densityList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      densityDataList.push(data);
      dispatch(removeDensity(stage, data, colourList[0], skipTracking));
    }
  });

  densityListCustom.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      densityDataListCustom.push(data);
      dispatch(removeDensity(stage, data, colourList[0], skipTracking));
    }
  });

  qualityList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      qualityList.push(data);
      dispatch(removeQuality(stage, data, colourList[0], skipTracking));
    }
  });

  // vector_list
  dispatch(setVectorList([]));
  dispatch(resetCompoundsOfVectors());
  dispatch(resetBondColorMapOfVectors());
  dispatch(setCompoundImage(noCompoundImage));

  let data = {
    ligandList: ligandDataList,
    proteinList: proteinDataList,
    complexList: complexDataList,
    surfaceList: surfaceDataList,
    vectorOnList: vectorOnDataList,
    qualityList: qualityDataList,
    densityList: densityDataList,
    densityListCustom: densityDataListCustom
  };

  if (isHideAll === true) {
    dispatch(setHideAll(data));
  }
};

export const moveSelectedMolSettings = (stage, item, newItem, data, skipTracking) => (dispatch, getState) => {
  if (newItem && data) {
    if (data.isLigandOn) {
      let representations = getRepresentationsByType(data.objectsInView, item, OBJECT_TYPE.LIGAND);
      dispatch(addLigand(stage, newItem, data.colourToggle, false, data.isQualityOn, skipTracking, representations));
    }
    if (data.isProteinOn) {
      let representations = getRepresentationsByType(data.objectsInView, item, OBJECT_TYPE.HIT_PROTEIN);
      dispatch(addHitProtein(stage, newItem, data.colourToggle, skipTracking, representations));
    }
    if (data.isComplexOn) {
      let representations = getRepresentationsByType(data.objectsInView, item, OBJECT_TYPE.COMPLEX);
      dispatch(addComplex(stage, newItem, data.colourToggle, skipTracking, representations));
    }
    if (data.isSurfaceOn) {
      let representations = getRepresentationsByType(data.objectsInView, item, OBJECT_TYPE.SURFACE);
      dispatch(addSurface(stage, newItem, data.colourToggle, skipTracking, representations));
    }
    if (data.isQualityOn) {
      let representations = getRepresentationsByType(data.objectsInView, item, OBJECT_TYPE.QUALITY);
      dispatch(addQuality(stage, newItem, data.colourToggle, skipTracking, representations));
    }
    if (data.isDensityOn) {
      let representations = getRepresentationsByType(data.objectsInView, item, OBJECT_TYPE.DENSITY);
      dispatch(addDensity(stage, newItem, data.colourToggle, skipTracking, representations));
    }
    if (data.isDensityCustomOn) {
      let representations = getRepresentationsByType(data.objectsInView, item, OBJECT_TYPE.DENSITY);
      dispatch(addDensityCustomView(stage, newItem, data.colourToggle, skipTracking, representations));
    }
    if (data.isVectorOn) {
      dispatch(addVector(stage, newItem, skipTracking)).catch(error => {
        throw new Error(error);
      });
    }
  }
};

export const removeAllSelectedMolTypes = (majorViewStage, molecules, skipTracking, isInspiration) => (
  dispatch,
  getState
) => {
  const state = getState();
  const fragmentDisplayList = state.selectionReducers.fragmentDisplayList;
  const complexList = state.selectionReducers.complexList;
  const vectorOnList = state.selectionReducers.vectorOnList;
  const surfaceList = state.selectionReducers.surfaceList;
  const proteinList = state.selectionReducers.proteinList;
  const densityList = state.selectionReducers.densityList;
  const densityListCustom = state.selectionReducers.densityListCustom;
  const qualityList = state.selectionReducers.qualityList;
  let joinedMoleculeLists = molecules;

  proteinList?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);
    foundedMolecule = foundedMolecule && Object.assign({ isInspiration: isInspiration }, foundedMolecule);

    dispatch(
      removeHitProtein(
        majorViewStage,
        foundedMolecule,
        colourList[foundedMolecule.id % colourList.length],
        skipTracking
      )
    );
  });
  complexList?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);
    foundedMolecule = foundedMolecule && Object.assign({ isInspiration: isInspiration }, foundedMolecule);
    dispatch(
      removeComplex(majorViewStage, foundedMolecule, colourList[foundedMolecule.id % colourList.length], skipTracking)
    );
  });
  fragmentDisplayList?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);
    foundedMolecule = foundedMolecule && Object.assign({ isInspiration: isInspiration }, foundedMolecule);
    dispatch(removeLigand(majorViewStage, foundedMolecule, skipTracking));
  });
  surfaceList?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);
    foundedMolecule = foundedMolecule && Object.assign({ isInspiration: isInspiration }, foundedMolecule);
    dispatch(
      removeSurface(majorViewStage, foundedMolecule, colourList[foundedMolecule.id % colourList.length], skipTracking)
    );
  });
  qualityList?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);
    foundedMolecule = foundedMolecule && Object.assign({ isInspiration: isInspiration }, foundedMolecule);
    dispatch(
      removeQuality(majorViewStage, foundedMolecule, colourList[foundedMolecule.id % colourList.length], skipTracking)
    );
  });
  densityList?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);
    foundedMolecule = foundedMolecule && Object.assign({ isInspiration: isInspiration }, foundedMolecule);
    dispatch(
      removeDensity(majorViewStage, foundedMolecule, colourList[foundedMolecule.id % colourList.length], skipTracking)
    );
  });
  densityListCustom?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);
    foundedMolecule = foundedMolecule && Object.assign({ isInspiration: isInspiration }, foundedMolecule);
    dispatch(
      removeDensity(majorViewStage, foundedMolecule, colourList[foundedMolecule.id % colourList.length], skipTracking)
    );
  });
  vectorOnList?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);
    foundedMolecule = foundedMolecule && Object.assign({ isInspiration: isInspiration }, foundedMolecule);
    dispatch(removeVector(majorViewStage, foundedMolecule, skipTracking));
  });
};

// export const searchMoleculeGroupByMoleculeID = moleculeID => (dispatch, getState) =>
//   api({ url: `${base_url}/api/molgroup/?mol_id=${moleculeID}` }).then(response => {
//     let resultMolGroupID = null;
//     const molGroupID = response?.data?.results[0]?.id;
//     const mol_group_list = getState().apiReducers.mol_group_list;

//     if (mol_group_list && Array.isArray(mol_group_list) && molGroupID) {
//       mol_group_list.forEach((item, index) => {
//         if (item.id === molGroupID) {
//           resultMolGroupID = index + 1;
//         }
//       });
//     }
//     return Promise.resolve(resultMolGroupID);
//   });

export const searchMoleculeGroupByMoleculeID = moleculeId => (dispatch, getState) => {
  const state = getState();
  const all_mol_lists = state.apiReducers.all_mol_lists;

  let resultMolGroupID = null;
  const molGroupIds = Object.keys(all_mol_lists);
  for (let groupId of molGroupIds) {
    const mols = all_mol_lists[groupId];
    for (let mol of mols) {
      if (mol.id === moleculeId) {
        resultMolGroupID = groupId;
        break;
      }
    }
    if (resultMolGroupID != null) {
      break;
    }
  }

  return Promise.resolve(resultMolGroupID);
};

export const applyDirectSelection = (stage, stageSummaryView) => (dispatch, getState) => {
  const state = getState();

  const directDisplay = state.apiReducers.direct_access;
  const fragmentDisplayList = state.selectionReducers.fragmentDisplayList;
  const proteinList = state.selectionReducers.proteinList;
  const complexList = state.selectionReducers.complexList;
  const surfaceList = state.selectionReducers.surfaceList;
  const vectorOnList = state.selectionReducers.vectorOnList;
  const mol_group_list = state.apiReducers.mol_group_list;
  const directAccessProcessed = state.apiReducers.direct_access_processed;

  if (!directAccessProcessed && directDisplay && directDisplay.molecules && directDisplay.molecules.length > 0) {
    const allMols = state.apiReducers.all_mol_lists;
    //const molGroupMap = getMolGroupNameToId();
    directDisplay.molecules.forEach(m => {
      let keys = Object.keys(allMols);
      let directProteinNameModded = m.name.toLowerCase();
      let directProteinCodeModded = `${directDisplay.target.toLowerCase()}-${directProteinNameModded}`;
      for (let groupIndex = 0; groupIndex < keys.length; groupIndex++) {
        let groupId = keys[groupIndex];
        let molList = allMols[groupId];
        let molCount = molList.length;
        for (let molIndex = 0; molIndex < molCount; molIndex++) {
          let mol = molList[molIndex];
          let proteinCodeModded = mol.protein_code.toLowerCase();
          if (
            m.exact
              ? proteinCodeModded === directProteinCodeModded
              : proteinCodeModded.includes(directProteinNameModded)
          ) {
            let molGroupId = groupId;
            // Has to be declared here because otherwise we read stale value
            const mol_group_selection = getState().selectionReducers.mol_group_selection;
            if (!mol_group_selection.includes(parseInt(molGroupId))) {
              let molGroup = mol_group_list.find(g => g.id === parseInt(molGroupId));
              dispatch(selectMoleculeGroup(molGroup, stageSummaryView));
            }
            if (m.L && !fragmentDisplayList.includes(mol.id)) {
              dispatch(addLigand(stage, mol, colourList[mol.id % colourList.length], true));
            }
            if (m.P && !proteinList.includes(mol.id)) {
              dispatch(addHitProtein(stage, mol, colourList[mol.id % colourList.length]));
            }
            if (m.C && !complexList.includes(mol.id)) {
              dispatch(addComplex(stage, mol, colourList[mol.id % colourList.length]));
            }
            if (m.S && !surfaceList.includes(mol.id)) {
              dispatch(addSurface(stage, mol, colourList[mol.id % colourList.length]));
            }
            if (m.V && !vectorOnList.includes(mol.id)) {
              dispatch(addVector(stage, mol, colourList[mol.id % colourList.length]));
            }
          }
        }
      }
    });
    // dispatch(setDirectAccess({}));
    dispatch(setDirectAccessProcessed(true));
  }
};

export const getMolImage = (molId, molType, width, height) => (dispatch, getState) => {
  const state = getState();

  const imageCache = state.previewReducers.molecule.imageCache;

  const molIdStr = molId.toString();
  if (imageCache.hasOwnProperty(molIdStr)) {
    return new Promise((resolve, reject) => {
      resolve(imageCache[molIdStr]);
    });
  } else {
    return loadMolImage(molId, molType, width, height).then(i => {
      if (!imageCache.hasOwnProperty(molIdStr)) {
        dispatch(addImageToCache(molId.toString(), i));
      }
      return i;
    });
  }
};

export const loadMolImage = (molId, molType, width, height) => {
  let url = undefined;
  if (molType === MOL_TYPE.HIT) {
    url = new URL(`${base_url}/api/molimg/${molId}/`);
    url.searchParams.append('width', width);
    url.searchParams.append('height', height);
  } else if (molType === MOL_TYPE.DATASET) {
    url = new URL(`${base_url}/viewer/img_from_smiles/`);
    url.searchParams.append('width', width);
    url.searchParams.append('height', height);
    url.searchParams.append('smiles', molId);
  } else {
    console.error('Trying to load image for unknown molecule type.');
    return Promise.resolve();
  }

  let onCancel = () => {};
  return api({
    url,
    onCancel
  }).then(response => {
    if (molType === MOL_TYPE.HIT) {
      return response.data['mol_image'];
    } else {
      return response.data;
    }
  });
};
