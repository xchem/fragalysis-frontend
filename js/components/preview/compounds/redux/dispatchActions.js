import {
  appendToBuyList,
  removeFromToBuyList,
  setToBuyList,
  appendToBuyListAll,
  removeFromToBuyListAll
} from '../../../../reducers/selection/actions';
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
import { compoundsColors, AUX_VECTOR_SELECTOR_DATASET_ID } from './constants';
import {
  getCurrentVectorCompoundsFiltered,
  getMoleculeOfCurrentVector
} from '../../../../reducers/selection/selectors';
import {appendMoleculeToCompoundsOfDatasetToBuy, removeMoleculeFromCompoundsOfDatasetToBuy} from '../../../datasets/redux/actions';

export const selectAllCompounds = () => (dispatch, getState) => {
  const state = getState();
  const currentVectorCompoundsFiltered = getCurrentVectorCompoundsFiltered(state);

  const moleculeOfVector = getMoleculeOfCurrentVector(state);
  const smiles = moleculeOfVector && moleculeOfVector.smiles;
  const currentCompoundClass = state.previewReducers.compounds.currentCompoundClass;
  let items = [];

  for (let key in currentVectorCompoundsFiltered) {
    for (let index in currentVectorCompoundsFiltered[key]) {
      if (index !== 'vector') {
        for (let indexOfCompound in currentVectorCompoundsFiltered[key][index]) {
          let compoundId = parseInt(indexOfCompound);
          var thisObj = {
            smiles: currentVectorCompoundsFiltered[key][index][indexOfCompound].end,
            vector: currentVectorCompoundsFiltered[key].vector.split('_')[0],
            mol: smiles,
            class: parseInt(currentCompoundClass),
            compoundId: compoundId
          };
          items.push(thisObj);
          dispatch(appendToBuyList(thisObj, compoundId, true));
          dispatch(addSelectedCompoundClass(currentCompoundClass, compoundId));
        }
      }
    }
  }

  dispatch(appendToBuyListAll(items));
};

export const onChangeCompoundClassValue = event => (dispatch, getState) => {
  const state = getState();
  const compoundClasses = {};
  Object.keys(compoundsColors).forEach(color => {
    compoundClasses[color] = state.previewReducers.compounds[color];
  });
  // const compoundClasses = state.previewReducers.compounds.compoundClasses;

  let id = event.target.id;
  let value = event.target.value;
  let oldDescriptionToSet = Object.assign({}, compoundClasses);
  const newClassDescription = { [id]: value };
  const descriptionToSet = Object.assign(compoundClasses, newClassDescription);

  dispatch(setCompoundClasses(descriptionToSet, oldDescriptionToSet, value, id));
};

export const onKeyDownCompoundClass = event => (dispatch, getState) => {
  const state = getState();

  // on Enter
  if (event.keyCode === 13) {
    let oldCompoundClass = state.previewReducers.compounds.currentCompoundClass;
    dispatch(setCurrentCompoundClass(event.target.id, oldCompoundClass));
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
  const state = getState();

  let to_buy_list = state.selectionReducers.to_buy_list;
  dispatch(clearCompounds(to_buy_list, majorViewStage));
};

const clearCompounds = (items, majorViewStage) => (dispatch, getState) => {
  const state = getState();

  dispatch(removeFromToBuyListAll(items));
  dispatch(setToBuyList([]));
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
  dispatch(dispatch(setCurrentCompoundClass(compoundsColors.blue.key, compoundsColors.blue.key, true)));
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
      dispatch(removeShowedCompoundFromList(index, data));
    } else {
      dispatch(addShowedCompoundToList(index, data));
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
      dispatch(removeSelectedCompoundClass(index));
      dispatch(removeFromToBuyList(data, index));
    } else {
      dispatch(addSelectedCompoundClass(currentCompoundClass, index));
      dispatch(appendToBuyList(Object.assign({}, data, { class: currentCompoundClass }), index));
    }
  }
};

export const handleBuyList = ({ isSelected, data, compoundId }) => (dispatch, getState) => {
  const state = getState();
  const currentCompoundClass = state.previewReducers.compounds.currentCompoundClass;

  dispatch(setHighlightedCompoundId(compoundId));

  if (isSelected === false) {
    dispatch(removeSelectedCompoundClass(compoundId));
    dispatch(removeFromToBuyList(data, compoundId, true));
  } else {
    dispatch(addSelectedCompoundClass(currentCompoundClass, compoundId));
    dispatch(appendToBuyList(Object.assign({}, data, { class: currentCompoundClass }), compoundId, true));
  }
};

export const handleBuyListAll = ({ isSelected, items, majorViewStage }) => (dispatch, getState) => {
  if (isSelected === false) {
    dispatch(clearCompounds(items, majorViewStage));
  } else {
    dispatch(selectAllCompounds());
  }
};

export const handleShowVectorCompound = ({ isSelected, data, index, majorViewStage }) => async (dispatch, getState) => {
  await dispatch(showCompoundNglView({ majorViewStage, data, index }));
  if (isSelected === false) {
    dispatch(removeShowedCompoundFromList(index, data));
  } else {
    dispatch(addShowedCompoundToList(index, data));
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
