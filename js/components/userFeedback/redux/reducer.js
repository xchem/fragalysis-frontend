import { constants } from './constants';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';

export const INITIAL_STATE = {
  name: DJANGO_CONTEXT['name'] || '',
  email: DJANGO_CONTEXT['email'] || '',
  title: '',
  description: '',
  response: '',
  imageSource: ''
};

export const issueReducers = (state = INITIAL_STATE, action = {}) => {
  switch (action.type) {
    case constants.SET_NAME:
      return Object.assign({}, state, {
        name: action.payload
      });
    case constants.SET_EMAIL:
      return Object.assign({}, state, {
        email: action.payload
      });
    case constants.SET_TITLE:
      return Object.assign({}, state, {
        title: action.payload
      });
    case constants.SET_DESCRIPTION:
      return Object.assign({}, state, {
        description: action.payload
      });
    case constants.SET_RESPONSE:
      return Object.assign({}, state, {
        response: action.payload
      });
    case constants.SET_IMAGE_SOURCE:
      return Object.assign({}, state, {
        imageSource: action.payload
      });

    case constants.RESET_FORM:
      return Object.assign({}, state, INITIAL_STATE);

    default:
      return state;
  }
};
