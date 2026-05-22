import {
  setSelectedTagList,
  appendSelectedTagList,
  removeFromSelectedTagList,
  addToastMessage
} from '../../../../reducers/selection/actions';
import {
  setProteinList,
  setDensityList,
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
  setLHSCompoundsList,
  setCompoundIdentifiers,
  setDataAreDownloading,
  appendLigandData,
  setErrorOccuredDuringDownload,
  setDataAreDownloaded,
  setLHSExtraColumns,
  setRHSCompoundsList
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
  getPoses,
  getCompoundIdentifiers,
  getComputedSetInspirationMappings
} from '../api/tagsApi';
import {
  getMoleculeTagForTag,
  createMoleculeTagObject,
  augumentTagObjectWithId,
  compareTagsAsc,
  isTagVisibleOnSide,
  TAG_META_CATEGORIES
} from '../utils/tagUtils';
import { DJANGO_CONTEXT } from '../../../../utils/djangoContext';
import { TOAST_LEVELS } from '../../../toast/constants';
import { getActivityColumns, getActivityData } from '../../molecule/observationUnifiedView/api';
import v4 from 'uuid/v4';

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
      newTag.hidden,
      newTag.tag_prefix,
      newTag.upload_name,
      newTag.meta_category
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
  try {
    dispatch(setDataAreDownloading(true));
    // console.log(`snapshotDebug - loadMoleculesAndTagsNew - before getTags`);
    let tags = await getTags(targetId);
    let computedSetInspirationMappings = [];
    try {
      computedSetInspirationMappings = await getComputedSetInspirationMappings(targetId);
    } catch (error) {
      console.error('Failed to load computed set inspiration mappings', error);
    }
    let compoundIdentifiers = await getCompoundIdentifiers();

    let lhsExtraColumns = await getActivityColumns(targetId);
    let activityData = await getActivityData(targetId);
    // let lhsExtraColumns = [];
    // let tempExtraColumnsMap = {};
    // activity could be for compound or site observation
    let compoundActivityDataMap = {};
    let siteObservationActivityDataMap = {};
    activityData?.forEach(activity => {
      if (activity?.compound && activity?.compound !== 'null') {
        if (!compoundActivityDataMap[activity.compound]) {
          compoundActivityDataMap[activity.compound] = [];
        }
        compoundActivityDataMap[activity.compound].push(activity);

        // if (activity.parsing_error === false && !tempExtraColumnsMap[activity.property_name]) {
        //   tempExtraColumnsMap[activity.property_name] = {
        //     name: activity.property_name,
        //     type: activity.data_type,
        //     unit: activity.unit
        //   };
        // }
      } else if (activity?.site_observation && activity?.site_observation !== 'null') {
        if (!siteObservationActivityDataMap[activity.site_observation]) {
          siteObservationActivityDataMap[activity.site_observation] = [];
        }
        siteObservationActivityDataMap[activity.site_observation].push(activity);
      }
    });
    // lhsExtraColumns = Object.values(tempExtraColumnsMap);

    // console.log(`snapshotDebug - loadMoleculesAndTagsNew - after getTags`);
    tags = Array.isArray(tags) ? tags : tags?.results || [];
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
    const computedInspirationsByObservation = {};
    computedSetInspirationMappings?.forEach(item => {
      const siteObservationId = Number(item?.site_observation);
      const computedInspirationId = Number(item?.computed_inspiration);
      const computedSetId = Number(item?.computed_set);

      if (
        Number.isNaN(siteObservationId) ||
        Number.isNaN(computedInspirationId) ||
        Number.isNaN(computedSetId)
      ) {
        return;
      }

      if (!computedInspirationsByObservation[siteObservationId]) {
        computedInspirationsByObservation[siteObservationId] = {};
      }

      if (!computedInspirationsByObservation[siteObservationId][computedSetId]) {
        computedInspirationsByObservation[siteObservationId][computedSetId] = [];
      }

      computedInspirationsByObservation[siteObservationId][computedSetId].push(computedInspirationId);
    });

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
      newObject['computed_inspirations_by_set'] = computedInspirationsByObservation[mol.id] || null;
      newObject.identifiers = compoundIdentifiers.filter(identifier => identifier.compound === newObject.cmpd);
      if (newObject.ligand_mol_file) {
        delete newObject.ligand_mol_file;
      }

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
    dispatch(setCompoundIdentifiers(compoundIdentifiers));
    dispatch(setAllDataLoaded(true));

    //now let's create poses for RHS
    // const rhsObservations = allMolecules.filter(mol => mol.experiment === null);
    // const generatedPoses = [];
    // rhsObservations.forEach(obs => {
    //   const existingPose = generatedPoses.find(p => p.display_name === obs.name);
    //   if (!existingPose) {
    //     generatedPoses.push({
    //       id: v4(),
    //       // id: 'virtual-' + observation.id,
    //       // id: observation.id + 1000,
    //       display_name: obs.name,
    //       canon_site: null,
    //       compound: obs.cmpd,
    //       main_site_observation: obs.id,
    //       site_observations: [obs.id],
    //       main_site_observation_cmpd_code: obs.cmpd_code,
    //       smiles: obs.smiles,
    //       code: obs.code,
    //       canonSiteConf: obs.canon_site_conf,
    //       canonSite: null,
    //       associatedObs: [{ ...obs }]
    //     });
    //   } else {
    //   }
    // });

    // console.log(`snapshotDebug - loadMoleculesAndTagsNew - before getPoses`);
    return getPoses(targetId).then(poses => {
      // console.log(`snapshotDebug - loadMoleculesAndTagsNew - after getPoses`);
      const modifiedLhsPoses = [];
      const modifiedRhsPoses = [];
      // console.log(`snapshotDebug - loadMoleculesAndTagsNew - no. of poses received: ${poses?.length}`);
      poses?.forEach(pose => {
        const siteObs = allMolecules.filter(m => pose.site_observations.includes(m.id));
        const firstObs = siteObs[0];

        let newObject = { ...pose };
        newObject['smiles'] = firstObs?.smiles;
        newObject['code'] = `${pose.display_name}`;
        newObject['canonSiteConf'] = firstObs?.canon_site_conf;
        newObject['canonSite'] = pose.canon_site;

        // get activity data for its compound and all associated site observations
        const activityData = (compoundActivityDataMap[pose.compound] ?? []).concat(
          pose.site_observations.flatMap(id => siteObservationActivityDataMap[id] ?? [])
        );
        if (activityData.length > 0) {
          newObject['activityData'] = activityData;
        }
        // else {
        //   // TODO just for test!!
        //   const tmp = Object.keys(compoundActivityDataMap);
        //   const activities = compoundActivityDataMap[tmp[Math.floor((Math.random() * tmp.length))]];
        //   newObject['activityData'] = activities;
        // }

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

        // rhs poses are not linked to an experiment - currently this can't happen because there are no poses for rhs virtual observations
        if (firstObs.experiment === null) {
          modifiedRhsPoses.push(newObject);
        } else {
          modifiedLhsPoses.push(newObject);
        }
      });

      tags
        .filter(tag => isTagVisibleOnSide(tag, TAG_META_CATEGORIES.RHS))
        .forEach(tag => {
          const siteObs = allMolecules.filter(m => tag.site_observations?.includes(m.id));
          const firstObs = siteObs[0];

          const poseAlreadyExists = modifiedRhsPoses.some(pose =>
            pose.site_observations?.some(id => tag.site_observations?.includes(id))
          );

          if (!firstObs || poseAlreadyExists) {
            return;
          }

          const associatedObs = siteObs.sort((a, b) => {
            if (a.code < b.code) {
              return -1;
            }
            if (a.code > b.code) {
              return 1;
            }
            return 0;
          });

          modifiedRhsPoses.push({
            id: `rhs-tag-${tag.id}`,
            display_name: tag.upload_name || tag.tag,
            canon_site: null,
            compound: firstObs.cmpd,
            main_site_observation: firstObs.id,
            site_observations: associatedObs.map(obs => obs.id),
            main_site_observation_cmpd_code: firstObs.cmpd_code,
            smiles: firstObs.smiles,
            code: tag.upload_name || tag.tag,
            canonSiteConf: firstObs.canon_site_conf,
            canonSite: null,
            associatedObs
          });
        });

      modifiedLhsPoses.sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      });
      modifiedRhsPoses.sort((a, b) => {
        if (a.code < b.code) {
          return -1;
        }
        if (a.code > b.code) {
          return 1;
        }
        return 0;
      });
      dispatch(setLHSCompoundsList(modifiedLhsPoses));
      dispatch(setRHSCompoundsList(modifiedRhsPoses));
      // TODO there are assay columns for lhs and scores for rhs mixed together so do not set it atm
      // dispatch(setLHSExtraColumns(lhsExtraColumns));
      // console.log(`snapshotDebug - loadMoleculesAndTagsNew - end of function`);
    });
  } catch (error) {
    console.error('Error loading molecules and tags:', error);
    dispatch(setErrorOccuredDuringDownload(true));
    dispatch(
      addToastMessage({
        text: `Error while downloading data. Please try again later. If the issue persists please contact us.`,
        level: TOAST_LEVELS.ERROR
      })
    );
  } finally {
    dispatch(setDataAreDownloading(false));
    dispatch(setDataAreDownloaded(true));
  }
};

// export const getLigandData = obs => async (dispatch, getState) => {
//   const state = getState();
//   const ligandDataList = state.apiReducers.ligandData;
//   const ligandDataEntry = ligandDataList.find(entry => entry.obsId === obs.id);

//   if (ligandDataEntry) {
//     return ligandDataEntry.ligandData;
//   }

//   // const path = obs.ligand_mol || obs.associatedObs.ligand_mol;
//   let path = obs.ligand_mol;
//   let obsId = obs.id;
//   if (!path && obs.associatedObs?.length > 0 && obs.main_site_observation) {
//     const associatedObs = obs.associatedObs.find(o => o.id === obs.main_site_observation);
//     if (associatedObs) {
//       path = associatedObs.ligand_mol;
//       obsId = associatedObs.id;
//     }
//   }
//   if (!path) {
//     console.error(`getLigandData - No ligand_mol path provided for observation ID: ${obsId}`);
//     return null;
//   }
//   const response = await fetch(path);
//   const text = await response.text();
//   dispatch(appendLigandData(obsId, text));
//   return text;
// };

export const getLigandData = obs => async (dispatch, getState) => {
  const state = getState();
  const ligandDataList = state.apiReducers.ligandData;
  const ligandDataEntry = ligandDataList.find(entry => entry.obsId === obs.id);

  if (ligandDataEntry) {
    return ligandDataEntry.ligandData;
  }

  // const path = obs.ligand_mol || obs.associatedObs.ligand_mol;
  let path = obs.ligand_mol || obs.virtual_ligand_mol;

  if (!path) {
    // console.error(`getLigandData - No ligand_mol path provided for observation ID: ${obs.id}`);
    return null;
  }
  const response = await fetch(path);
  const text = await response.text();
  dispatch(appendLigandData(obs.id, text));
  return text;
};
