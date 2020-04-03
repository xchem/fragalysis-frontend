import { deleteObject, loadObject, setOrientation } from '../../../../reducers/ngl/dispatchActions';
import {
  appendProteinList,
  appendComplexList,
  appendSurfaceList,
  appendDensityList,
  appendFragmentDisplayList,
  appendVectorOnList,
  decrementCountOfPendingVectorLoadRequests,
  incrementCountOfPendingVectorLoadRequests,
  removeFromProteinList,
  removeFromComplexList,
  removeFromSurfaceList,
  removeFromDensityList,
  removeFromFragmentDisplayList,
  removeFromVectorOnList,
  setBondColorMap,
  setInitialFullGraph,
  setToQuery,
  setVectorList,
  updateFullGraph
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
  return new URL(base_url + '/api/' + get_view + '/' + data.id + '/');
};

const handleVector = (json, stage, data) => (dispatch, getState) => {
  const state = getState();
  const to_select = state.selectionReducers.to_select;
  var objList = generateObjectList(json['3d'], data);
  dispatch(setVectorList(objList));
  // loading vector objects
  objList.map(item =>
    dispatch(
      loadObject(
        Object.assign({ display_div: VIEWS.MAJOR_VIEW }, getVectorWithColorByCountOfCompounds(item, to_select)),
        stage,
        undefined,
        null
      )
    )
  );
  var vectorBondColorMap = generateBondColorMap(json['indices']);
  dispatch(setBondColorMap(vectorBondColorMap));
};

export const addVector = (stage, data) => async (dispatch, getState) => {
  const state = getState();
  const vector_list = state.selectionReducers.vector_list;

  vector_list.forEach(item => dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item), stage)));
  // Set this
  dispatch(setInitialFullGraph(data));
  // Do the query
  dispatch(incrementCountOfPendingVectorLoadRequests());

  dispatch(appendVectorOnList(generateMoleculeId(data)));
  dispatch(selectVectorAndResetCompounds(undefined));

  return api({ url: getViewUrl('graph', data) })
    .then(response => dispatch(updateFullGraph(response.data['graph'])))
    .then(() => api({ url: getViewUrl('vector', data) }))
    .then(response => dispatch(handleVector(response.data['vectors'], stage, data)))
    .finally(() => {
      dispatch(decrementCountOfPendingVectorLoadRequests());
      const currentOrientation = stage.viewerControls.getOrientation();
      dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
    });
};

export const removeVector = (stage, data) => (dispatch, getState) => {
  const state = getState();
  const vector_list = state.selectionReducers.vector_list;
  vector_list.forEach(item => dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item), stage)));
  dispatch(setToQuery(''));
  dispatch(removeFromVectorOnList(generateMoleculeId(data)));
};

export const addProtein = (stage, data, colourToggle) => dispatch => {
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateHitProteinObject(data, colourToggle, base_url)),
      stage,
      undefined,
      null
    )
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendProteinList(generateMoleculeId(data)));
};

export const removeProtein = (stage, data, colourToggle) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateHitProteinObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromProteinList(generateMoleculeId(data)));
};

export const addComplex = (stage, data, colourToggle) => dispatch => {
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
      stage,
      undefined,
      null
    )
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendComplexList(generateMoleculeId(data)));
};

export const removeComplex = (stage, data, colourToggle) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromComplexList(generateMoleculeId(data)));
};

export const addSurface = (stage, data, colourToggle) => dispatch => {
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url)),
      stage,
      undefined,
      null
    )
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendSurfaceList(generateMoleculeId(data)));
};

export const removeSurface = (stage, data, colourToggle) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromSurfaceList(generateMoleculeId(data)));
};

export const addDensity = (stage, data, colourToggle) => dispatch => {
  console.log('TODO');
  return;
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateDensityObject(data, colourToggle, base_url)),
      stage,
      undefined,
      null
    )
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendDensityList(generateMoleculeId(data)));
};

export const removeDensity = (stage, data, colourToggle) => dispatch => {
  console.log('TODO');
  return;
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateDensityObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromDensityList(generateMoleculeId(data)));
};

export const addLigand = (stage, data, colourToggle) => (dispatch, getState) => {
  const state = getState();
  const orientationMatrix = state.nglReducers.moleculeOrientations[data.site];
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data, colourToggle)),
      stage,
      undefined,
      orientationMatrix !== undefined ? null : undefined
    )
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));

    dispatch(appendMoleculeOrientation(data.site, currentOrientation));
  });
  dispatch(appendFragmentDisplayList(generateMoleculeId(data)));
};

export const removeLigand = (stage, data) => dispatch => {
  dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data)), stage));
  dispatch(removeFromFragmentDisplayList(generateMoleculeId(data)));
};

/**
 * Turn on the complex of the first ligand of the site
 * Turn on every ligand of the site
 */
export const initializeMolecules = (majorView, moleculeList) => dispatch => {
  if (moleculeList && majorView) {
    const firstMolecule = moleculeList[0];
    dispatch(addProtein(majorView, firstMolecule, colourList[firstMolecule.id % colourList.length]));
    moleculeList.forEach((item, index) => {
      // it should be first selected site
      item.site = 1;
      dispatch(addLigand(majorView, item, colourList[item.id % colourList.length]));
    });
  }
};

export const selectFirstMolecule = (majorView, moleculeList) => dispatch => {
  if (moleculeList) {
    const firstMolecule = moleculeList[0];
    dispatch(addLigand(majorView, firstMolecule, colourList[0]));
    dispatch(addComplex(majorView, firstMolecule, colourList[0]));
    dispatch(addVector(majorView, firstMolecule));
  }
};

export const hideAllSelectedMolecules = (stage, currentMolecules) => (dispatch, getState) => {
  const state = getState();
  const fragmentDisplayList = state.selectionReducers.fragmentDisplayList;
  const complexList = state.selectionReducers.complexList;
  const vectorOnList = state.selectionReducers.vectorOnList;

  fragmentDisplayList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      dispatch(removeLigand(stage, data));
    }
  });
  complexList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      dispatch(removeComplex(stage, data, colourList[0]));
    }
  });
  vectorOnList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      dispatch(removeVector(stage, data));
    }
  });

  // vector_list
  dispatch(setVectorList([]));
  // to_query_pk
  // to_query_prot
  // to_query_sdf_info
  dispatch(
    setInitialFullGraph({
      to_query: undefined,
      to_query_pk: undefined,
      to_query_sdf_info: undefined,
      to_query_prot: undefined,
      to_select: undefined,
      querying: undefined
    })
  );

  dispatch(setCompoundImage(noCompoundImage));
};
