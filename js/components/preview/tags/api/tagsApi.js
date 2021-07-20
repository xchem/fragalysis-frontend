import { api } from '../../../../utils/api';
import { base_url } from '../../../routes/constants';

export const getAllData = targetId => {
  return api({ url: `${base_url}/api/target_molecules/?id=${targetId}` }).then(response => {
    if (response?.data?.results?.length > 0) {
      return response?.data?.results[0];
    }
  });
};
