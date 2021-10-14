import { api, METHOD } from '../../../../utils/api';
import { createTagPost } from '../../../../utils/discourse';
import { base_url } from '../../../routes/constants';
import { getDefaultTagDiscoursePostText } from '../utils/tagUtils';

export const getAllData = targetId => {
  return api({ url: `${base_url}/api/target_molecules/${targetId}` }).then(response => {
    if (response?.data) {
      return response.data;
    }
  });
};

export const getTagMolecules = targetId => {
  return api({ url: `${base_url}/api/molecule_tag/?target=${targetId}` })
    .then(response => {
      return response.data;
    })
    .catch(err => console.log(err));
};

export const createNewTag = (tag, targetName) => {
  let url = `${base_url}/api/molecule_tag/`;
  return createTagPost(tag, targetName, getDefaultTagDiscoursePostText(tag))
    .then(tagResp => {
      const tagURL = tagResp.data['Post url'];
      tag['discourse_url'] = tagURL;
      const jsonString = JSON.stringify(tag);
      return api({
        url: url,
        method: METHOD.POST,
        data: jsonString
      })
        .then(resp => {
          return resp.data;
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

export const updateExistingTag = (tag, tagId) => {
  const jsonString = JSON.stringify(tag);
  let url = `${base_url}/api/molecule_tag/${tagId}/`;
  return api({
    url: url,
    method: METHOD.PUT,
    data: jsonString
  })
    .then(resp => {
      return resp.data;
    })
    .catch(err => console.log(err));
};
