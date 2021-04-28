import {
  setSelectedTagList,
  appendSelectedTagList,
  removeFromSelectedTagList,
  setCategoryList,
  setTagList
} from '../../../../reducers/selection/actions';

import { categories, tags } from './data';

export const clearTagSelection = () => (dispatch, getState) => {
  dispatch(setSelectedTagList([]));
};

export const addSelectedTag = tagItem => dispatch => {
  dispatch(appendSelectedTagList(tagItem));
};

export const removeSelectedTag = tagItem => dispatch => {
  dispatch(removeFromSelectedTagList(tagItem));
};

export const setTagSelectorData = () => dispatch => {
  dispatch(setCategoryList(categories));
  dispatch(setTagList(tags));
};
