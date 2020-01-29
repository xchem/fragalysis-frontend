import { deleteObject, loadObject, setOrientation } from '../../../../reducers/ngl/nglDispatchActions';
import {
  appendComplexList,
  appendFragmentDisplayList,
  appendVectorOnList,
  decrementCountOfPendingVectorLoadRequests,
  incrementCountOfPendingVectorLoadRequests,
  removeFromComplexList,
  removeFromFragmentDisplayList,
  removeFromVectorOnList,
  setBondColorMap,
  setInitialFullGraph,
  setToQuery,
  setVectorList,
  updateFullGraph
} from '../../../../reducers/selection/selectionActions';
import { base_url } from '../../../routes/constants';
import {
  generateArrowObject,
  generateMoleculeId,
  generateCylinderObject,
  getVectorWithColorByCountOfCompounds,
  generateComplexObject,
  generateMoleculeObject
} from '../../../nglView/generatingObjects';
import { VIEWS } from '../../../../constants/constants';
import { api } from '../../../../utils/api';
import { selectVectorAndReset } from '../../../../reducers/selection/dispatchActions';

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
        stage
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
  await dispatch(selectVectorAndReset(undefined));

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

export const addComplex = (stage, data, colourToggle) => dispatch => {
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
      stage
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

export const addLigand = (stage, data, colourToggle) => dispatch => {
  dispatch(
    loadObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data, colourToggle)), stage)
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendFragmentDisplayList(generateMoleculeId(data)));
};

export const removeLigand = (stage, data) => dispatch => {
  dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data)), stage));
  dispatch(removeFromFragmentDisplayList(generateMoleculeId(data)));
};
