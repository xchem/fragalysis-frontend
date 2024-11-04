import { api, METHOD } from '../../../../utils/api';
import { createTagPost, isDiscourseAvailable } from '../../../../utils/discourse';
import { base_url } from '../../../routes/constants';
import { getDefaultTagDiscoursePostText } from '../utils/tagUtils';

// export const getAllData = targetId => {
//   return api({ url: `${base_url}/api/target_molecules/${targetId}` }).then(response => {
//     if (response?.data) {
//       return response.data;
//     }
//   });
// };

export const getTags = async targetId => {
  return api({ url: `${base_url}/api/siteobservation_tag/?target=${targetId}` }).then(response => {
    if (response?.data) {
      return response.data;
    }
  });
};

export const getTagCategories = async () => {
  return api({ url: `${base_url}/api/tag_category/` }).then(response => {
    if (response?.data) {
      return response.data?.results;
    }
  });
};

export const getAllDataNew = async targetId => {
  return api({ url: `${base_url}/api/site_observations/?target=${targetId}` }).then(response => {
    if (response?.data) {
      return response.data;
    }
  });
};

export const getCanonSites = async targetId => {
  return api({ url: `${base_url}/api/canon_sites/?target=${targetId}` }).then(response => {
    if (response?.data) {
      return response.data?.results;
    }
  });
};

export const getCanonConformSites = async targetId => {
  return api({ url: `${base_url}/api/canon_site_confs/?target=${targetId}` }).then(response => {
    if (response?.data) {
      return response.data?.results;
    }
  });
};

export const getPoses = async targetId => {
  return api({ url: `${base_url}/api/poses/?target=${targetId}` }).then(response => {
    if (response?.data) {
      return response.data?.results;
    }
  });
};

export const getTagMolecules = targetId => {
  return api({ url: `${base_url}/api/siteobservation_tag/?target=${targetId}` })
    .then(response => {
      return response.data;
    })
    .catch(err => console.log(err));
};

export const createNewTag = async (tag, targetName) => {
  let url = `${base_url}/api/siteobservation_tag/`;
  if (isDiscourseAvailable()) {
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
  } else {
    tag['discourse_url'] = 'a';
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
  }
};

export const createNewDownloadTag = async tag => {
  let url = `${base_url}/api/siteobservation_tag/`;
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
};

export const updateExistingTag = async (tag, tagId) => {
  const jsonString = JSON.stringify(tag);
  let url = `${base_url}/api/siteobservation_tag/${tagId}/`;
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

export const getTagByName = async tagName => {
  let url = `${base_url}/api/siteobservation_tag/?tag=${tagName}`;
  return api({ url: url }).then(response => {
    if (response?.data?.results?.length > 0) {
      return response.data.results[0];
    }
  });
};

export const deleteExistingTag = async (tag, tagId) => {
  const jsonString = JSON.stringify(tag);
  let url = `${base_url}/api/siteobservation_tag/${tagId}/`;
  return api({
    url: url,
    method: METHOD.DELETE,
    data: jsonString
  })
    .then(resp => {
      return resp.data;
    })
    .catch(err => console.log(err));
};
