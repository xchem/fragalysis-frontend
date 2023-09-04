import { api, METHOD, getFileSize } from '../../../utils/api';
import { base_url } from '../../routes/constants';

export const getDownloadStructuresUrl = requestObject => {
  const jsonString = JSON.stringify(requestObject);
  return api({
    url: `${base_url}/api/download_structures/`,
    method: METHOD.POST,
    data: jsonString
  });
};

export const getDownloadFileSize = downloadUrl => {
  return getFileSize(`${base_url}/api/download_structures/?file_url=${downloadUrl}`);
};

export const downloadStructuresZip = downloadUrl => {
  if (downloadUrl) {
    var anchor = document.createElement('a');
    anchor.href = `${base_url}/api/download_structures/?file_url=${downloadUrl}`;
    anchor.target = '_blank';
    anchor.download = 'download';
    anchor.click();
  }
};
