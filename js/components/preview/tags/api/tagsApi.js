import { api, METHOD } from '../../../../utils/api';
import { createTagPost, isDiscourseAvailable } from '../../../../utils/discourse';
import { base_url } from '../../../routes/constants';
import { getDefaultTagDiscoursePostText } from '../utils/tagUtils';

const getPaginatedResults = async url => {
  const results = [];
  let nextUrl = url;

  while (nextUrl) {
    const response = await api({ url: nextUrl });
    const responseData = response?.data;

    if (!responseData) {
      break;
    }

    if (Array.isArray(responseData.results)) {
      results.push(...responseData.results);
      nextUrl = responseData.next;
    } else if (Array.isArray(responseData)) {
      results.push(...responseData);
      nextUrl = null;
    } else {
      nextUrl = null;
    }
  }

  return results;
};

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

/**
 * TODO this just generates some tags from datasets for rhs
 * @param {int} targetId
 * @returns
 */
export const generateRHSTags = async targetId => {
  let tags = [];
  /*
-- tag
    id: 10
    site_observations: [..]
    tag: "x0407/D/802"
    short_tag: "1a - x0407/D/802"
    tag_prefix: "1a"
    upload_name: "1a - LYSRSCPZ-x0407/D/802"
    create_date: "2026-01-21T18:32:15.065870Z"
    colour: null
    discourse_url: null
    help_text: null
    additional_info: null
    hidden: true
    category: 1
    target: 1
    user: null
    mol_group: 10
-- dataset
    "id": 1,
    "name": "FFF_algos-2026-01-21-A",
    "submitted_sdf": "http://127.0.0.1:8080/media/CpKRS_filtered_merges%20(2).sdf",
    "written_sdf_filename": "/code/media/computed_set_data/FFF_algos-2026-01-21-A_upload_1_CpKRS_filtered_merges (2).sdf",
    "spec_version": 1.2,
    "method_url": "https://hippo.winokan.com",
    "method": "FFF_algos",
    "upload_date": "2026-01-21",
    "md_ordinal": 1,
    "upload_datetime": "2026-01-21T19:24:44.052653Z",
    "target": 1,
    "submitter": 1,
    "owner_user": 3,
    "computed_molecules": [],
    "site_observations": [..]
  */
  const result = await api({ url: `${base_url}/api/compound-sets/?target=${targetId}` }).then(response => {
    if (response?.data) {
      return response.data.results;
    }
  });
  result?.map(dataset => {
    tags.push({
      rhs: true,
      id: `rhs-${dataset.id}`,
      tag: dataset.name,
      short_tag: `rhs-${dataset.name}`,
      tag_prefix: 'rhs',
      upload_name: `rhs-${dataset.name}`,
      create_date: dataset.upload_datetime,
      colour: null,
      hidden: false,
      category: 8, // TODO other
      target: targetId,
      user: dataset.owner_user,
      site_observations: dataset.site_observations,
      additional_info: {
        computed_set: dataset.id
      }
    });
  });
  return tags;
};

export const getComputedSetInspirationMappings = async targetId => {
  return getPaginatedResults(`${base_url}/api/compound-sets/?computed_set__target=${targetId}`);
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

export const getTagMolecules = async targetId => {
  return api({ url: `${base_url}/api/siteobservation_tag/?target=${targetId}` })
    .then(response => {
      return response.data;
    })
    .catch(err => console.log(err));
};

export const getCompoundIdentifiers = async () => {
  return api({ url: `${base_url}/api/compound-identifiers/` }).then(response => {
    return response.data?.results;
  });
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
