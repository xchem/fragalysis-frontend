import { URLS } from '../routes/constants';
import * as listTypes from '../../constants/listTypes';
import { OBJECT_TYPE } from '../nglView/constants';

export const updateClipboard = valueToClipboard => {
  navigator.clipboard.writeText(valueToClipboard);
};

export const canCheckTarget = pathname => {
  return pathname.includes(URLS.fragglebox) || pathname.includes(URLS.snapshot);
};

export const generateBondColorMap = inputDict => {
  let out_d = {};
  Object.keys(inputDict || {}).forEach(keyItem => {
    Object.keys(inputDict[keyItem] || {}).forEach(vector => {
      const v = vector.split('_')[0];
      out_d[v] = inputDict[keyItem][vector];
    });
  });
  return out_d;
};

const generateArrowObject = (start, end, name, colour) => {
  return {
    name: listTypes.VECTOR + '_' + name,
    OBJECT_TYPE: OBJECT_TYPE.ARROW,
    start: start,
    end: end,
    colour: colour
  };
};
const generateCylinderObject = (start, end, name, colour) => {
  return {
    name: listTypes.VECTOR + '_' + name,
    OBJECT_TYPE: OBJECT_TYPE.CYLINDER,
    start: start,
    end: end,
    colour: colour
  };
};
export const generateObjectList = out_data => {
  let colour = [1, 0, 0];
  let deletions = out_data.deletions;
  let outList = [];
  for (let key in deletions) {
    outList.push(generateArrowObject(deletions[key][0], deletions[key][1], key.split('_')[0], colour));
  }
  let additions = out_data.additions;
  for (let key in additions) {
    outList.push(generateArrowObject(additions[key][0], additions[key][1], key.split('_')[0], colour));
  }
  let linker = out_data.linkers;
  for (let key in linker) {
    outList.push(generateCylinderObject(linker[key][0], linker[key][1], key.split('_')[0], colour));
  }
  let rings = out_data.ring;
  for (let key in rings) {
    outList.push(generateCylinderObject(rings[key][0], rings[key][2], key.split('_')[0], colour));
  }
  return outList;
};
