import {
  setSelectedTagList,
  appendSelectedTagList,
  removeFromSelectedTagList,
  setCategoryList,
  setTagList,
  appendTagList,
  appendToDisplayAllNGLList,
  removeFromDisplayAllNGLList,
  appendToListAllForTagList,
  removeFromListAllForTagList
} from '../../../../reducers/selection/actions';
import { CATEGORY_TYPE } from '../../../../constants/constants';
import { addLigand, removeLigand } from '../../molecule/redux/dispatchActions';
import {
  setProteinList,
  setDensityList,
  setDensityListCustom,
  setQualityList,
  setComplexList,
  setSurfaceList,
  setFilter,
  setFragmentDisplayList,
  setMolGroupSelection,
  setVectorList,
  setVectorOnList,
  updateTag
} from '../../../../reducers/selection/actions';
import { setMolGroupOn, updateMoleculeTag } from '../../../../reducers/api/actions';
import { setSortDialogOpen } from '../../molecule/redux/actions';
import { resetCurrentCompoundsSettings } from '../../compounds/redux/actions';
import { getRandomColor } from '../../molecule/utils/color';
import { getMoleculeTagForTag, createMoleculeTagObject, augumentTagObjectWithId } from '../utils/tagUtils';
import { DJANGO_CONTEXT } from '../../../../utils/djangoContext';
import { updateExistingTag } from '../api/tagsApi';

export const setTagSelectorData = (categories, tags) => dispatch => {
  dispatch(setCategoryList(categories));
  dispatch(setTagList(tags));
};

export const addSelectedTag = tagItem => dispatch => {
  dispatch(appendSelectedTagList(tagItem));
};

export const removeSelectedTag = tagItem => dispatch => {
  dispatch(removeFromSelectedTagList(tagItem));
};

export const selectAllTags = () => (dispatch, getState) => {
  const state = getState();
  let tagList = state.selectionReducers.tagList;
  tagList.forEach(t => dispatch(appendSelectedTagList(t)));
};

export const clearAllTags = () => (dispatch, getState) => {
  const state = getState();
  let tagList = state.selectionReducers.tagList;
  tagList.forEach(t => dispatch(removeFromSelectedTagList(t)));
};

export const editTag = ({ tag, data }) => (dispatch, getState) => {
  tag.text = data.text;
  tag.color = data.color;
  tag.forumPost = data.forumPost;
  tag.category = data.category?.id;
  let newCategory = data.category?.id === null ? data.category : null;
  return Promise.resolve(null);
};

export const addTag = ({ molecule, data }) => (dispatch, getState) => {
  let tags = data.tags;
  molecule.tags = tags;
  let newTags = tags.filter(t => t.id === null);
  if (newTags) {
    newTags.forEach(tag => {
      dispatch(appendTagList(tag));
    });
  }
  return Promise.resolve(null);
};

export const clearTagSelection = () => (dispatch, getState) => {
  dispatch(setSelectedTagList([]));
  dispatch(clearSelectionState());
};

const clearSelectionState = () => (dispatch, getState) => {
  dispatch(setMolGroupOn(undefined));
  dispatch(setMolGroupSelection([]));

  dispatch(setProteinList([]));
  dispatch(setDensityList([]));
  dispatch(setDensityListCustom([]));
  dispatch(setQualityList([]));
  dispatch(setSurfaceList([]));
  dispatch(setFragmentDisplayList([]));
  dispatch(setComplexList([]));
  dispatch(setVectorOnList([]));
  dispatch(setVectorList([]));

  dispatch(setFilter(undefined));
  dispatch(setSortDialogOpen(false));
  dispatch(resetCurrentCompoundsSettings(true));
};

export const storeData = data => (dispatch, getState) => {
  const categories = data.tag_categories;
  const tags = data.tags_info;

  dispatch(setTagSelectorData(categories, tags));

  let allMolecules = [];
  data.molecules.forEach(mol => {});
};

export const displayAllMolsInNGL = (stage, tag) => (dispatch, getState) => {
  const state = getState();
  const allMolecules = state.apiReducers.all_mol_lists;
  const taggedMolecules = allMolecules.filter(mol => mol.tags_set.some(id => id === tag.id));
  taggedMolecules.forEach(mol => {
    const color = getRandomColor(mol);
    dispatch(addLigand(stage, mol, color, false, true, true));
  });
  dispatch(appendToDisplayAllNGLList(tag));
};

export const hideAllMolsInNGL = (stage, tag) => (dispatch, getState) => {
  const state = getState();
  const allMolecules = state.apiReducers.all_mol_lists;
  const taggedMolecules = allMolecules.filter(mol => mol.tags_set.some(id => id === tag.id));
  taggedMolecules.forEach(mol => {
    dispatch(removeLigand(stage, mol, true));
  });
  dispatch(removeFromDisplayAllNGLList(tag));
};

export const displayInListForTag = tag => dispatch => {
  dispatch(appendToListAllForTagList(tag));
};

export const hideInListForTag = tag => dispatch => {
  dispatch(removeFromListAllForTagList(tag));
};

export const updateTagProp = (tag, value, prop) => (dispatch, getState) => {
  const state = getState();
  const molTags = state.apiReducers.moleculeTags;

  if (value) {
    const newTag = { ...tag };
    newTag[prop] = value;
    dispatch(updateTag(newTag));
    const moleculeTag = getMoleculeTagForTag(molTags, newTag.id);
    let newMolTag = createMoleculeTagObject(
      newTag.tag,
      moleculeTag.target,
      newTag.category_id,
      DJANGO_CONTEXT.pk,
      newTag.colour,
      newTag.discourse_url,
      [...moleculeTag.molecules],
      newTag.create_date,
      newTag.additional_info,
      moleculeTag.mol_group
    );
    let augMolTagObject = augumentTagObjectWithId(newMolTag, tag.id);
    dispatch(updateMoleculeTag(augMolTagObject));
    return updateExistingTag(newMolTag, tag.id);
  }
};

export const getMoleculeForId = molId => (dispatch, getState) => {
  const state = getState();
  const molList = state.apiReducers.all_mol_lists;
  return molList.find(m => m.id === molId);
};
