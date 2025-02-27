import { api } from '../../../utils/api';
import { base_url } from '../../routes/constants';

export const isSquonkProjectAccessible = async jobId => {
  return api({ url: `${base_url}/api/job_access/?job_request_id=${jobId}` });
};

export const extractRelativePath = (path, parentPath) => {
  return path.replace(parentPath, '');
};
