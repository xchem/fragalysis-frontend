import { api } from './api';

export const loadFromServer = ({ width, height, key, old_url, setImg_data, setOld_url, url, cancel }) => {
  var get_params = {
    width: width,
    height: height
  };
  Object.keys(get_params).forEach(param => url.searchParams.append(param, get_params[param]));
  if (key === undefined) {
    if (url.toString() !== old_url) {
      return api({ url, cancel })
        .then(response => setImg_data(response.data))
        .finally(() => {
          setOld_url(url.toString());
        });
    }
  } else {
    if (url.toString() !== old_url) {
      api({ url, cancel })
        .then(response => {
          if (response.data !== undefined && response.data.hasOwnProperty(key)) {
            setImg_data(response.data[key]);
          }
        })
        .finally(() => {
          setOld_url(url.toString());
        });
    }
  }
  setOld_url(url.toString());
  return Promise.resolve();
};
