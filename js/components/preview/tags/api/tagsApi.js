import { api } from '../../../../utils/api';
import { base_url } from '../../../routes/constants';

export const getAllData = targetId => {
  return api({ url: `${base_url}/api/target_molecules/${targetId}` }).then(response => {
    if (response?.data) {
      return response.data;
    }
  });
};
