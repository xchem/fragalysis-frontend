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
  setCurrentCompoundClass,
  setSelectedCompounds
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
import {
  appendColorToSelectedColorFilter,
  appendMoleculeToCompoundsOfDatasetToBuy,
  removeColorFromSelectedColorFilter,
  removeMoleculeFromCompoundsOfDatasetToBuy,
  setEditedColorGroup,
  updateFilterShowedScoreProperties
} from '../../../datasets/redux/actions';
import { isRemoteDebugging } from '../../../routes/constants';

export const selectAllCompounds = () => (dispatch, getState) => {
  //this one is for the vector compounds
  const state = getState();
  const currentVectorCompoundsFiltered = getCurrentVectorCompoundsFiltered(state);

  const moleculeOfVector = getMoleculeOfCurrentVector(state);
  const smiles = moleculeOfVector && moleculeOfVector.smiles;
  const currentCompoundClass = state.previewReducers.compounds.currentCompoundClass;
  const selectedCompounds = state.previewReducers.compounds.allSelectedCompounds;

  let items = [];

  let selectedCompoundsAux = { ...selectedCompounds };

  for (let key in currentVectorCompoundsFiltered) {
    for (let index in currentVectorCompoundsFiltered[key]) {
      if (index !== 'vector') {
        for (let indexOfCompound in currentVectorCompoundsFiltered[key][index]) {
          let compoundId = parseInt(indexOfCompound);
          var thisObj = {
            smiles: currentVectorCompoundsFiltered[key][index][indexOfCompound].end,
            vector: currentVectorCompoundsFiltered[key].vector.split('_')[0],
            mol: smiles,
            class: currentCompoundClass,
            compoundId: compoundId,
            compound_ids: [...currentVectorCompoundsFiltered[key][index][indexOfCompound].compound_ids]
          };

          thisObj['index'] = indexOfCompound;
          thisObj['compoundClass'] = currentCompoundClass;
          items.push(thisObj);
          dispatch(appendToBuyList(thisObj, compoundId, true));
          dispatch(addSelectedCompoundClass(currentCompoundClass, compoundId));
          dispatch(appendMoleculeToCompoundsOfDatasetToBuy(AUX_VECTOR_SELECTOR_DATASET_ID, thisObj.smiles, '', true));
          selectedCompoundsAux[thisObj.smiles] = thisObj;
        }
      }
    }
  }

  dispatch(setSelectedCompounds(selectedCompoundsAux));
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
  // on Enter
  if (event.keyCode === 13 && event.target.id && event.target.id !== '') {
    // const state = getState();
    // let oldCompoundClass = state.previewReducers.compounds.currentCompoundClass;
    // dispatch(setCurrentCompoundClass(event.target.id, oldCompoundClass));
    dispatch(setEditedColorGroup(null));
  }
};

export const onStartEditColorClassName = event => (dispatch, getState) => {
  const state = getState();
  const currentColorGroup = state.datasetsReducers.editedColorGroup;
  const colorGroup = event.currentTarget.value;
  if (colorGroup !== currentColorGroup) {
    dispatch(setEditedColorGroup(colorGroup));
  } else {
    dispatch(setEditedColorGroup(null));
  }
};

export const onChangeCompoundClassCheckbox = event => (dispatch, getState) => {
  if (event.target.value && event.target.value !== '') {
    const state = getState();
    let oldCompoundClass = state.previewReducers.compounds.currentCompoundClass;
    if (oldCompoundClass !== event.target.value) {
      dispatch(setCurrentCompoundClass(event.target.value, oldCompoundClass));
    } else {
      dispatch(setCurrentCompoundClass(null, oldCompoundClass));
    }
  }
};

export const onClickCompoundClass = event => (dispatch, getState) => {
  if (event.target.id && event.target.id !== '') {
    const state = getState();
    let oldCompoundClass = state.previewReducers.compounds.currentCompoundClass;
    dispatch(setCurrentCompoundClass(event.target.id, oldCompoundClass));
  }
};

const handleColorOfFilter = color => (dispatch, getState) => {
  const state = getState();
  const currentColorFilterSettings = state.datasetsReducers.selectedColorsInFilter;
  if (currentColorFilterSettings.hasOwnProperty(color)) {
    dispatch(removeColorFromSelectedColorFilter(color));
  } else {
    dispatch(appendColorToSelectedColorFilter(color));
  }
};

export const onClickFilterClassCheckBox = event => (dispatch, getState) => {
  dispatch(handleColorOfFilter(event.target.value));
};

export const onClickFilterClass = event => (dispatch, getState) => {
  dispatch(handleColorOfFilter(event.target.id));
};

export const onKeyDownFilterClass = event => (dispatch, getState) => {
  if (event.keyCode === 13) {
    dispatch(handleColorOfFilter(event.target.id));
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

  if (showedCompoundList.find(item => item === data.smiles) !== undefined) {
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

    let headersObj = {};
    if (isRemoteDebugging) {
      headersObj = {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
        //'X-CSRFToken': getCsrfToken()
      };
    } else {
      headersObj = {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': getCsrfToken()
      };
    }

    api({
      url: base_url + '/scoring/gen_conf_from_vect/',
      method: METHOD.POST,
      headers: headersObj,
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

  const selectedCompounds = state.previewReducers.compounds.allSelectedCompounds;

  let selectedCompoundsAux = { ...selectedCompounds };

  dispatch(removeFromToBuyListAll(items));
  dispatch(setToBuyList([]));
  items.forEach(item => {
    dispatch(removeMoleculeFromCompoundsOfDatasetToBuy(AUX_VECTOR_SELECTOR_DATASET_ID, item.smiles, '', true));
    if (selectedCompoundsAux[item.smiles]) {
      delete selectedCompoundsAux[item.smiles];
    }
  });

  dispatch(setSelectedCompounds(selectedCompoundsAux));

  // reset objects from nglView and showedCompoundList
  const currentCompounds = state.previewReducers.compounds.currentCompounds;
  const showedCompoundList = state.previewReducers.compounds.showedCompoundList;
  showedCompoundList.forEach(smiles => {
    const data = currentCompounds.find(c => (c.smiles = smiles));
    const index = data.index;
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

export const prepareFakeFilterData = () => (dispatch, getState) => {
  dispatch(
    updateFilterShowedScoreProperties({
      datasetID: AUX_VECTOR_SELECTOR_DATASET_ID,
      scoreList: [
        { id: 1, name: 'smiles', description: 'smiles', computed_set: AUX_VECTOR_SELECTOR_DATASET_ID },
        { id: 2, name: 'mol', description: 'mol', computed_set: AUX_VECTOR_SELECTOR_DATASET_ID },
        { id: 3, name: 'vector', description: 'vector', computed_set: AUX_VECTOR_SELECTOR_DATASET_ID },
        { id: 4, name: 'class', description: 'class', computed_set: AUX_VECTOR_SELECTOR_DATASET_ID },
        { id: 5, name: 'compoundClass', description: 'compoundClass', computed_set: AUX_VECTOR_SELECTOR_DATASET_ID }
      ]
    })
  );
};

export const isCompoundFromVectorSelector = data => {
  if (data && data['index'] !== undefined) {
    return true;
  } else {
    return false;
  }
};

export const deselectVectorCompound = data => (dispatch, getState) => {
  if (isCompoundFromVectorSelector(data)) {
    const index = data['index'];

    const state = getState();
    const selectedCompounds = state.previewReducers.compounds.allSelectedCompounds;

    dispatch(removeSelectedCompoundClass(index));
    dispatch(removeFromToBuyList(data, index));
    const selectedCompoundsCopy = { ...selectedCompounds };
    delete selectedCompoundsCopy[data.smiles];
    dispatch(setSelectedCompounds(selectedCompoundsCopy));
  }
};

export const showHideLigand = (data, majorViewStage) => async (dispatch, getState) => {
  const state = getState();
  const showedCompoundList = state.previewReducers.compounds.showedCompoundList;

  const index = data.index;
  await dispatch(showCompoundNglView({ majorViewStage, data, index }));
  if (showedCompoundList.find(item => item === data.smiles) !== undefined) {
    dispatch(removeShowedCompoundFromList(index, data));
  } else {
    dispatch(addShowedCompoundToList(index, data));
  }
};

export const handleClickOnCompound = ({ event, data, majorViewStage, index }) => async (dispatch, getState) => {
  // This is for the vector compounds
  const state = getState();
  const currentCompoundClass = state.previewReducers.compounds.currentCompoundClass;
  const selectedCompoundsClass = state.previewReducers.compounds.selectedCompoundsClass;
  const selectedCompounds = state.previewReducers.compounds.allSelectedCompounds;

  dispatch(setHighlightedCompoundId(index));

  if (event.shiftKey) {
    dispatch(showHideLigand(data, majorViewStage));
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
      dispatch(removeMoleculeFromCompoundsOfDatasetToBuy(AUX_VECTOR_SELECTOR_DATASET_ID, data.smiles, '', true));
      const selectedCompoundsCopy = { ...selectedCompounds };
      delete selectedCompoundsCopy[data.smiles];
      dispatch(setSelectedCompounds(selectedCompoundsCopy));
    } else {
      data['index'] = index;
      data['compoundClass'] = currentCompoundClass;
      dispatch(addSelectedCompoundClass(currentCompoundClass, index));
      dispatch(appendToBuyList(Object.assign({}, data, { class: currentCompoundClass, compoundId: index }), index));
      dispatch(appendMoleculeToCompoundsOfDatasetToBuy(AUX_VECTOR_SELECTOR_DATASET_ID, data.smiles, '', true));
      const selectedCompoundsCopy = { ...selectedCompounds };
      selectedCompoundsCopy[data.smiles] = data;
      dispatch(setSelectedCompounds(selectedCompoundsCopy));
    }
  }
};

export const handleBuyList = ({ isSelected, data, skipTracking }) => (dispatch, getState) => {
  // this is for vector compounds - used in saved state actions
  const state = getState();
  const selectedCompounds = state.previewReducers.compounds.allSelectedCompounds;

  let compoundId = data.compoundId;
  dispatch(setHighlightedCompoundId(compoundId));

  if (isSelected === false) {
    dispatch(removeSelectedCompoundClass(compoundId));
    dispatch(removeFromToBuyList(data, compoundId, skipTracking));
    dispatch(removeMoleculeFromCompoundsOfDatasetToBuy(AUX_VECTOR_SELECTOR_DATASET_ID, data.smiles, '', true));
    const selectedCompoundsCopy = { ...selectedCompounds };
    delete selectedCompoundsCopy[data.smiles];
    dispatch(setSelectedCompounds(selectedCompoundsCopy));
  } else {
    dispatch(addSelectedCompoundClass(data.class, compoundId));
    dispatch(appendToBuyList(Object.assign({}, data), compoundId, skipTracking));
    dispatch(appendMoleculeToCompoundsOfDatasetToBuy(AUX_VECTOR_SELECTOR_DATASET_ID, data.smiles, '', true));
    const selectedCompoundsCopy = { ...selectedCompounds };
    selectedCompoundsCopy[data.smiles] = data;
    dispatch(setSelectedCompounds(selectedCompoundsCopy));
  }
};

export const handleBuyListAll = ({ isSelected, items, majorViewStage }) => (dispatch, getState) => {
  if (isSelected === false) {
    dispatch(clearCompounds(items, majorViewStage));
  } else {
    dispatch(selectAllCompounds());
  }
};

export const handleShowVectorCompound = ({ isSelected, data, majorViewStage }) => async (dispatch, getState) => {
  const index = data.index;
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
