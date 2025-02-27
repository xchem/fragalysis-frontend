import { deleteObject, loadObject, setOrientation } from '../../../../reducers/ngl/dispatchActions';
import {
  appendQualityList,
  appendInformationList,
  removeFromFragmentDisplayList,
  removeFromQualityList,
  resetCompoundsOfVectors,
  setVectorList,
  updateBondColorMapOfCompounds,
  resetBondColorMapOfVectors,
  setCurrentVector,
  setHideAll,
  removeFromInformationList,
  setArrowUpDown,
  setMolListToEdit,
  setSelectAllMolecules,
  setUnselectAllMolecules,
  setTagEditorOpen,
  setMoleculeForTagEdit,
  setSelectVisiblePoses,
  setUnselectVisiblePoses,
  appendToBeDisplayedList,
  updateInToBeDisplayedList
} from '../../../../reducers/selection/actions';
import { base_url } from '../../../routes/constants';
import {
  generateArrowObject,
  generateMoleculeId,
  generateCylinderObject,
  getVectorWithColorByCountOfCompounds,
  generateDensityObject,
  generateMoleculeObject
} from '../../../nglView/generatingObjects';
import { VIEWS } from '../../../../constants/constants';
import { api } from '../../../../utils/api';
import { colourList } from '../utils/color';
import { setNglViewParams } from '../../../../reducers/ngl/actions';
import { setCompoundImage } from '../../summary/redux/actions';
import { noCompoundImage } from '../../summary/redux/reducer';
import { getMoleculeOfCurrentVector } from '../../../../reducers/selection/selectors';
import { resetCurrentCompoundSettingsWithoutSelection } from '../../compounds/redux/actions';
import {
  removeLHSCompound,
  setDirectAccessProcessed,
  updateLHSCompound,
  updateMoleculeInMolLists
} from '../../../../reducers/api/actions';
import { MOL_TYPE } from './constants';
import { addImageToCache, disableMoleculeNglControlButton, enableMoleculeNglControlButton } from './actions';
import { OBJECT_TYPE, DENSITY_MAPS, NGL_PARAMS } from '../../../nglView/constants';
import { getRepresentationsByType } from '../../../nglView/generatingObjects';
import { readQualityInformation } from '../../../nglView/renderingHelpers';
import { addSelectedTag } from '../../tags/redux/dispatchActions';
import { selectJoinedMoleculeList } from './selectors';
import { compareTagsAsc } from '../../tags/utils/tagUtils';
import { createPoseApi, updatePoseApi } from '../api/poseApi';
import { NGL_OBJECTS } from '../../../../reducers/ngl/constants';
// import { molFile, pdbApo } from './testData';

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
  const out_d = {};
  for (let keyItem in inputDict) {
    for (let vector in inputDict[keyItem]) {
      const vect = vector.split('_')[0];
      out_d[vect] = inputDict[keyItem][vector];
    }
  }
  return out_d;
};

export const autoHideTagEditorDialogsOnScroll = ({ tagEditorRef, scrollBarRef }) => (dispatch, getState) => {
  const state = getState();
  const isOpenTagEditor = state.selectionReducers.tagEditorOpened;

  const currentBoundingClientRectTagEdit =
    (tagEditorRef.current && tagEditorRef.current.getBoundingClientRect()) || null;

  const scrollBarBoundingClientRect = (scrollBarRef.current && scrollBarRef.current.getBoundingClientRect()) || null;

  if (
    isOpenTagEditor &&
    currentBoundingClientRectTagEdit !== null &&
    scrollBarBoundingClientRect !== null &&
    currentBoundingClientRectTagEdit.x !== 0 &&
    currentBoundingClientRectTagEdit.y !== 0
  ) {
    if (
      Math.round(currentBoundingClientRectTagEdit.top) < Math.round(scrollBarBoundingClientRect.top) ||
      Math.abs(scrollBarBoundingClientRect.bottom - currentBoundingClientRectTagEdit.top) < 42
    ) {
      dispatch(setTagEditorOpen(false));
      dispatch(setMoleculeForTagEdit([]));
    }
  }
};

export const getViewUrl = (get_view, data) => {
  const url = new URL(base_url + '/api/' + get_view + '/' + data.id + '/');
  return url;
};

export const handleVector = (json, stage, data) => (dispatch, getState) => {
  const state = getState();
  const { vector_list, compoundsOfVectors } = state.selectionReducers;

  const objList = generateObjectList(json['3d'], data);
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
  const vectorBondColorMap = generateBondColorMap(json['indices']);
  dispatch(updateBondColorMapOfCompounds(data.smiles, vectorBondColorMap));
};

export const addVector = (stage, data, skipTracking = false) => async (dispatch, getState) => {
  dispatch(
    appendToBeDisplayedList({
      type: NGL_OBJECTS.VECTOR,
      id: data.id,
      display: true,
      center: false
    })
  );
};

export const removeCurrentVector = currentMoleculeSmile => (dispatch, getState) => {
  const state = getState();
  const moleculeOfCurrentVector = getMoleculeOfCurrentVector(state);
  if (moleculeOfCurrentVector && moleculeOfCurrentVector.smiles === currentMoleculeSmile) {
    dispatch(setCurrentVector(null));
    dispatch(resetCurrentCompoundSettingsWithoutSelection([]));
  }
};

export const removeVector = (stage, data, skipTracking = false) => (dispatch, getState) => {
  dispatch(updateInToBeDisplayedList({ id: data.id, display: false, type: NGL_OBJECTS.VECTOR }));
};

export const addComplex = (
  stage,
  data,
  colourToggle,
  skipTracking = false,
  representations = undefined,
  preserveColour = false
) => async dispatch => {
  dispatch(
    appendToBeDisplayedList({
      type: NGL_OBJECTS.COMPLEX,
      id: data.id,
      display: true,
      representations: representations,
      preserveColour: preserveColour,
      center: false
    })
  );
};

export const removeComplex = (stage, data, colourToggle, skipTracking = false) => dispatch => {
  dispatch(updateInToBeDisplayedList({ id: data.id, display: false, type: NGL_OBJECTS.COMPLEX }));
};

export const addSurface = (
  stage,
  data,
  colourToggle,
  skipTracking = false,
  representations = undefined,
  preserveColour = false
) => async dispatch => {
  dispatch(
    appendToBeDisplayedList({
      type: NGL_OBJECTS.SURFACE,
      id: data.id,
      display: true,
      representations: representations,
      preserveColour: preserveColour,
      center: false
    })
  );
};

export const removeSurface = (stage, data, colourToggle, skipTracking = false) => dispatch => {
  dispatch(updateInToBeDisplayedList({ id: data.id, display: false, type: NGL_OBJECTS.SURFACE }));
};

export const getDensityMapData = data => dispatch => {
  return dispatch(getProteinData(data))
    .then(i => {
      let proteinData = i;
      data.proteinData = proteinData;
      if (proteinData.sigmaa_info || proteinData.diff_info) {
        return true;
      }
      return false;
    })
    .catch(error => {
      throw new Error(error);
    });
};

export const addDensity = (
  stage,
  data,
  colourToggle,
  isWireframeStyle,
  skipTracking = false,
  representations = undefined
) => (dispatch, getState) => {
  if (data.proteinData) {
    return dispatch(setDensity(stage, data, colourToggle, isWireframeStyle, skipTracking, representations));
  }

  return dispatch(getDensityMapData(data)).then(() => {
    return dispatch(setDensity(stage, data, colourToggle, isWireframeStyle, skipTracking, representations));
  });
};

const setDensity = (
  stage,
  data,
  colourToggle,
  isWireframeStyle,
  skipTracking = false,
  representations = undefined
) => async (dispatch, getState) => {
  dispatch(
    appendToBeDisplayedList({
      type: NGL_OBJECTS.DENSITY,
      id: data.id,
      display: true,
      representations: representations,
      isWireframeStyle: isWireframeStyle,
      densityData: data.proteinData,
      center: false
    })
  );
};

export const getDensityChangedParams = (isWireframeStyle = undefined) => (dispatch, getState) => {
  const state = getState();
  const viewParams = state.nglReducers.viewParams;

  return {
    isolevel_DENSITY: viewParams[NGL_PARAMS.isolevel_DENSITY],
    boxSize_DENSITY: viewParams[NGL_PARAMS.boxSize_DENSITY],
    opacity_DENSITY: viewParams[NGL_PARAMS.opacity_DENSITY],
    contour_DENSITY: isWireframeStyle !== undefined ? isWireframeStyle : viewParams[NGL_PARAMS.contour_DENSITY],
    color_DENSITY: viewParams[NGL_PARAMS.color_DENSITY],
    isolevel_DENSITY_MAP_sigmaa: viewParams[NGL_PARAMS.isolevel_DENSITY_MAP_sigmaa],
    boxSize_DENSITY_MAP_sigmaa: viewParams[NGL_PARAMS.boxSize_DENSITY_MAP_sigmaa],
    opacity_DENSITY_MAP_sigmaa: viewParams[NGL_PARAMS.opacity_DENSITY_MAP_sigmaa],
    contour_DENSITY_MAP_sigmaa:
      isWireframeStyle !== undefined ? isWireframeStyle : viewParams[NGL_PARAMS.contour_DENSITY_MAP_sigmaa],
    color_DENSITY_MAP_sigmaa: viewParams[NGL_PARAMS.color_DENSITY_MAP_sigmaa],
    isolevel_DENSITY_MAP_diff: viewParams[NGL_PARAMS.isolevel_DENSITY_MAP_diff],
    boxSize_DENSITY_MAP_diff: viewParams[NGL_PARAMS.boxSize_DENSITY_MAP_diff],
    opacity_DENSITY_MAP_diff: viewParams[NGL_PARAMS.opacity_DENSITY_MAP_diff],
    contour_DENSITY_MAP_diff:
      isWireframeStyle !== undefined ? isWireframeStyle : viewParams[NGL_PARAMS.contour_DENSITY_MAP_diff],
    color_DENSITY_MAP_diff: viewParams[NGL_PARAMS.color_DENSITY_MAP_diff],
    color_DENSITY_MAP_diff_negate: viewParams[NGL_PARAMS.color_DENSITY_MAP_diff_negate]
  };
};

export const addDensityCustomView = (
  stage,
  data,
  colourToggle,
  isWireframeStyle,
  skipTracking = false,
  representations = undefined
) => async (dispatch, getState) => {
  const state = getState();
  const viewParams = state.nglReducers.viewParams;
  if (data.proteinData) {
    return dispatch(setDensityCustom(stage, data, colourToggle, isWireframeStyle, skipTracking, representations));
  } else {
    await dispatch(getDensityMapData(data));
    return dispatch(setDensityCustom(stage, data, colourToggle, isWireframeStyle, skipTracking, representations));
  }
};

export const toggleDensityWireframe = (currentWireframeSetting, densityData) => dispatch => {
  const invertedWireframe = !currentWireframeSetting;
  dispatch(setNglViewParams(NGL_PARAMS.contour_DENSITY, invertedWireframe));
  dispatch(setNglViewParams(NGL_PARAMS.contour_DENSITY_MAP_sigmaa, invertedWireframe));
  dispatch(setNglViewParams(NGL_PARAMS.contour_DENSITY_MAP_diff, invertedWireframe));

  if (densityData) {
    densityData.contour_DENSITY = invertedWireframe;
    densityData.contour_DENSITY_MAP_sigmaa = invertedWireframe;
    densityData.contour_DENSITY_MAP_diff = invertedWireframe;
  } else {
    densityData = {};
  }

  return { ...densityData };
};

const setDensityCustom = (
  stage,
  data,
  colourToggle,
  isWireframeStyle,
  skipTracking = false,
  representations = undefined
) => async (dispatch, getState) => {
  dispatch(
    appendToBeDisplayedList({
      type: NGL_OBJECTS.DENSITY_CUSTOM,
      id: data.id,
      display: true,
      representations: representations,
      isWireframeStyle: isWireframeStyle,
      densityData: data.proteinData,
      center: false
    })
  );
};

export const removeDensity = (
  stage,
  data,
  colourToggle,
  isWireframeStyle,
  skipTracking = false,
  representations = undefined
) => dispatch => {
  dispatch(
    updateInToBeDisplayedList({
      id: data.id,
      display: false,
      isWireframeStyle: isWireframeStyle,
      type: NGL_OBJECTS.DENSITY_CUSTOM
    })
  );
};

export const deleteDensityObject = (data, colourToggle, stage, isWireframeStyle) => dispatch => {
  const densityObject = generateDensityObject(data, colourToggle, base_url, isWireframeStyle);
  dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, densityObject), stage));

  let sigmaDensityObject = Object.assign({ ...densityObject, name: densityObject.name + DENSITY_MAPS.SIGMAA });
  dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, sigmaDensityObject), stage));

  let diffDensityObject = Object.assign({ ...densityObject, name: densityObject.name + DENSITY_MAPS.DIFF });
  dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, diffDensityObject), stage));

  return densityObject;
};

export const addHitProtein = (
  stage,
  data,
  colourToggle,
  withQuality = false,
  skipTracking = false,
  representations = undefined,
  preserveColour = false
) => async dispatch => {
  dispatch(
    appendToBeDisplayedList({
      type: NGL_OBJECTS.PROTEIN,
      id: data.id,
      display: true,
      withQuality: withQuality,
      representations: representations,
      preserveColour: preserveColour,
      center: false
    })
  );
};

export const removeHitProtein = (stage, data, colourToggle, skipTracking = false) => dispatch => {
  dispatch(updateInToBeDisplayedList({ id: data.id, display: false, type: NGL_OBJECTS.PROTEIN }));
};

export const addLigand = (
  stage,
  data,
  colourToggle,
  centerOn = false,
  withQuality = false,
  skipTracking = false,
  representations = undefined
) => async (dispatch, getState) => {
  dispatch(
    appendToBeDisplayedList({
      type: NGL_OBJECTS.LIGAND,
      id: data.id,
      display: true,
      center: centerOn,
      withQuality: withQuality,
      representations: representations
    })
  );
};

export const removeLigand = (stage, data, skipTracking = false, withVector = true) => dispatch => {
  dispatch(
    updateInToBeDisplayedList({ id: data.id, display: false, withVector: withVector, type: NGL_OBJECTS.LIGAND })
  );
};

export const addQuality = (stage, data, colourToggle, skipTracking = false, representations = undefined) => (
  dispatch,
  getState
) => {
  dispatch(removeFromFragmentDisplayList(generateMoleculeId(data)));
  dispatch(removeFromQualityList(generateMoleculeId(data)));
  dispatch(updateInToBeDisplayedList({ id: data.id, display: false, type: NGL_OBJECTS.LIGAND }));
  // dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data)), stage));
  dispatch(appendQualityList(generateMoleculeId(data), skipTracking));
  return dispatch(addLigand(stage, data, colourToggle, false, true, true, representations));
};

export const removeQuality = (stage, data, colourToggle, skipTracking = false) => dispatch => {
  dispatch(removeFromFragmentDisplayList(generateMoleculeId(data)));
  dispatch(removeFromQualityList(generateMoleculeId(data)));
  dispatch(updateInToBeDisplayedList({ id: data.id, display: false, type: NGL_OBJECTS.LIGAND }));
  // dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data)), stage));
  dispatch(addLigand(stage, data, colourToggle, false, false, true));
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
export const initializeMolecules = majorView => (dispatch, getState) => {
  if (majorView) {
    const state = getState();
    const noTagsReceived = state.apiReducers.noTagsReceived;
    const isSnapshot = state.apiReducers.isSnapshot;
    const isDirectDisplay = Object.keys(state.apiReducers.direct_access || {})?.length > 0;

    if (!isSnapshot && !isDirectDisplay) {
      const firstTag = dispatch(getFirstTagAlphabetically());
      let firstMolecule = null;
      if (firstTag) {
        dispatch(addSelectedTag(firstTag));
        // firstMolecule = dispatch(getFirstMoleculeForTag(firstTag.id));
      } else if (noTagsReceived) {
        // firstMolecule = dispatch(getFirstMolecule());
      }
      firstMolecule = dispatch(getFirstMolOfFirstCompound(firstTag));
      if (firstMolecule) {
        dispatch(addHitProtein(majorView, firstMolecule, colourList[firstMolecule.id % colourList.length], true)).then(
          () => {
            dispatch(addLigand(majorView, firstMolecule, colourList[firstMolecule.id % colourList.length], true, true));
          }
        );
      }
    }
  }
};

export const getFirstTag = () => (dispatch, getState) => {
  const siteCategoryId = dispatch(getSiteCategoryId());
  if (siteCategoryId) {
    const state = getState();
    const tagsList = state.apiReducers.tagList;
    const foundTags = tagsList.filter(t => t.category === siteCategoryId);
    return foundTags && foundTags.length > 0 ? foundTags[0] : null;
  } else {
    return null;
  }
};

export const getFirstTagAlphabetically = () => (dispatch, getState) => {
  const state = getState();
  const tagsList = state.apiReducers.tagList;
  const newTagList = tagsList.filter(t => {
    if (t.additional_info?.downloadName || t.hidden) {
      return false;
    } else {
      return true;
    }
  });
  const sortedTags = newTagList.sort(compareTagsAsc);
  return sortedTags && sortedTags.length > 0 ? sortedTags[0] : null;
};

export const getFirstMolOfFirstCompound = tag => (dispatch, getState) => {
  const state = getState();
  const compoundsList = state.apiReducers.lhs_compounds_list;
  const firstCompound = compoundsList?.find(c => c.associatedObs.some(obs => obs.tags_set.includes(tag.id)));
  if (firstCompound) {
    let firstObs = null;
    firstObs = firstCompound.associatedObs.find(obs => obs.tags_set.includes(tag.id));

    return firstObs;
  } else {
    return null;
  }
};

export const getFirstMoleculeForTag = tagId => (dispatch, getState) => {
  const state = getState();
  const molList = state.apiReducers.all_mol_lists;
  const molsForTag = molList.filter(mol => {
    const tags = mol.tags_set.filter(id => id === tagId);
    if (tags && tags.length > 0) {
      return true;
    } else {
      return false;
    }
  });
  return molsForTag && molsForTag.length > 0 ? molsForTag[0] : null;
};

export const getFirstMolecule = () => (dispatch, getState) => {
  const state = getState();
  const molList = state.apiReducers.all_mol_lists;
  if (molList && molList.length > 0) {
    return molList[0];
  } else {
    return null;
  }
};

export const getSiteCategoryId = () => (dispatch, getState) => {
  const state = getState();
  const categoriesList = state.apiReducers.categoryList;
  const foundCategories = categoriesList.filter(c => c.category.toLowerCase('site'));
  if (foundCategories && foundCategories.length > 0) {
    return foundCategories[0].id;
  } else {
    return null;
  }
};

export const getCategoryById = categoryId => (dispatch, getState) => {
  const state = getState();
  const categoriesList = state.apiReducers.categoryList;
  const foundCategories = categoriesList.filter(c => c.id === categoryId);
  if (foundCategories && foundCategories.length > 0) {
    return foundCategories[0];
  } else {
    return null;
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
  const promises = [];
  if (newItem && data) {
    if (data.isLigandOn) {
      const ligandRepresentations = getRepresentationsByType(data.objectsInView, item, OBJECT_TYPE.LIGAND);
      promises.push(
        dispatch(
          addLigand(stage, newItem, data.colourToggle, false, data.isQualityOn, skipTracking, ligandRepresentations)
        )
      );
    }
    if (data.isProteinOn) {
      const proteinRepresentations = getRepresentationsByType(data.objectsInView, item, OBJECT_TYPE.HIT_PROTEIN);
      promises.push(dispatch(addHitProtein(stage, newItem, data.colourToggle, skipTracking, proteinRepresentations)));
    }
    if (data.isComplexOn) {
      const complaxRepresentations = getRepresentationsByType(data.objectsInView, item, OBJECT_TYPE.COMPLEX);
      promises.push(dispatch(addComplex(stage, newItem, data.colourToggle, skipTracking, complaxRepresentations)));
    }
    if (data.isSurfaceOn) {
      const surfaceRepresentations = getRepresentationsByType(data.objectsInView, item, OBJECT_TYPE.SURFACE);
      promises.push(dispatch(addSurface(stage, newItem, data.colourToggle, skipTracking, surfaceRepresentations)));
    }
    if (data.isQualityOn) {
      const qualityRepresentations = getRepresentationsByType(data.objectsInView, item, OBJECT_TYPE.QUALITY);
      promises.push(dispatch(addQuality(stage, newItem, data.colourToggle, skipTracking, qualityRepresentations)));
    }
    if (data.isDensityOn) {
      // const densityRepresentations = getRepresentationsForDensities(data.objectsInView, item, OBJECT_TYPE.DENSITY);
      // newItem.proteinData.render_event = item.proteinData.render_event;
      // newItem.proteinData.render_sigmaa = item.proteinData.render_sigmaa;
      // newItem.proteinData.render_diff = item.proteinData.render_diff;
      // dispatch(addDensity(stage, newItem, data.colourToggle, false, skipTracking, densityRepresentations));
    }
    if (data.isDensityCustomOn) {
      // const densityCustomRepresentations = getRepresentationsByType(data.objectsInView, item, OBJECT_TYPE.DENSITY);
      // dispatch(
      //   addDensityCustomView(stage, newItem, data.colourToggle, false, skipTracking, densityCustomRepresentations)
      // );
    }
    if (data.isVectorOn) {
      promises.push(dispatch(addVector(stage, newItem, skipTracking)));
    }
  }
  return Promise.all(promises);
};

export const removeSelectedMolTypes = (majorViewStage, molecules, skipTracking, isInspiration) => (
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

    if (foundedMolecule) {
      foundedMolecule = Object.assign({ isInspiration: isInspiration }, foundedMolecule);

      dispatch(
        removeHitProtein(
          majorViewStage,
          foundedMolecule,
          colourList[foundedMolecule.id % colourList.length],
          skipTracking
        )
      );
    }
  });
  complexList?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);

    if (foundedMolecule) {
      foundedMolecule = Object.assign({ isInspiration: isInspiration }, foundedMolecule);

      dispatch(
        removeComplex(majorViewStage, foundedMolecule, colourList[foundedMolecule.id % colourList.length], skipTracking)
      );
    }
  });
  fragmentDisplayList?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);

    if (foundedMolecule) {
      foundedMolecule = Object.assign({ isInspiration: isInspiration }, foundedMolecule);

      dispatch(removeLigand(majorViewStage, foundedMolecule, skipTracking));
    }
  });
  surfaceList?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);

    if (foundedMolecule) {
      foundedMolecule = Object.assign({ isInspiration: isInspiration }, foundedMolecule);

      dispatch(
        removeSurface(majorViewStage, foundedMolecule, colourList[foundedMolecule.id % colourList.length], skipTracking)
      );
    }
  });
  qualityList?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);

    if (foundedMolecule) {
      foundedMolecule = Object.assign({ isInspiration: isInspiration }, foundedMolecule);

      dispatch(
        removeQuality(majorViewStage, foundedMolecule, colourList[foundedMolecule.id % colourList.length], skipTracking)
      );
    }
  });
  densityList?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);

    if (foundedMolecule) {
      foundedMolecule = Object.assign({ isInspiration: isInspiration }, foundedMolecule);

      dispatch(
        removeDensity(majorViewStage, foundedMolecule, colourList[foundedMolecule.id % colourList.length], skipTracking)
      );
    }
  });
  densityListCustom?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);

    if (foundedMolecule) {
      foundedMolecule = Object.assign({ isInspiration: isInspiration }, foundedMolecule);

      dispatch(
        removeDensity(majorViewStage, foundedMolecule, colourList[foundedMolecule.id % colourList.length], skipTracking)
      );
    }
  });
  vectorOnList?.forEach(moleculeID => {
    let foundedMolecule = joinedMoleculeLists?.find(mol => mol.id === moleculeID);

    if (foundedMolecule) {
      foundedMolecule = Object.assign({ isInspiration: isInspiration }, foundedMolecule);

      dispatch(removeVector(majorViewStage, foundedMolecule, skipTracking));
    }
  });
};

export const applyDirectSelection = stage => (dispatch, getState) => {
  const state = getState();

  const directDisplay = state.apiReducers.direct_access;
  const fragmentDisplayList = state.selectionReducers.fragmentDisplayList;
  const proteinList = state.selectionReducers.proteinList;
  const complexList = state.selectionReducers.complexList;
  const surfaceList = state.selectionReducers.surfaceList;
  const vectorOnList = state.selectionReducers.vectorOnList;
  const directAccessProcessed = state.apiReducers.direct_access_processed;

  if (!directAccessProcessed && directDisplay && directDisplay.molecules && directDisplay.molecules.length > 0) {
    const allMols = state.apiReducers.all_mol_lists;
    directDisplay.molecules.forEach(m => {
      // let directProteinNameModded = m.name.toLowerCase();
      // let directProteinCodeModded = `${directDisplay.target.toLowerCase()}-${directProteinNameModded}`;
      const foundMols = dispatch(searchForObservations(m.name, allMols, m.searchSettings, m.exact));
      foundMols?.forEach(mol => {
        if (mol) {
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
      });
    });
    // dispatch(setDirectAccess({}));
    dispatch(setDirectAccessProcessed(true));
  }
};

export const getQualityInformation = (data, molType, width, height) => (dispatch, getState) => {
  if (!data) return null;
  let moleculeObject = generateMoleculeObject(data);
  let qualityInformation = dispatch(readQualityInformation(moleculeObject.name, data.ligand_mol_file));

  let hasAdditionalInformation =
    qualityInformation &&
    ((qualityInformation.badids && qualityInformation.badids.length !== 0) ||
      (qualityInformation.badproteinids && qualityInformation.badproteinids.length !== 0));
  if (hasAdditionalInformation) {
    dispatch(addInformation(data));
  }
};

export const getProteinData = molecule => dispatch => {
  return new Promise((resolve, reject) => {
    resolve(molecule.proteinData);
  });
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

/**
 * Performance optimization for moleculeView. Gets objectsInView and passes it to further dispatch requests. It wouldnt
 * do anything else in moleculeView.
 */
export const moveMoleculeUpDown = (stage, item, newItem, data, direction) => async (dispatch, getState) => {
  const objectsInView = getState().nglReducers.objectsInView;
  const dataValue = { ...data, objectsInView };

  await dispatch(moveSelectedMolSettings(stage, item, newItem, dataValue, true));
  dispatch(setArrowUpDown(item, newItem, direction, dataValue));
};

/**
 * Performance optimization for moleculeView, getting the joined molecule list and inspirations avoids a huge lag spike
 * after "Load full list" was selected in Hit Navigator
 */
export const removeSelectedTypesInHitNavigator = (skipMolecules, stage, skipTracking) => (dispatch, getState) => {
  const state = getState();
  const getJoinedMoleculeList = selectJoinedMoleculeList(state);
  const allInspirationMoleculeDataList = state.datasetsReducers.allInspirationMoleculeDataList;

  const molecules = [...getJoinedMoleculeList, ...allInspirationMoleculeDataList].filter(
    molecule => !skipMolecules.includes(molecule)
  );
  dispatch(removeSelectedMolTypes(stage, molecules, skipTracking, false));
};

export const withDisabledMoleculeNglControlButton = (moleculeId, type, callback) => async dispatch => {
  dispatch(disableMoleculeNglControlButton(moleculeId, type));
  await callback();
  dispatch(enableMoleculeNglControlButton(moleculeId, type));
};

export const withDisabledMoleculesNglControlButtons = (moleculeIds, type, callback) => async dispatch => {
  moleculeIds.forEach(moleculeId => {
    dispatch(disableMoleculeNglControlButton(moleculeId, type));
  });
  await callback();
  moleculeIds.forEach(moleculeId => {
    dispatch(enableMoleculeNglControlButton(moleculeId, type));
  });
};

export const selectAllHits = (allFilteredLhsCompounds, setNextXMolecules, unselect) => (dispatch, getState) => {
  if (setNextXMolecules) {
    dispatch(setNextXMolecules(allFilteredLhsCompounds?.length || 0));
  }
  const listOfIds = [];
  allFilteredLhsCompounds.forEach(cmp => {
    if (cmp.associatedObs?.length > 0 && cmp.main_site_observation) {
      const mainObs = cmp.associatedObs.find(obs => obs.id === cmp.main_site_observation);
      mainObs && listOfIds.push(mainObs.id);
    }
  });
  if (!unselect) {
    dispatch(setMolListToEdit(listOfIds));
    dispatch(setSelectAllMolecules(allFilteredLhsCompounds));
  } else {
    dispatch(setMolListToEdit([]));
    dispatch(setUnselectAllMolecules(allFilteredLhsCompounds));
  }
};

export const selectAllVisibleObservations = (visibleObservations, setNextXMolecules, unselect) => (
  dispatch,
  getState
) => {
  if (setNextXMolecules) {
    dispatch(setNextXMolecules(visibleObservations?.length || 0));
  }
  const listOfIds = visibleObservations.map(o => o.id);
  if (!unselect) {
    dispatch(setMolListToEdit(listOfIds));
    dispatch(setSelectVisiblePoses(visibleObservations));
  } else {
    dispatch(setMolListToEdit([]));
    dispatch(setUnselectVisiblePoses(visibleObservations));
  }
};

export const getAllCompatiblePoses = (compoundId, canonSite, poseToSkip = 0) => (dispatch, getState) => {
  let result = [];
  const state = getState();

  const poses = state.apiReducers.lhs_compounds_list;
  result = poses?.filter(
    pose => pose.compound === compoundId && pose.canon_site === canonSite && pose.id !== poseToSkip
  );

  return result;
};

export const prepareEmptyPoseDTO = () => {
  return {
    // id: null,
    display_name: null,
    canon_site: null,
    compound: null,
    main_site_observation: null,
    site_observations: [],
    main_site_observation_cmpd_code: null
  };
};

export const copyPoseToPoseDTO = pose => {
  return {
    id: pose.id,
    display_name: pose.display_name,
    canon_site: pose.canon_site,
    compound: pose.compound,
    main_site_observation: pose.main_site_observation,
    site_observations: [...pose.site_observations],
    main_site_observation_cmpd_code: pose.main_site_observation_cmpd_code
  };
};

export const removeObservationsFromPose = (pose, observationIds) => (dispatch, getState) => {
  const newPose = { ...pose };
  const newObsList = newPose.site_observations.filter(obs => !observationIds.includes(obs));
  let associatedObs = newPose.associatedObs?.filter(obs => !observationIds.includes(obs.id));
  if (associatedObs) {
    newPose.associatedObs = [...associatedObs];
  }
  if (newObsList) {
    newPose.site_observations = newObsList;
  }
  // const poseDTO = copyPoseToPoseDTO(newPose);
  // await dispatch(updatePose(poseDTO));
  if (newPose.site_observations.length > 0) {
    dispatch(updateLHSCompound(newPose));
  } else {
    dispatch(removeLHSCompound(newPose));
  }

  return newPose;
};

export const addObservationsToPose = (pose, observationIds) => async (dispatch, getState) => {
  const state = getState();
  const allObservations = state.apiReducers.all_mol_lists;
  const observationsToAdd = allObservations.filter(obs => observationIds.includes(obs.id));
  const newPose = { ...pose };
  const newObsList = [...newPose.site_observations, ...observationIds];
  newPose.site_observations = newObsList;
  if (observationsToAdd?.length > 0) {
    newPose.associatedObs = [...newPose.associatedObs, ...observationsToAdd];
    newPose.associatedObs.forEach(obs => {
      obs.pose = newPose.id;
    });
    newPose.associatedObs = newPose.associatedObs.sort((a, b) => {
      if (a.code < b.code) {
        return -1;
      }
      if (a.code > b.code) {
        return 1;
      }
      return 0;
    });
  }
  const poseDTO = copyPoseToPoseDTO(newPose);
  await dispatch(updatePose(poseDTO));
  dispatch(updateLHSCompound(newPose));

  return newPose;
};

export const updateObservationsInPose = (pose, observationIds) => async (dispatch, getState) => {
  const state = getState();
  const allObservations = state.apiReducers.all_mol_lists;
  const observationsToUpdate = allObservations.filter(obs => observationIds.includes(obs.id));
  observationsToUpdate?.forEach(obs => {
    obs.pose = pose.id;
    dispatch(updateMoleculeInMolLists(obs));
  });
  pose?.associatedObs?.forEach(obs => {
    obs.pose = pose.id;
  });
};

export const createNewPose = (canonSiteId, observationIds) => async (dispatch, getState) => {
  let result = null;

  const state = getState();
  const allPoses = state.apiReducers.lhs_compounds_list;
  const allObservations = state.apiReducers.all_mol_lists;

  const newPose = prepareEmptyPoseDTO();

  const observationsToUse = allObservations.filter(obs => observationIds.includes(obs.id));
  if (observationsToUse && observationsToUse.length > 0) {
    const firstObs = observationsToUse[0];

    newPose.display_name = firstObs.code;
    newPose.canon_site = canonSiteId;
    newPose.compound = firstObs.cmpd;
    newPose.main_site_observation = firstObs.id;
    newPose.site_observations = [...observationIds];
    newPose.main_site_observation_cmpd_code = firstObs.compound_code;

    const createdPose = await dispatch(createPose(newPose));
    createdPose.smiles = firstObs.smiles;
    createdPose.code = `${createdPose.display_name}`;
    createdPose.canonSiteConf = firstObs.canon_site_conf;
    createdPose.canonSite = createdPose.canon_site;
    createdPose.associatedObs = observationsToUse.sort((a, b) => {
      if (a.code < b.code) {
        return -1;
      }
      if (a.code > b.code) {
        return 1;
      }
      return 0;
    });

    dispatch(updateLHSCompound(createdPose));
    await dispatch(updateObservationsInPose(createdPose, observationIds));

    result = createdPose;
  }

  return result;
};

export const updatePose = newPose => async (dispatch, getState) => {
  await updatePoseApi(newPose);
};

export const createPose = newPose => async (dispatch, getState) => {
  return createPoseApi(newPose);
};

const observationSearchFunctions = {
  shortcode: (obs, searchTerm, exact = false) => {
    if (exact) {
      return obs?.code && obs.code.toLowerCase() === searchTerm.toLowerCase();
    } else {
      return obs?.code?.toLowerCase().includes(searchTerm.toLowerCase());
    }
  },
  aliases: (obs, searchTerm, exact = false) => {
    if (exact) {
      return obs?.identifiers?.some(idf => idf.name.toLowerCase() === searchTerm.toLowerCase());
    } else {
      return obs?.identifiers?.some(idf => idf.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
  },
  compoundId: (obs, searchTerm, exact = false) => {
    if (exact) {
      return obs?.compound_code && obs.compound_code.toLowerCase() === searchTerm.toLowerCase();
    } else {
      return obs?.compound_code?.toLowerCase().includes(searchTerm.toLowerCase());
    }
  }
};

export const searchForObservations = (searchTerm, observations, searchSettings, exact = false) => (
  dispatch,
  getState
) => {
  if (!observations || observations.length === 0) return [];
  if (!searchTerm) return observations;

  let result = [];

  const searchBy = searchSettings.searchBy;
  const searchByKeys = Object.keys(searchBy).filter(key => searchBy[key]);

  result = observations.filter(obs => {
    return searchByKeys.reduce((acc, key) => acc || observationSearchFunctions[key](obs, searchTerm), false);
  });

  return result;
};
