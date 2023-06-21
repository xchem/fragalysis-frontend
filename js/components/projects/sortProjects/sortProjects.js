export const compareNameAsc = (a, b) => {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
};

export const compareNameDesc = (a, b) => {
  if (a.name > b.name) {
    return -1;
  }
  if (a.name < b.name) {
    return 1;
  }
  return 0;
};

export const compareTargetAsc = (a, b) => {
  if (a.target.title < b.target.title) {
    return -1;
  }
  if (a.target.title > b.target.title) {
    return 1;
  }
  return 0;
};

export const compareTargetDesc = (a, b) => {
  if (a.target.title > b.target.title) {
    return -1;
  }
  if (a.target.title < b.target.title) {
    return 1;
  }
  return 0;
};

export const compareDescriptionAsc = (a, b) => {
  if (a.description < b.description) {
    return -1;
  }
  if (a.description > b.description) {
    return 1;
  }
  return 0;
};

export const compareDescriptionDesc = (a, b) => {
  if (a.description > b.description) {
    return -1;
  }
  if (a.description < b.description) {
    return 1;
  }
  return 0;
};

export const compareTargetAccessStringAsc = (a, b) => {
  if (a.targetAccessString < b.targetAccessString) {
    return -1;
  }
  if (a.targetAccessString > b.targetAccessString) {
    return 1;
  }
  return 0;
};

export const compareTargetAccessStringDesc = (a, b) => {
  if (a.targetAccessString > b.targetAccessString) {
    return -1;
  }
  if (a.targetAccessString < b.targetAccessString) {
    return 1;
  }
  return 0;
};

export const compareTagsAsc = (a, b) => {
  console.log("a",a);
  if (a.tags < b.tags) {
    return -1;
  }
  if (a.tags > b.tags) {
    return 1;
  }
  return 0;
};

export const compareTagsDesc = (a, b) => {
  if (a.tags > b.tags) {
    return -1;
  }
  if (a.tags < b.tags) {
    return 1;
  }
  return 0;
};

export const compareAuthorityAsc = (a, b) => {
  console.log("a",a);
  if (a.authority < b.authority) {
    return -1;
  }
  if (a.authority > b.authority) {
    return 1;
  }
  return 0;
};

export const compareAuthorityDesc = (a, b) => {
  if (a.authority > b.authority) {
    return -1;
  }
  if (a.authority < b.authority) {
    return 1;
  }
  return 0;
};

export const compareCreatedAtDateAsc = (a, b) => {
  if (a.createdAt < b.createdAt) {
    return -1;
  }
  if (a.createdAt > b.createdAt) {
    return 1;
  }
  return 0;
};

export const compareCreatedAtDateDesc = (a, b) => {
  if (a.createdAt > b.createdAt) {
    return -1;
  }
  if (a.createdAt < b.createdAt) {
    return 1;
  }
  return 0;
};

