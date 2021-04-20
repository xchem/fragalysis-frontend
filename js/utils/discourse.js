import { DJANGO_CONTEXT } from './djangoContext';
import { api, METHOD } from './api';
import { base_url } from '../components/routes/constants';

const DEFAULT_PARENT_CATEGORY_NAME = 'Fragalysis targets';
const DEFAULT_CATEGORY_COLOUR = '0088CC';
const DEFAULT_TEXT_COLOUR = 'FFFFFF';

const getDiscourseRequestObject = (params = {}) => {
  const request = {
    category_name: '',
    parent_category_name: DEFAULT_PARENT_CATEGORY_NAME,
    category_colour: DEFAULT_CATEGORY_COLOUR,
    category_text_colour: DEFAULT_TEXT_COLOUR,
    post_title: '',
    post_content: '',
    post_tags: '{}'
  };

  return { ...request, ...params };
};

export const isDiscourseAvailable = () => {
  return DJANGO_CONTEXT && DJANGO_CONTEXT['authenticated'] && DJANGO_CONTEXT['discourse_available'];
};

export const isDiscourseUserAvailable = () => {
  return DJANGO_CONTEXT && DJANGO_CONTEXT['user_present_on_discourse'];
};

export const getDiscourseURL = () => {
  return DJANGO_CONTEXT && DJANGO_CONTEXT['discourse_host'];
};

export const generateDiscourseTargetURL = targetName => {
  let jsonData = getDiscourseRequestObject({ category_name: targetName });
  return api({
    url: `${base_url}/api/discourse_post/`,
    method: METHOD.POST,
    data: jsonData
  });
};

export const createProjectPost = (projectName, targetName, msg, tags) => {
  let jsonData = getDiscourseRequestObject({
    category_name: targetName,
    post_title: projectName,
    post_content: msg,
    post_tags: JSON.stringify(tags)
  });
  console.log(JSON.stringify(jsonData));
  return api({
    url: `${base_url}/api/discourse_post/`,
    method: METHOD.POST,
    data: jsonData
  });
};

export const getExistingPost = projectName => {
  let jsonData = getDiscourseRequestObject({
    post_title: projectName
  });
  console.log(JSON.stringify(jsonData));
  return api({
    url: `${base_url}/api/discourse_post/`,
    method: METHOD.POST,
    data: jsonData
  });
};

export const getProjectPosts = projectName => {
  return api({
    url: `${base_url}/api/discourse_post/?post_title=${encodeURIComponent(projectName)}`,
    method: METHOD.GET
  });
};
