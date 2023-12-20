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
  removeFromInformationList,
  appendToDensityListType,
  removeFromDensityListType,
  setArrowUpDown,
  setMolListToEdit,
  setSelectAllMolecules,
  setUnselectAllMolecules,
  setTagEditorOpen,
  setMoleculeForTagEdit
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
import { colourList } from '../utils/color';
import { appendMoleculeOrientation, setNglViewParams } from '../../../../reducers/ngl/actions';
import { setCompoundImage } from '../../summary/redux/actions';
import { noCompoundImage } from '../../summary/redux/reducer';
import { getMoleculeOfCurrentVector } from '../../../../reducers/selection/selectors';
import { resetCurrentCompoundSettingsWithoutSelection } from '../../compounds/redux/actions';
import { selectMoleculeGroup } from '../../moleculeGroups/redux/dispatchActions';
import { setDirectAccessProcessed } from '../../../../reducers/api/actions';
import { MOL_TYPE } from './constants';
import {
  addImageToCache,
  addProteindDataToCache,
  disableMoleculeNglControlButton,
  enableMoleculeNglControlButton
} from './actions';
import { OBJECT_TYPE, DENSITY_MAPS, NGL_PARAMS } from '../../../nglView/constants';
import { getRepresentationsByType, getRepresentationsForDensities } from '../../../nglView/generatingObjects';
import { readQualityInformation } from '../../../nglView/renderingHelpers';
import { addSelectedTag } from '../../tags/redux/dispatchActions';
import { CATEGORY_TYPE } from '../../../../constants/constants';
import { selectJoinedMoleculeList } from './selectors';
import { compareTagsAsc } from '../../tags/utils/tagUtils';
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
      dispatch(setMoleculeForTagEdit(null));
    }
  }
};

const getViewUrl = (get_view, data) => {
  const url = new URL(base_url + '/api/' + get_view + '/' + data.id + '/');
  return url;
};

const handleVector = (json, stage, data) => (dispatch, getState) => {
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
  const currentVector = getState().selectionReducers.currentVector;

  dispatch(appendVectorOnList(generateMoleculeId(data), skipTracking));
  dispatch(selectVectorAndResetCompounds(currentVector));

  return api({ url: getViewUrl('graph', data) })
    .then(response => {
      const result = response.data.graph;
      const new_dict = {};
      // Uniquify
      if (result) {
        Object.keys(result).forEach(key => {
          const smiSet = new Set();
          new_dict[key] = {};
          new_dict[key]['addition'] = [];
          new_dict[key]['vector'] = result[key]['vector'];
          Object.keys(result[key]['addition']).forEach(index => {
            const newSmi = result[key]['addition'][index]['end'];
            if (smiSet.has(newSmi) !== true) {
              new_dict[key]['addition'].push(result[key]['addition'][index]);
              smiSet.add(newSmi);
            }
          });
        });
      }
      return dispatch(updateVectorCompounds(data.smiles, new_dict));
    })
    .then(() => api({ url: new URL(base_url + '/api/vector/?id=' + data.id) }))
    .then(response => {
      dispatch(handleVector(response.data?.results[0]?.vectors, stage, data));
    })
    .finally(() => {
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

export const removeVector = (stage, data, skipTracking = false) => (dispatch, getState) => {
  const state = getState();
  const vector_list = state.selectionReducers.vector_list;
  vector_list
    .filter(item => item.moleculeId === data.id)
    .forEach(item => dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item), stage)));

  dispatch(removeCurrentVector(data.smiles));

  dispatch(updateVectorCompounds(data.smiles, undefined));
  dispatch(updateBondColorMapOfCompounds(data.smiles, undefined));
  dispatch(removeFromVectorOnList(generateMoleculeId(data), skipTracking));

  dispatch(setVectorList(vector_list.filter(item => item.moleculeId !== data.id)));
};

export const addComplex = (
  stage,
  data,
  colourToggle,
  skipTracking = false,
  representations = undefined
) => async dispatch => {
  dispatch(appendComplexList(generateMoleculeId(data), skipTracking));
  return dispatch(
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
) => async dispatch => {
  dispatch(appendSurfaceList(generateMoleculeId(data), skipTracking));
  return dispatch(
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
  const prepParams = dispatch(getDensityChangedParams(isWireframeStyle));
  const densityObject = generateDensityObject(data, colourToggle, base_url, isWireframeStyle);
  const combinedObject = { ...prepParams, ...densityObject };
  dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, combinedObject),
      stage,
      previousRepresentations: representations,
      orientationMatrix: null
    })
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
    let molDataId = generateMoleculeId(data);
    if (!data.proteinData) {
      dispatch(getProteinData(data)).then(i => {
        const proteinData = i;
        data.proteinData = proteinData;

        molDataId['render_event'] = data.proteinData.render_event;
        molDataId['render_sigmaa'] = data.proteinData.render_sigmaa;
        molDataId['render_diff'] = data.proteinData.render_diff;
        molDataId['render_quality'] = data.proteinData.render_quality;

        dispatch(appendDensityList(generateMoleculeId(data), skipTracking));
        dispatch(appendToDensityListType(molDataId, skipTracking));
        if (data.proteinData.render_quality) {
          return dispatch(addQuality(stage, data, colourToggle, true));
        }
      });
    } else {
      molDataId['render_event'] = data.proteinData.render_event;
      molDataId['render_sigmaa'] = data.proteinData.render_sigmaa;
      molDataId['render_diff'] = data.proteinData.render_diff;
      molDataId['render_quality'] = data.proteinData.render_quality;

      dispatch(appendDensityList(generateMoleculeId(data), skipTracking));
      dispatch(appendToDensityListType(molDataId, skipTracking));
      if (data.proteinData.render_quality) {
        return dispatch(addQuality(stage, data, colourToggle, true));
      }
    }
  });
};

const getDensityChangedParams = (isWireframeStyle = undefined) => (dispatch, getState) => {
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
  // const contour_DENSITY = viewParams[NGL_PARAMS.contour_DENSITY];
  // const contour_DENSITY_MAP_sigmaa = viewParams[NGL_PARAMS.contour_DENSITY_MAP_sigmaa];
  // const contour_DENSITY_MAP_diff = viewParams[NGL_PARAMS.contour_DENSITY_MAP_diff];
  if (data.proteinData) {
    return dispatch(setDensityCustom(stage, data, colourToggle, isWireframeStyle, skipTracking, representations));
    // dispatch(setNglViewParams(NGL_PARAMS.contour_DENSITY, invertedWireframe));
    // dispatch(setNglViewParams(NGL_PARAMS.contour_DENSITY_MAP_sigmaa, invertedWireframe));
    // dispatch(setNglViewParams(NGL_PARAMS.contour_DENSITY_MAP_diff, invertedWireframe));
  }

  await dispatch(getDensityMapData(data));
  return dispatch(setDensityCustom(stage, data, colourToggle, isWireframeStyle, skipTracking, representations));
  // dispatch(setNglViewParams(NGL_PARAMS.contour_DENSITY, invertedWireframe));
  // dispatch(setNglViewParams(NGL_PARAMS.contour_DENSITY_MAP_sigmaa, invertedWireframe));
  // dispatch(setNglViewParams(NGL_PARAMS.contour_DENSITY_MAP_diff, invertedWireframe));
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
  let densityObject = dispatch(getDensityChangedParams());
  densityObject = dispatch(toggleDensityWireframe(isWireframeStyle, densityObject));
  const oldDensityData = dispatch(deleteDensityObject(data, colourToggle, stage, !isWireframeStyle));
  densityObject = { ...densityObject, ...oldDensityData };
  const molId = generateMoleculeId(data);
  dispatch(removeFromDensityList(molId, true));
  // dispatch(removeFromDensityListType(molId, true));

  dispatch(appendDensityListCustom(generateMoleculeId(data), skipTracking));
  return dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, densityObject),
      stage,
      previousRepresentations: representations,
      orientationMatrix: null
    })
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
};

export const removeDensity = (
  stage,
  data,
  colourToggle,
  isWireframeStyle,
  skipTracking = false,
  representations = undefined
) => dispatch => {
  dispatch(toggleDensityWireframe(isWireframeStyle));
  dispatch(deleteDensityObject(data, colourToggle, stage, isWireframeStyle));

  const molId = generateMoleculeId(data);
  dispatch(removeFromDensityList(molId, skipTracking));
  dispatch(removeFromDensityListCustom(molId, true));
  dispatch(removeFromDensityListType(molId, skipTracking));
  if (data.proteinData.render_quality) {
    dispatch(removeQuality(stage, data, colourToggle, true));
  }
};

const deleteDensityObject = (data, colourToggle, stage, isWireframeStyle) => dispatch => {
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
  representations = undefined
) => async dispatch => {
  // data.sdf_info = molFile;
  dispatch(appendProteinList(generateMoleculeId(data), skipTracking));
  let hitProteinObject = generateHitProteinObject(data, colourToggle, base_url);
  let qualityInformation = dispatch(readQualityInformation(hitProteinObject.name, hitProteinObject.sdf_info));

  let hasAdditionalInformation =
    withQuality === true &&
    qualityInformation &&
    qualityInformation.badproteinids &&
    qualityInformation.badproteinids.length !== 0;
  if (hasAdditionalInformation) {
    dispatch(appendQualityList(generateMoleculeId(data), true));
  }

  return dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, hitProteinObject),
      stage,
      previousRepresentations: representations,
      orientationMatrix: null,
      loadQuality: hasAdditionalInformation,
      quality: qualityInformation
    })
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
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

export const addLigand = (
  stage,
  data,
  colourToggle,
  centerOn = false,
  withQuality = false,
  skipTracking = false,
  representations = undefined
) => async (dispatch, getState) => {
  // data.sdf_info = molFile;
  console.count(`Grabbing orientation before loading ligand.`);
  const currentOrientation = stage.viewerControls.getOrientation();
  dispatch(appendFragmentDisplayList(generateMoleculeId(data), skipTracking));

  let moleculeObject = generateMoleculeObject(data, colourToggle);
  let qualityInformation = dispatch(readQualityInformation(moleculeObject.name, moleculeObject.sdf_info));

  let hasAdditionalInformation =
    withQuality === true && qualityInformation && qualityInformation.badids && qualityInformation.badids.length !== 0;
  if (hasAdditionalInformation) {
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
  ).then(() => {
    const state = getState();
    const skipOrientation = state.trackingReducers.skipOrientationChange;
    if (!skipOrientation) {
      const ligandOrientation = stage.viewerControls.getOrientation();
      dispatch(setOrientation(VIEWS.MAJOR_VIEW, ligandOrientation));

      dispatch(appendMoleculeOrientation(data?.id, ligandOrientation));
      if (centerOn === false) {
        // keep current orientation of NGL View
        console.count(`Before applying orientation matrix after loading ligand.`);
        stage.viewerControls.orient(currentOrientation);
        console.count(`After applying orientation matrix after loading ligand.`);
      }
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
};

export const addQuality = (stage, data, colourToggle, skipTracking = false, representations = undefined) => (
  dispatch,
  getState
) => {
  dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data)), stage));
  dispatch(appendQualityList(generateMoleculeId(data), skipTracking));
  return dispatch(addLigand(stage, data, colourToggle, false, true, true, representations));
};

export const removeQuality = (stage, data, colourToggle, skipTracking = false) => dispatch => {
  dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data)), stage));
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

    if (!isSnapshot) {
      const firstTag = dispatch(getFirstTagAlphabetically());
      let firstMolecule = null;
      if (firstTag) {
        dispatch(addSelectedTag(firstTag));
        // firstMolecule = dispatch(getFirstMoleculeForTag(firstTag.id));
      } else if (noTagsReceived) {
        // firstMolecule = dispatch(getFirstMolecule());
      }
      firstMolecule = dispatch(getFirstMolOfFirstCompound());
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
  const sortedTags = tagsList.sort(compareTagsAsc);
  return sortedTags && sortedTags.length > 0 ? sortedTags[0] : null;
};

export const getFirstMolOfFirstCompound = () => (dispatch, getState) => {
  const state = getState();
  const compoundsList = state.apiReducers.lhs_compounds_list;
  const firstCompound = compoundsList[0];
  if (firstCompound) {
    const molList = state.apiReducers.all_mol_lists;
    const firstMols = molList?.filter(m => m.cmpd === firstCompound.id);
    if (firstMols && firstMols.length > 0) {
      return firstMols[0];
    } else {
      return null;
    }
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
      let directProteinNameModded = m.name.toLowerCase();
      let directProteinCodeModded = `${directDisplay.target.toLowerCase()}-${directProteinNameModded}`;
      for (let molIndex = 0; molIndex < allMols.length; molIndex++) {
        let molList = allMols;
        let mol = molList[molIndex];
        let proteinCodeModded = mol.code.toLowerCase();
        if (
          m.exact ? proteinCodeModded === directProteinCodeModded : proteinCodeModded.includes(directProteinNameModded)
        ) {
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
    });
    // dispatch(setDirectAccess({}));
    dispatch(setDirectAccessProcessed(true));
  }
};

export const getQualityInformation = (data, molType, width, height) => (dispatch, getState) => {
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
  }); /*dispatch(getProteinDataByMolId(molecule.id, molecule.code));*/
};

// export const getProteinDataByMolId = (molId, proteinCode) => (dispatch, getState) => {
//   const state = getState();
//   const proteindDataCache = state.previewReducers.molecule.proteinDataCache;

//   const molIdStr = molId.toString();
//   if (proteindDataCache.hasOwnProperty(molIdStr)) {
//     return new Promise((resolve, reject) => {
//       resolve(proteindDataCache[molIdStr]);
//     });
//   } else {
//     return loadProteinData(proteinCode).then(i => {
//       if (!proteindDataCache.hasOwnProperty(molIdStr)) {
//         dispatch(addProteindDataToCache(molId.toString(), i));
//       }
//       return i;
//     });
//   }
// };

// const loadProteinData = code => {
//   if (code) {
//     let url = new URL(`${base_url}/api/proteins/?code=${code}`);
//     let onCancel = () => {};
//     return api({
//       url,
//       onCancel
//     }).then(response => {
//       return response.data.results;
//     });
//   } else {
//     console.error('Trying to load protein data for unknown molecule protein code.');
//     return Promise.resolve();
//   }
// };

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

export const selectAllHits = (allFilteredMolecules, setNextXMolecules, unselect) => (dispatch, getState) => {
  if (setNextXMolecules) {
    dispatch(setNextXMolecules(allFilteredMolecules?.length || 0));
  }
  const listOfIds = allFilteredMolecules.map(m => m.id);
  if (!unselect) {
    dispatch(setMolListToEdit(listOfIds));
    dispatch(setSelectAllMolecules(allFilteredMolecules));
  } else {
    dispatch(setMolListToEdit([]));
    dispatch(setUnselectAllMolecules(allFilteredMolecules));
  }
};
