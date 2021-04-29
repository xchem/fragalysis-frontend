import {
  setSelectedTagList,
  appendSelectedTagList,
  removeFromSelectedTagList,
  setCategoryList,
  setTagList,
  setSpecialTagList
} from '../../../../reducers/selection/actions';
import { TAG_TYPE } from '../../../../constants/constants';
import { categories, tags } from './tempData';
import { specialTags } from './data';

export const setTagSelectorData = () => dispatch => {
  dispatch(setCategoryList(categories));
  dispatch(setTagList(tags));
  dispatch(setSpecialTagList(specialTags));
};

export const addSelectedTag = (tagItem, tags) => dispatch => {
  if (tagItem.text === TAG_TYPE.ALL && tags) {
    tags.forEach(tag => {
      dispatch(appendSelectedTagList(tag));
    });
  }
  dispatch(appendSelectedTagList(tagItem));
};

export const removeSelectedTag = tagItem => dispatch => {
  if (tagItem.text === TAG_TYPE.ALL && tags) {
    tags.forEach(tag => {
      dispatch(removeFromSelectedTagList(tag));
    });
  }
  dispatch(removeFromSelectedTagList(tagItem));
};

export const clearTagSelection = () => (dispatch, getState) => {
  dispatch(setSelectedTagList([]));
};
