import { fetchWithMemoize } from './api';

export const loadFromServer = ({ width, height, key, old_url, setImg_data, setOld_url, url }) => {
  var get_params = {
    width: width,
    height: height
  };
  Object.keys(get_params).forEach(param => url.searchParams.append(param, get_params[param]));
  if (key === undefined) {
    if (url.toString() !== old_url) {
      return fetchWithMemoize(url)
        .then(text => setImg_data(text))
        .finally(() => {
          setOld_url(url.toString());
        });
    }
  } else {
    if (url.toString() !== old_url) {
      fetchWithMemoize(url)
        .then(text => {
          if (text !== undefined && text.hasOwnProperty(key)) {
            setImg_data(text[key]);
          }
        })
        .finally(() => {
          setOld_url(url.toString());
        });
    } else {
      setOld_url(url.toString());
      return Promise.resolve();
    }
  }
};
