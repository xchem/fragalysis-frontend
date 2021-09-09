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
