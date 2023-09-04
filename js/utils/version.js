import { api, METHOD } from '../utils/api';
import { base_url } from '../components/routes/constants';

export const getVersions = async () => {
  return api({
    url: `${base_url}/version/`,
    method: METHOD.GET
  });
};
