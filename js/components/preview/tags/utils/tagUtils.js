import { is } from 'date-fns/locale';
import {
  CATEGORY_TYPE_BY_ID,
  OBSERVATION_TAG_CATEGORIES,
  COMPOUND_PRIO_TAG_CATEGORIES,
  TAG_DETAILS_REMOVED_CATEGORIES,
  NON_ASSIGNABLE_CATEGORIES,
  CATEGORY_TYPE
} from '../../../../constants/constants';

export const DEFAULT_TAG_COLOR = '#E0E0E0';
export const DEFAULT_CATEGORY = 8;

export const createMoleculeTagObject = (
  tagName,
  targetId,
  tagCategoryId,
  userId,
  color,
  discourseUrl,
  molecules,
  createDate = new Date(),
  additionalInfo = null,
  molGroup = null,
  hidden = false
) => {
  return {
    tag: tagName,
    target: targetId,
    category: tagCategoryId,
    user: userId,
    colour: color,
    discourse_url: discourseUrl,
    site_observations: molecules,
    create_date: createDate,
    help_text: tagName,
    additional_info: additionalInfo,
    mol_group: molGroup,
    hidden: hidden
  };
};

/**
 * Compare tags, first by category and then by name
 *
 * @param {TagObject} a
 * @param {TagObject} b
 * @param {boolean} asc true for asc, false for desc
 * @returns
 */
export const compareTagsByCategoryAndName = (a, b, asc = true) => {
  // by category first
  if (a.category < b.category) {
    return -1;
  }
  if (a.category > b.category) {
    return 1;
  }
  // then by name
  const aName = a.tag_prefix ? `${a.tag_prefix} - ${a.tag}` : a.tag;
  const bName = b.tag_prefix ? `${b.tag_prefix} - ${b.tag}` : b.tag;
  return asc ? aName.localeCompare(bName, undefined, { numeric: true, sensitivity: 'base' })
    : bName.localeCompare(aName, undefined, { numeric: true, sensitivity: 'base' });
};

export const compareTagsByCategoryAndNameAsc = (a, b) => {
  compareTagsByCategoryAndName(a, b, true);
}

export const compareTagsAsc = (a, b) => {
  return compareTagsByCategoryAndName(a, b, true);
};

export const compareTagsDesc = (a, b) => {
  return compareTagsByCategoryAndName(a, b, false);
};

export const compareTagsByCategoryAsc = (a, b) => {
  if (CATEGORY_TYPE_BY_ID[a.category] < CATEGORY_TYPE_BY_ID[b.category]) {
    return -1;
  }
  if (CATEGORY_TYPE_BY_ID[a.category] > CATEGORY_TYPE_BY_ID[b.category]) {
    return 1;
  }
  return 0;
};

export const compareTagsByCategoryDesc = (a, b) => {
  if (CATEGORY_TYPE_BY_ID[a.category] > CATEGORY_TYPE_BY_ID[b.category]) {
    return -1;
  }
  if (CATEGORY_TYPE_BY_ID[a.category] < CATEGORY_TYPE_BY_ID[b.category]) {
    return 1;
  }
  return 0;
};

export const compareTagsByCreatorAsc = (a, b) => {
  if (a.user_id < b.user_id) {
    return -1;
  }
  if (a.user_id > b.user_id) {
    return 1;
  }
  return 0;
};

export const compareTagsByCreatorDesc = (a, b) => {
  if (a.user_id > b.user_id) {
    return -1;
  }
  if (a.user_id < b.user_id) {
    return 1;
  }
  return 0;
};

export const compareTagsByDateAsc = (a, b) => {
  if (a.create_date < b.create_date) {
    return -1;
  }
  if (a.create_date > b.create_date) {
    return 1;
  }
  return 0;
};

export const compareTagsByDateDesc = (a, b) => {
  if (a.create_date > b.create_date) {
    return -1;
  }
  if (a.create_date < b.create_date) {
    return 1;
  }
  return 0;
};

export const getMoleculeTagForTag = (tagList, tagId) => {
  return tagList.find(t => t.id === tagId);
};

export const augumentTagObjectWithId = (tag, tagId) => {
  return { ...tag, id: tagId };
};

export const getAllTagsForMol = (mol, tagList) => {
  const result = [];

  mol.tags_set &&
    mol.tags_set.forEach(tagId => {
      let tag = tagList.filter(t => t.id === tagId);
      if (tag && tag.length > 0) {
        result.push(tag[0]);
      }
    });

  return result;
};

export const getObservationTagConfig = tagCategoryList => {
  const result = [];

  OBSERVATION_TAG_CATEGORIES.forEach(categName => {
    const categ = tagCategoryList.find(c => c.category === categName);
    if (categ) {
      result.push({ ...categ });
    }
  });

  return result;
};

export const getAllTagsForCategories = (obs, tagList, tagCategoryList) => {
  const result = [];

  tagCategoryList.forEach(categ => {
    obs?.tags_set.find(tagId => {
      const tag = tagList.find(t => t.id === tagId);
      if (tag?.category === categ.id) {
        result.push(tag);
      }
    });
  });

  return result;
};

export const getAllTagsForObservation = (obs, tagList, tagCategoryList) => {
  const result = [];

  const categories = getObservationTagConfig(tagCategoryList);
  categories.forEach(categ => {
    obs?.tags_set.find(tagId => {
      const tag = tagList.find(t => t.id === tagId);
      if (tag?.category === categ.id) {
        result.push(tag);
      }
    });
  });

  return result;
};

/**
 * Get only "other"/curator tags
 *
 * @param {*} obs
 * @param {*} tagList
 * @param {*} tagCategoryList
 * @returns
 */
export const getAllTagsForObservationPopover = (obs, tagList, tagCategoryList) => {
  const result = [];
  const categories = [];

  tagCategoryList.forEach(c => {
    if (!NON_ASSIGNABLE_CATEGORIES.includes(c.category)) {
      categories.push({ ...c });
    }
  });

  categories.forEach(categ => {
    obs?.tags_set.find(tagId => {
      const tag = tagList.find(t => t.id === tagId);
      if (!tag.hidden && tag?.category === categ.id) {
        result.push(tag);
      }
    });
  });

  return result;
};

export const getCategoriesToBeRemovedFromTagDetails = tagCategoryList => {
  const result = [];

  TAG_DETAILS_REMOVED_CATEGORIES.forEach(categName => {
    const categ = tagCategoryList.find(c => c.category === categName);
    if (categ) {
      result.push({ ...categ });
    }
  });

  return result;
};

export const getCompoundPriorityTagConfig = (tagCategoryList, isSingleObs) => {
  const result = [];

  let allCategoryNames = [];
  if (isSingleObs) {
    allCategoryNames = [...COMPOUND_PRIO_TAG_CATEGORIES, ...OBSERVATION_TAG_CATEGORIES];
  } else {
    allCategoryNames = [...COMPOUND_PRIO_TAG_CATEGORIES];
  }

  allCategoryNames.forEach(categName => {
    const categ = tagCategoryList.find(c => c.category === categName);
    if (categ) {
      result.push({ ...categ });
    }
  });

  return result;
};

export const getAllTagsForLHSCmp = (observations, tagList, tagCategoryList) => {
  let result = [];

  // const isSingleObs = !!(observations?.length <= 1);
  const isSingleObs = false; //functionality was disabled upon request

  const prioCategories = getCompoundPriorityTagConfig(tagCategoryList, isSingleObs);
  const prioTags = [];

  prioCategories?.forEach(categ => {
    observations?.forEach(obs =>
      obs?.tags_set.find(tagId => {
        const tag = tagList.find(t => t.id === tagId);
        if (tag?.category === categ.id && !prioTags.some(t => t.id === tag.id)) {
          prioTags.push(tag);
        }
      })
    );
  });

  const restOfTheTags = [];

  observations?.forEach(obs => {
    const obsPrioTags = getAllTagsForObservation(obs, tagList, tagCategoryList);
    obs?.tags_set.forEach(tagId => {
      let tag = tagList.find(t => t.id === tagId);
      if (
        tag &&
        !restOfTheTags.some(t => t.id === tag.id) &&
        !prioTags.some(t => t.id === tag.id) &&
        !obsPrioTags.some(t => t.id === tag.id)
      ) {
        restOfTheTags.push(tag);
      }
    });
  });

  const sortedRestOfTheTags = restOfTheTags.sort((a, b) => a.tag.localeCompare(b.tag));

  result = [...prioTags, ...sortedRestOfTheTags];

  return result;
};

export const getDefaultTagDiscoursePostText = tag => {
  return `This post for tag ${tag.tag} is here to discuss its contents.`;
};

export const getEditNewTagCategories = tagCategoryList => {
  let result = [];

  result = tagCategoryList?.filter(categ => !NON_ASSIGNABLE_CATEGORIES.some(c => c === categ.category)) || [];

  return result;
};

export const getProhibitedCategoriesForEdit = tagCategoryList => {
  let result = [];

  result = tagCategoryList?.filter(categ => NON_ASSIGNABLE_CATEGORIES.some(c => c === categ.category)) || [];

  return result;
};

export const getProhibitedCategoriesForEditIds = tagCategoryList => {
  return getProhibitedCategoriesForEdit(tagCategoryList).map(c => c.id);
};
