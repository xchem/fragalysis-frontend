export const compareNameAsc = (a, b) => {
  if (a.title < b.title) {
    return -1;
  }
  if (a.title > b.title) {
    return 1;
  }
  return 0;
};

export const compareNameDesc = (a, b) => {
  if (a.title > b.title) {
    return -1;
  }
  if (a.title < b.title) {
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
  if (a.project.target_access_string < b.project.target_access_string) {
    return -1;
  }
  if (a.project.target_access_string > b.project.target_access_string) {
    return 1;
  }
  return 0;
};

export const compareTargetAccessStringDesc = (a, b) => {
  if (a.project.target_access_string > b.project.target_access_string) {
    return -1;
  }
  if (a.project.target_access_string < b.project.target_access_string) {
    return 1;
  }
  return 0;
};

export const compareTagsAsc = (a, b) => {
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
  if (a.project.authority < b.project.authority) {
    return -1;
  }
  if (a.project.authority > b.project.authority) {
    return 1;
  }
  return 0;
};

export const compareAuthorityDesc = (a, b) => {
  if (a.project.authority > b.project.authority) {
    return -1;
  }
  if (a.project.authority < b.project.authority) {
    return 1;
  }
  return 0;
};

export const compareCreatedAtDateAsc = (a, b) => {
  if (a.init_date < b.init_date) {
    return -1;
  }
  if (a.init_date > b.init_date) {
    return 1;
  }
  return 0;
};

export const compareCreatedAtDateDesc = (a, b) => {
  if (a.init_date > b.init_date) {
    return -1;
  }
  if (a.init_date < b.init_date) {
    return 1;
  }
  return 0;
};

