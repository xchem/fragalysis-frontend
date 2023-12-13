import { CATEGORY_ID, CATEGORY_TYPE, CATEGORY_TYPE_BY_ID } from '../../../../constants/constants';

export const DEFAULT_TAG_COLOR = '#E0E0E0';
export const DEFAULT_CATEGORY = 1;

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
  molGroup = null
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
    mol_group: molGroup
  };
};

export const compareTagsAsc = (a, b) => {
  if (a.tag < b.tag) {
    return -1;
  }
  if (a.tag > b.tag) {
    return 1;
  }
  return 0;
};

export const compareTagsDesc = (a, b) => {
  if (a.tag > b.tag) {
    return -1;
  }
  if (a.tag < b.tag) {
    return 1;
  }
  return 0;
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

export const getAllTagsForLHSCmp = (observations, tagList) => {
  const result = [];

  observations &&
    observations.forEach(obs => {
      obs.tags_set &&
        obs.tags_set.forEach(tagId => {
          let tag = tagList.filter(t => t.id === tagId);
          if (tag && tag.length > 0 && !result.some(t => t.id === tag[0].id)) {
            result.push(tag[0]);
          }
        });
    });

  return result;
};

export const getDefaultTagDiscoursePostText = tag => {
  return `This post for tag ${tag.tag} is here to discuss its contents.`;
};
