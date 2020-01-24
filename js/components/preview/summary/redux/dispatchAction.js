import { api } from '../../../../utils/api';
import { resetCompoundImage, setCompoundImage, setIsLoadingCompoundImage, setOldUrl } from './actions';
import { base_url } from '../../../routes/constants';
import { isEmpty } from 'lodash';

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
  if (currentVector === undefined) {
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
  const { to_query } = state.selectionReducers.present;

  let atomIndices = getAtomIndices({ currentVector, bondColorMap });
  const url = new URL(base_url + '/viewer/img_from_smiles/');
  let get_params = {};
  if (atomIndices !== undefined && to_query !== undefined) {
    get_params = { smiles: to_query, atom_indices: atomIndices };
  } else if (to_query !== undefined) {
    get_params = { smiles: to_query };
  }

  if (!isEmpty(get_params)) {
    Object.keys(get_params).forEach(key => url.searchParams.append(key, get_params[key]));
    return dispatch(fetchCompoundImage(url));
  } else {
    dispatch(resetCompoundImage());
    return Promise.resolve('Resetting of compound image');
  }
};
