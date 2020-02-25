import { appendToBuyList, removeFromToBuyList, setToBuyList } from '../../../../reducers/selection/actions';
import {
  setCompoundClasses,
  setCurrentPage,
  updateCurrentCompound,
  setHighlightedCompoundId,
  setConfiguration
} from './actions';
import { deleteObject, loadObject } from '../../../../reducers/ngl/dispatchActions';
import { VIEWS } from '../../../../constants/constants';
import { generateCompoundMolObject } from '../../../nglView/generatingObjects';
import { api, getCsrfToken, METHOD } from '../../../../utils/api';
import { base_url } from '../../../routes/constants';
import { loadFromServer } from '../../../../utils/genericView';

export const selectAllCompounds = () => (dispatch, getState) => {
  const state = getState();
  const thisVectorList = state.selectionReducers.this_vector_list;
  const to_query = state.selectionReducers.to_query;
  const currentCompoundClass = state.previewReducers.compounds.currentCompoundClass;

  for (let key in thisVectorList) {
    for (let index in thisVectorList[key]) {
      if (index !== 'vector') {
        for (let fUCompound in thisVectorList[key][index]) {
          var thisObj = {
            smiles: thisVectorList[key][index][fUCompound].end,
            vector: thisVectorList[key].vector.split('_')[0],
            mol: to_query,
            class: parseInt(currentCompoundClass)
          };
          dispatch(appendToBuyList(thisObj));
        }
      }
    }
  }
};

export const clearAllSelectedCompounds = () => dispatch => {
  dispatch(setToBuyList([]));
};

export const onChangeCompoundClassValue = event => (dispatch, getState) => {
  const state = getState();
  const compoundClasses = state.previewReducers.compounds.compoundClasses;
  // on Enter
  if (event.keyCode === 13) {
    const newClassDescription = { [event.target.id]: event.target.value };
    const descriptionToSet = Object.assign(compoundClasses, newClassDescription);

    dispatch(setCompoundClasses(descriptionToSet, event.target.id));
  }
};

export const loadNextPageOfCompounds = () => (dispatch, getState) => {
  const nextPage = getState().previewReducers.compounds.currentPage + 1;
  dispatch(setCurrentPage(nextPage));
};

const showCompoundNglView = ({ majorViewStage, data }) => (dispatch, getState) => {
  const state = getState();
  const to_query_sdf_info = state.selectionReducers.to_query_sdf_info;
  const configuration = state.previewReducers.compounds.configuration;
  const currentCompounds = state.previewReducers.compounds.currentCompounds;

  if (currentCompounds[data.index].isShowed) {
    dispatch(
      deleteObject(
        Object.assign(
          { display_div: VIEWS.MAJOR_VIEW },
          generateCompoundMolObject(configuration[data.index] || false, data.smiles)
        ),
        majorViewStage
      )
    );
  } else {
    // This needs currying
    var post_data = {
      INPUT_VECTOR: data.vector,
      INPUT_SMILES: [data.smiles],
      INPUT_MOL_BLOCK: to_query_sdf_info
    };
    api({
      url: base_url + '/scoring/gen_conf_from_vect/',
      method: METHOD.POST,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': getCsrfToken()
      },
      data: JSON.stringify(post_data)
    })
      .then(response => {
        // Now load this into NGL
        const newConf = response.data[0];
        dispatch(
          loadObject(
            Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateCompoundMolObject(newConf, data.smiles)),
            majorViewStage
          )
        );
        dispatch(setConfiguration(data.index, newConf));
      })
      .catch(error => {
        throw error;
      });
  }
};

export const handleClickOnCompound = ({ data, event, majorViewStage }) => async (dispatch, getState) => {
  const state = getState();
  const currentCompoundClass = state.previewReducers.compounds.currentCompoundClass;
  const currentCompounds = state.previewReducers.compounds.currentCompounds;

  dispatch(setHighlightedCompoundId(data.index));

  if (event.shiftKey) {
    await dispatch(showCompoundNglView({ majorViewStage, data }));
    dispatch(updateCurrentCompound({ id: data.index, key: 'isShowed', value: !currentCompounds[data.index].isShowed }));
  } else {
    if (currentCompounds[data.index].selectedClass === currentCompoundClass) {
      await dispatch(updateCurrentCompound({ id: data.index, key: 'selectedClass', value: undefined }));
      dispatch(removeFromToBuyList(data));
    } else {
      await dispatch(updateCurrentCompound({ id: data.index, key: 'selectedClass', value: currentCompoundClass }));
      dispatch(appendToBuyList(data));
    }
  }
};

export const loadCompoundImageData = ({ width, height, onCancel, data }) => dispatch => {
  let url = undefined;
  let key = undefined;

  const base_url = window.location.protocol + '//' + window.location.host;
  if (data.id !== undefined) {
    url = new URL(base_url + '/api/cmpdimg/' + data.id + '/');
    key = 'cmpd_image';
  } else {
    url = new URL(base_url + '/viewer/img_from_smiles/');
    var get_params = { smiles: data.show_frag };
    Object.keys(get_params).forEach(p => url.searchParams.append(p, get_params[p]));
  }

  return loadFromServer({
    width,
    height,
    key,
    setImg_data: image => dispatch(updateCurrentCompound({ id: data.index, key: 'image', value: image })),
    url,
    cancel: onCancel
  });
};
