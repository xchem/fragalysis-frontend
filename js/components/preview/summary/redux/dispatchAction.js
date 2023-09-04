import { api } from '../../../../utils/api';
import {
  resetCompoundImage,
  setCompoundImage,
  setCountOfExploredSeries,
  setCountOfExploredVectors,
  setCountOfPicked,
  setEstimatedCost,
  setIsLoadingCompoundImage,
  setOldUrl,
  setSelectedInteraction
} from './actions';
import { base_url } from '../../../routes/constants';
import { isEmpty } from 'lodash';
import { getMoleculeOfCurrentVector } from '../../../../reducers/selection/selectors';

const fetchCompoundImage = url => (dispatch, getState) => {
  const state = getState();
  const { oldUrl, width, height } = state.previewReducers.summary;
  let get_params = {
    width,
    height
  };
  Object.keys(get_params).forEach(key => url.searchParams.append(key, get_params[key]));
  if (url.toString() !== oldUrl) {
    dispatch(setIsLoadingCompoundImage());
    return api({ url: url }).then(response => dispatch(setCompoundImage(response.data)));
  }
  dispatch(setOldUrl(url.toString()));
  dispatch(resetCompoundImage());
  return Promise.reject('Error with fetching compound image');
};

const getAtomIndices = ({ currentVector, bondColorMap }) => {
  if (currentVector === null) {
    return undefined;
  }
  if (bondColorMap === undefined) {
    return undefined;
  }
  let optionList = bondColorMap[currentVector];
  let outStrList = [];
  for (let index in optionList) {
    let newList = [];
    for (let newIndex in optionList[index]) {
      if (optionList[index][newIndex] === 'NA') {
        newList.push(101);
      } else {
        newList.push(optionList[index][newIndex]);
      }
    }
    let newStr = newList.join(',');
    outStrList.push(newStr);
  }
  return outStrList.join(',');
};

export const reloadSummaryCompoundImage = ({ currentVector, bondColorMap }) => (dispatch, getState) => {
  const state = getState();
  const moleculeOfVector = getMoleculeOfCurrentVector(state);
  const smiles = moleculeOfVector && moleculeOfVector.smiles;

  let atomIndices = getAtomIndices({ currentVector, bondColorMap });
  const url = new URL(base_url + '/viewer/img_from_smiles/');
  let get_params = {};
  if (atomIndices !== undefined && smiles !== undefined) {
    get_params = { smiles, atom_indices: atomIndices };
  } else if (smiles !== undefined) {
    get_params = { smiles };
  }

  if (!isEmpty(get_params)) {
    Object.keys(get_params).forEach(key => url.searchParams.append(key, get_params[key]));
    return dispatch(fetchCompoundImage(url));
  } else {
    dispatch(resetCompoundImage());
    return Promise.resolve('Resetting of compound image');
  }
};

export const updateSummaryView = ({ duck_yank_data, to_buy_list }) => dispatch => {
  dispatch(setCountOfPicked(to_buy_list.length));
  if (to_buy_list.length > 0) {
    dispatch(setEstimatedCost(to_buy_list.length * 150.0 + 500.0));
  } else {
    dispatch(setEstimatedCost(0.0));
  }

  let vector_list_temp = [];
  let mol_list_temp = [];
  to_buy_list.forEach(item => {
    vector_list_temp.push(item.vector);
    mol_list_temp.push(item.mol);
  });

  dispatch(setCountOfExploredVectors(new Set(vector_list_temp).size));
  dispatch(setCountOfExploredSeries(new Set(mol_list_temp).size));
  dispatch(setSelectedInteraction(duck_yank_data['interaction']));
};

const convert_data_to_list = input_list => (dispatch, getState) => {
  const compoundClasses = getState().previewReducers.compounds.compoundClasses;
  const classColors = {
    1: 'blue',
    2: 'red',
    3: 'green',
    4: 'purple',
    5: 'apricot'
  };

  let outArray = [];
  const headerArray = ['smiles', 'mol', 'vector', /*'classNumber',*/ 'class', 'classColor'];
  outArray.push(headerArray);
  const reg_ex = new RegExp('Xe', 'g');

  // TODO: compound classes need REDO?
  input_list.forEach(item => {
    let newArray = [];
    newArray.push(item.smiles);
    newArray.push(item.mol);
    newArray.push(item.vector.replace(reg_ex, '*'));
    newArray.push(getState().previewReducers.compounds[item.class]);
    newArray.push(item.class);
    // newArray.push(compoundClasses[item.class]);
    // newArray.push(classColors[item.class]);
    outArray.push(newArray);
  });
  return outArray;
};

const download_file = (file_data, file_name) => {
  var encodedUri = encodeURI(file_data);
  var link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', file_name);
  document.body.appendChild(link); // Required for FF
  link.click();
};

const generate_smiles = (csvContent, input_list, delimiter) => dispatch => {
  const rows = dispatch(convert_data_to_list(input_list));
  rows.forEach(function(rowArray) {
    let row = rowArray.join(delimiter);
    csvContent += row + '\n';
  });
  return csvContent;
};

export const exportCsv = () => (dispatch, getState) => {
  const state = getState();
  const to_buy_list = state.selectionReducers.to_buy_list;
  const csvContent = dispatch(generate_smiles('data:text/csv;charset=utf-8,', to_buy_list, ','));
  download_file(csvContent, 'follow_ups.csv');
};
