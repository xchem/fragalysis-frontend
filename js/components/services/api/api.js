import { api, METHOD } from '../../../utils/api';
import { base_url } from '../../routes/constants';

export const getServiceStatus = async () => {
  return api({
    url: `${base_url}/viewer/service_state/`,
    method: METHOD.GET
  })
    .then(resp => {
      return resp.data.service_states;
    })
    .catch(err => console.log('error fetching service_state', err));
};