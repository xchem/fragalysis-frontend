import { api } from '../../../utils/api';
import { base_url } from '../../routes/constants';

export const isSquonkProjectAccessible = async jobId => {
  return api({ url: `${base_url}/viewer/job_access/?job_request_id=${jobId}` });
};
