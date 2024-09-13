import { api } from '../../../../utils/api';
import { base_url } from '../../../routes/constants';

const POSE_ERROR_LABEL_TRANSLATOR = {
  id: 'Identificator of the pose',
  display_name: 'Display name of the pose',
  canon_site: 'Canonical site of the pose',
  compound: 'Compound of the pose',
  main_site_observation: 'Main observation of the pose',
  site_observations: 'All observations of the pose',
  main_site_observation_cmpd_code: 'Main observation compound code'
};

export const updatePoseApi = async pose => {
  return api({ url: `${base_url}/api/poses/${pose.id}/`, method: 'PATCH', data: pose });
};

export const createPoseApi = async pose => {
  return api({ url: `${base_url}/api/poses/`, method: 'POST', data: pose }).then(response => response.data);
};

export const createPoseErrorMessage = error => {
  let result = null;

  if (error?.response?.data) {
    const fields = Object.keys(error.response.data);
    const errorMessages = [];
    let i = 0;

    fields.forEach(field => {
      if (Array.isArray(error.response.data[field])) {
        const arrayOfErrors = error.response.data[field];
        if (arrayOfErrors.length > 0) {
          errorMessages[i++] = `${POSE_ERROR_LABEL_TRANSLATOR[field]}:` + '\n';
        }
        arrayOfErrors.forEach(errorMsg => {
          errorMessages[i++] = errorMsg + '\n';
        });
      }
    });

    if (errorMessages) {
      result = errorMessages.join('');
    }
  }

  return result;
};
