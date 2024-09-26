import {
  setSelectedTagList,
  appendSelectedTagList,
  removeFromSelectedTagList
} from '../../../../reducers/selection/actions';
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
  setVectorOnList
} from '../../../../reducers/selection/actions';
import {
  setMolGroupOn,
  updateMoleculeTag,
  setAllMolLists,
  setNoTagsReceived,
  updateTag,
  setTagList,
  appendTagList,
  setCategoryList,
  setTargetDataLoadingInProgress,
  setAllDataLoaded,
  setMoleculeTags,
  setLHSCompoundsLIst
} from '../../../../reducers/api/actions';
import { setSortDialogOpen } from '../../molecule/redux/actions';
import { resetCurrentCompoundsSettings } from '../../compounds/redux/actions';
import {
  updateExistingTag,
  getTags,
  getAllDataNew,
  getTagCategories,
  getCompoundsLHS,
  getCanonSites,
  getCanonConformSites,
  getPoses
} from '../api/tagsApi';
import {
  getMoleculeTagForTag,
  createMoleculeTagObject,
  augumentTagObjectWithId,
  compareTagsAsc
} from '../utils/tagUtils';
import { DJANGO_CONTEXT } from '../../../../utils/djangoContext';

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

export const selectAllTags = (tagsToSelect = null) => (dispatch, getState) => {
  const state = getState();
  let tagList = tagsToSelect ? tagsToSelect : state.apiReducers.tagList;
  tagList.forEach(t => dispatch(appendSelectedTagList(t)));
};

export const clearAllTags = () => (dispatch, getState) => {
  const state = getState();
  let tagList = state.apiReducers.tagList;
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
  data.molecules.forEach(mol => { });
};

/**
 *
 * @param {Object} tag tag object
 * @param {*} value new value
 * @param {*} prop name of the prop to be updated
 * @returns {Promise<Object>}
 */
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
      newTag.category,
      DJANGO_CONTEXT.pk,
      newTag.colour,
      newTag.discourse_url,
      [...moleculeTag.site_observations],
      newTag.create_date,
      newTag.additional_info,
      moleculeTag.mol_group,
      newTag.hidden
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

const getTagsForMol = (molId, tagList) => {
  const result = tagList.filter(t => t.site_observations.includes(molId));
  return result;
};

export const loadMoleculesAndTagsNew = targetId => async (dispatch, getState) => {
  // console.log(`snapshotDebug - loadMoleculesAndTagsNew - before getTags`);
  let tags = await getTags(targetId);
  // console.log(`snapshotDebug - loadMoleculesAndTagsNew - after getTags`);
  tags = tags.results;
  if (tags?.length > 0) {
    // console.log(`snapshotDebug - loadMoleculesAndTagsNew - no. of tags received: ${tags?.length}`);
    dispatch(setNoTagsReceived(false));
  }
  // console.log(`snapshotDebug - loadMoleculesAndTagsNew - before getTagCategories`);
  const tagCategories = await getTagCategories();
  // console.log(`snapshotDebug - loadMoleculesAndTagsNew - no. of tag categories received: ${tagCategories?.length}`);
  // console.log(`snapshotDebug - loadMoleculesAndTagsNew - after getTagCategories`);
  // const canonSitesList = await getCanonSites(targetId);
  // const canonConformSitest = await getCanonConformSites(targetId);

  // console.log(`snapshotDebug - loadMoleculesAndTagsNew - before getAllDataNew`);
  const data = await getAllDataNew(targetId);
  // console.log(`snapshotDebug - loadMoleculesAndTagsNew - after getAllDataNew`);
  // console.log(`snapshotDebug - loadMoleculesAndTagsNew - no. of molecules received: ${data?.results?.length}`);
  let allMolecules = [];
  data?.results?.forEach(mol => {
    let newObject = { ...mol };
    const tagsForMol = getTagsForMol(mol.id, tags);
    if (tagsForMol) {
      newObject['tags_set'] = [...tagsForMol.map(t => t.id)];
    } else {
      newObject['tags_set'] = [];
    }

    const maps = {};
    maps.diff_info = mol.diff_file;
    maps.event_info = mol.event_file;
    maps.sigmaa_info = mol.sigmaa_file;
    newObject['proteinData'] = maps;

    allMolecules.push(newObject);
  });

  allMolecules?.sort((a, b) => {
    if (a.code < b.code) {
      return -1;
    }
    if (a.code > b.code) {
      return 1;
    }
    return 0;
  });

  dispatch(setAllMolLists([...allMolecules]));
  // console.log(`snapshotDebug - loadMoleculesAndTagsNew - no. of molecules stored: ${allMolecules?.length}`);
  //need to do this this way because only categories which have at least one tag assigned are sent from backend
  tags = tags.sort(compareTagsAsc);
  dispatch(setMoleculeTags(tags));
  dispatch(setTagSelectorData(tagCategories, tags));
  dispatch(setAllDataLoaded(true));

  // console.log(`snapshotDebug - loadMoleculesAndTagsNew - before getPoses`);
  return getPoses(targetId).then(poses => {
    // console.log(`snapshotDebug - loadMoleculesAndTagsNew - after getPoses`);
    const modifiedPoses = [];
    // console.log(`snapshotDebug - loadMoleculesAndTagsNew - no. of poses received: ${poses?.length}`);
    poses?.forEach(pose => {
      const siteObs = allMolecules.filter(m => pose.site_observations.includes(m.id));
      const firstObs = siteObs[0];

      let newObject = { ...pose };
      newObject['smiles'] = firstObs?.smiles;
      newObject['code'] = `${pose.display_name}`;
      newObject['canonSiteConf'] = firstObs?.canon_site_conf;
      newObject['canonSite'] = pose.canon_site;

      const associatedObs = siteObs.sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      });
      newObject['associatedObs'] = associatedObs;

      modifiedPoses.push(newObject);
    });
    modifiedPoses.sort((a, b) => {
      if (a.code < b.code) {
        return -1;
      }
      if (a.code > b.code) {
        return 1;
      }
      return 0;
    });
    dispatch(setLHSCompoundsLIst(modifiedPoses));
    // console.log(`snapshotDebug - loadMoleculesAndTagsNew - end of function`);
  });
};
