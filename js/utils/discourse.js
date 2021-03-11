import { DJANGO_CONTEXT } from './djangoContext';

const DISCOURSE_BASE_URL = 'https://discourse.xchem-dev.diamond.ac.uk/';

export const isDiscourseAvailable = () => {
  return DJANGO_CONTEXT && DJANGO_CONTEXT['authenticated'] && DJANGO_CONTEXT['discourse_available'];
};

export const generateDiscourseTargetURL = targetName => {
  return `${DISCOURSE_BASE_URL}${targetName}/`;
};

export const getProjectUrl = projectName => {
  return 'DUMMY';
};
