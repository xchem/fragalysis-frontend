import { VIEWS } from '../../constants/constants';
import {
  generateArrowObject,
  generateCylinderObject,
  getVectorWithColorByCountOfCompounds
} from '../../components/nglView/generatingObjects';
import { setBondColorMap, setVectorList } from './selectionActions';
import { loadObject } from '../ngl/nglDispatchActions';

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

export const handleVector = (json, stage, data) => (dispatch, getState) => {
  const state = getState();
  const to_select = state.selectionReducers.present.to_select;
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
