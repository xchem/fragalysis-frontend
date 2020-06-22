import { appendToBuyList, removeFromToBuyList, setToBuyList } from '../../../../reducers/selection/actions';
import {
  setCompoundClasses,
  setCurrentPage,
  setHighlightedCompoundId,
  setConfiguration,
  addShowedCompoundToList,
  removeShowedCompoundFromList,
  removeSelectedCompoundClass,
  addSelectedCompoundClass,
  resetCompoundClasses,
  resetSelectedCompoundClass,
  resetConfiguration,
  setCurrentCompoundClass
} from './actions';
import { deleteObject, loadObject } from '../../../../reducers/ngl/dispatchActions';
import { VIEWS } from '../../../../constants/constants';
import { generateCompoundMolObject } from '../../../nglView/generatingObjects';
import { api, getCsrfToken, METHOD } from '../../../../utils/api';
import { base_url } from '../../../routes/constants';
import { loadFromServer } from '../../../../utils/genericView';
import { compoundsColors } from './constants';
import {
  getCurrentVectorCompoundsFiltered,
  getMoleculeOfCurrentVector
} from '../../../../reducers/selection/selectors';

export const selectAllCompounds = () => (dispatch, getState) => {
  const state = getState();
  const currentVectorCompoundsFiltered = getCurrentVectorCompoundsFiltered(state);

  const moleculeOfVector = getMoleculeOfCurrentVector(state);
  const smiles = moleculeOfVector && moleculeOfVector.smiles;
  const currentCompoundClass = state.previewReducers.compounds.currentCompoundClass;

  for (let key in currentVectorCompoundsFiltered) {
    for (let index in currentVectorCompoundsFiltered[key]) {
      if (index !== 'vector') {
        for (let indexOfCompound in currentVectorCompoundsFiltered[key][index]) {
          var thisObj = {
            smiles: currentVectorCompoundsFiltered[key][index][indexOfCompound].end,
            vector: currentVectorCompoundsFiltered[key].vector.split('_')[0],
            mol: smiles,
            class: parseInt(currentCompoundClass)
          };
          dispatch(appendToBuyList(thisObj));
          dispatch(addSelectedCompoundClass(currentCompoundClass, parseInt(indexOfCompound)));
        }
      }
    }
  }
};

export const onChangeCompoundClassValue = event => (dispatch, getState) => {
  const state = getState();
  const compoundClasses = {};
  Object.keys(compoundsColors).forEach(color => {
    compoundClasses[color] = state.previewReducers.compounds[color];
  });
  // const compoundClasses = state.previewReducers.compounds.compoundClasses;

  const newClassDescription = { [event.target.id]: event.target.value };
  const descriptionToSet = Object.assign(compoundClasses, newClassDescription);

  dispatch(setCompoundClasses(descriptionToSet));
};

export const onKeyDownCompoundClass = event => dispatch => {
  // on Enter
  if (event.keyCode === 13) {
    dispatch(setCurrentCompoundClass(event.target.id));
  }
};

export const loadNextPageOfCompounds = () => (dispatch, getState) => {
  const nextPage = getState().previewReducers.compounds.currentPage + 1;
  dispatch(setCurrentPage(nextPage));
};

const showCompoundNglView = ({ majorViewStage, data, index }) => (dispatch, getState) => {
  const state = getState();
  const moleculeOfVector = getMoleculeOfCurrentVector(state);
  const sdf_info = moleculeOfVector && moleculeOfVector.sdf_info;
  const configuration = state.previewReducers.compounds.configuration;
  const showedCompoundList = state.previewReducers.compounds.showedCompoundList;

  if (showedCompoundList.find(item => item === index) !== undefined) {
    dispatch(
      deleteObject(
        Object.assign(
          { display_div: VIEWS.MAJOR_VIEW },
          generateCompoundMolObject(configuration[index] || false, data.smiles)
        ),
        majorViewStage
      )
    );
  } else {
    // This needs currying
    var post_data = {
      INPUT_VECTOR: data.vector,
      INPUT_SMILES: [data.smiles],
      INPUT_MOL_BLOCK: sdf_info
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
        dispatch(setConfiguration(index, newConf));
        return dispatch(
          loadObject({
            target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateCompoundMolObject(newConf, data.smiles)),
            stage: majorViewStage
          })
        );
      })
      .catch(error => {
        throw new Error(error);
      });
  }
};

export const clearAllSelectedCompounds = majorViewStage => (dispatch, getState) => {
  dispatch(setToBuyList([]));
  const state = getState();
  // reset objects from nglView and showedCompoundList
  const currentCompounds = state.previewReducers.compounds.currentCompounds;
  const showedCompoundList = state.previewReducers.compounds.showedCompoundList;
  showedCompoundList.forEach(index => {
    const data = currentCompounds[index];
    dispatch(showCompoundNglView({ majorViewStage, data, index }));
    dispatch(removeShowedCompoundFromList(index));
  });
  //  reset compoundsClasses
  dispatch(resetCompoundClasses());
  // reset selectedCompoundsClass
  dispatch(resetSelectedCompoundClass());
  // reset highlightedCompoundId
  dispatch(setHighlightedCompoundId(undefined));
  // reset configuration
  dispatch(resetConfiguration());
  // reset current compound class
  dispatch(dispatch(setCurrentCompoundClass(compoundsColors.blue.key)));
};

export const handleClickOnCompound = ({ event, data, majorViewStage, index }) => async (dispatch, getState) => {
  const state = getState();
  const currentCompoundClass = state.previewReducers.compounds.currentCompoundClass;
  const showedCompoundList = state.previewReducers.compounds.showedCompoundList;
  const selectedCompoundsClass = state.previewReducers.compounds.selectedCompoundsClass;

  dispatch(setHighlightedCompoundId(index));

  if (event.shiftKey) {
    await dispatch(showCompoundNglView({ majorViewStage, data, index }));
    if (showedCompoundList.find(item => item === index) !== undefined) {
      dispatch(removeShowedCompoundFromList(index));
    } else {
      dispatch(addShowedCompoundToList(index));
    }
  } else {
    let isSelectedID;
    for (const classKey of Object.keys(selectedCompoundsClass)) {
      const currentCmpdClassId = selectedCompoundsClass[classKey].find(item => item === index);
      if (currentCmpdClassId !== undefined) {
        isSelectedID = currentCmpdClassId;
        break;
      }
    }

    if (isSelectedID !== undefined) {
      await dispatch(removeSelectedCompoundClass(index));
      dispatch(removeFromToBuyList(data));
    } else {
      await dispatch(addSelectedCompoundClass(currentCompoundClass, index));
      dispatch(appendToBuyList(Object.assign({}, data, { class: currentCompoundClass })));
    }
  }
};

export const loadCompoundImageData = ({ width, height, onCancel, data, setImage }) => {
  let url = undefined;
  let key = undefined;

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
    setImg_data: image => setImage(image),
    url,
    cancel: onCancel
  });
};
