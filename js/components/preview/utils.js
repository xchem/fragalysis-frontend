import { URL_TOKENS } from '../direct/constants';

export const extractFromUrlParam = (param, token) => {
  let result = null;
  if (param) {
    // const regex = new RegExp(`${token}\/(\\w+)\/?(?!.*${token}\/)`);
    // const match = param.match(regex);
    // result = match ? match[1] : null;
    const paramsWithoutToken = param.split(token);
    if (paramsWithoutToken && paramsWithoutToken.length > 1) {
      const splitParams = paramsWithoutToken[1].split('/');
      if (splitParams && splitParams.length > 1) {
        result = splitParams[1];
      }
    }
  }
  return result;
};

export const extractProjectFromURLParam = param => {
  return extractFromUrlParam(param, URL_TOKENS.target_access_string);
};

export const extractTargetFromURLParam = param => {
  let target = null;

  if (param) {
    const match = param.match(/^([^/\s]+)/);
    target = match ? match[1] : null;
  }

  return target;
};

export const getProjectsForTarget = (target, projectsList) => {
  let result = null;
  if (target && projectsList && target.project && target.project.length > 0) {
    const projects = projectsList.filter(project => target.project.includes(project.id));
    result = [...projects];
  }
  return result;
};
