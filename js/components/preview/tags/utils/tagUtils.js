import { CATEGORY_ID, CATEGORY_TYPE } from '../../../../constants/constants';

export const DEFAULT_TAG_COLOR = '#E0E0E0';

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
    molecules: molecules,
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

export const getCategoryIds = () => {
  const result = [];

  let categoryObject = {
    id: CATEGORY_ID[CATEGORY_TYPE.SITE],
    category: CATEGORY_TYPE['SITE'],
    colour: '00CC00',
    description: null
  };
  result.push({ ...categoryObject });

  categoryObject = {
    id: CATEGORY_ID[CATEGORY_TYPE.SERIES],
    category: CATEGORY_TYPE['SERIES'],
    colour: '00CC00',
    description: null
  };
  result.push({ ...categoryObject });

  categoryObject = {
    id: CATEGORY_ID[CATEGORY_TYPE.FORUM],
    category: CATEGORY_TYPE['FORUM'],
    colour: '00CC00',
    description: null
  };
  result.push({ ...categoryObject });

  categoryObject = {
    id: CATEGORY_ID[CATEGORY_TYPE.OTHER],
    category: CATEGORY_TYPE['OTHER'],
    colour: '00CC00',
    description: null
  };
  result.push({ ...categoryObject });

  return result;
};

export const getDefaultTagDiscoursePostText = tag => {
  return `This post for tag ${tag.tag} is here to discuss its contents.`;
};
