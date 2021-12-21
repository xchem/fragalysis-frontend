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
import {
  setMolGroupOn,
  updateMoleculeTag,
  setAllMolLists,
  setMoleculeTags,
  setDownloadTags,
  setNoTagsReceived
} from '../../../../reducers/api/actions';
import { setSortDialogOpen } from '../../molecule/redux/actions';
import { resetCurrentCompoundsSettings } from '../../compounds/redux/actions';
import { getRandomColor } from '../../molecule/utils/color';
import { updateExistingTag, getAllData } from '../api/tagsApi';
import {
  getMoleculeTagForTag,
  createMoleculeTagObject,
  augumentTagObjectWithId,
  compareTagsAsc,
  getCategoryIds
} from '../utils/tagUtils';
import { DJANGO_CONTEXT } from '../../../../utils/djangoContext';
import { diffBetweenDatesInDays } from '../../../../utils/common';

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

export const selectTag = tag => (dispatch, getState) => {
  const state = getState();
  const selectedTagList = state.selectionReducers.selectedTagList;
  if (!selectedTagList.some(i => i.id === tag.id)) {
    dispatch(addSelectedTag(tag));
  }
};

export const unselectTag = tag => (dispatch, getState) => {
  const state = getState();
  const selectedTagList = state.selectionReducers.selectedTagList;
  if (selectedTagList.some(i => i.id === tag.id)) {
    dispatch(removeSelectedTag(tag));
  }
};

export const loadMoleculesAndTags = targetId => async (dispatch, getState) => {
  return getAllData(targetId).then(data => {
    let tags_info = [];
    let downloadTags = [];
    if (data.tags_info && data.tags_info.length > 0) {
      dispatch(setNoTagsReceived(false));
      data.tags_info.forEach(tag => {
        let newObject = {};
        Object.keys(tag.data[0]).forEach(prop => {
          newObject[`${prop}`] = tag.data[0][`${prop}`];
        });
        let coords = {};
        if (tag.coords && tag.coords.length > 1) {
          Object.keys(tag.coords[0]).forEach(prop => {
            coords[`${prop}`] = tag.coords[0][`${prop}`];
          });
        }
        newObject['coords'] = coords;

        if (!newObject.additional_info) {
          tags_info.push(newObject);
        } else if (newObject.additional_info.requestObject && newObject.additional_info.downloadName) {
          if (DJANGO_CONTEXT.pk) {
            if (newObject.user_id === DJANGO_CONTEXT.pk) {
              downloadTags.push(newObject);
            }
          } else {
            const diffInDays = diffBetweenDatesInDays(new Date(newObject.create_date), new Date());
            if (diffInDays <= 5) {
              downloadTags.push(newObject);
            }
          }
        }
      });
    }

    let allMolecules = [];
    data.molecules.forEach(mol => {
      let newObject = {};
      Object.keys(mol.data).forEach(prop => {
        newObject[`${prop}`] = mol.data[`${prop}`];
      });
      newObject['tags_set'] = mol.tags_set;

      allMolecules.push(newObject);
    });
    allMolecules.sort((a, b) => {
      if (a.protein_code < b.protein_code) {
        return -1;
      }
      if (a.protein_code > b.protein_code) {
        return 1;
      }
      return 0;
    });
    dispatch(setAllMolLists([...allMolecules]));
    dispatch(setDownloadTags(downloadTags));

    // const categories = data.tag_categories;
    //need to do this this way because only categories which have at least one tag assigned are sent from backend
    const categories = getCategoryIds();
    tags_info = tags_info.sort(compareTagsAsc);
    dispatch(setTagSelectorData(categories, tags_info));
    //console.log(tags_info);
  });
};
