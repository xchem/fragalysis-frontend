import { api, METHOD } from '../../../../utils/api';
import { base_url } from '../../../routes/constants';

export const getAllData = targetId => {
  return api({ url: `${base_url}/api/target_molecules/${targetId}` }).then(response => {
    if (response?.data) {
      return response.data;
    }
  });
};

export const createNewTag = (tagName, moleculeId, targetId, tagCategoryId, userId, color, discourseUrl) => {
  const requestObject = {
    tag: tagName,
    molecule_id: moleculeId,
    target_id: targetId,
    tagcategory_id: tagCategoryId,
    user_id: userId,
    colour: color,
    discourse_url: discourseUrl
  };
  const jsonString = JSON.stringify(requestObject);
  return api({
    url: `${base_url}/api/tags`,
    method: METHOD.POST,
    data: jsonString
  })
    .then(resp => {
      console.log(resp);
    })
    .catch(err => console.log(err));
};
