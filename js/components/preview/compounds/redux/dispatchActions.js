import { appendToBuyList, setCompoundClasses, setToBuyList } from '../../../../reducers/selection/selectionActions';

export const selectAllCompounds = () => (dispatch, getState) => {
  const state = getState();
  const thisVectorList = state.selectionReducers.this_vector_list;
  const to_query = state.selectionReducers.to_query;
  const currentCompoundClass = state.selectionReducers.currentCompoundClass;

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
  const compoundClasses = state.selectionReducers.compoundClasses;
  // on Enter
  if (event.keyCode === 13) {
    const newClassDescription = { [event.target.id]: event.target.value };
    const descriptionToSet = Object.assign(compoundClasses, newClassDescription);

    dispatch(setCompoundClasses(descriptionToSet, event.target.id));
  }
};
