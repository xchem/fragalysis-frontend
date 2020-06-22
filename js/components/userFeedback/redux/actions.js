import { constants } from './constants';

export const resetForm = () => ({ type: constants.RESET_FORM, payload: {} });

export const setIsOpenForm = isOpen => ({ type: constants.SET_IS_OPEN_FORM, payload: isOpen });

export const setName = name => ({ type: constants.SET_NAME, payload: name });
export const setEmail = email => ({ type: constants.SET_EMAIL, payload: email });
export const setTitle = title => ({ type: constants.SET_TITLE, payload: title });
export const setDescription = description => ({ type: constants.SET_DESCRIPTION, payload: description });
export const setResponse = response => ({ type: constants.SET_RESPONSE, payload: response });
export const setImageSource = imageSource => ({ type: constants.SET_IMAGE_SOURCE, payload: imageSource });
