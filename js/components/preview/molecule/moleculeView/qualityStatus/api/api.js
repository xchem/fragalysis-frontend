import { api, METHOD } from "../../../../../../utils/api";
import { base_url } from "../../../../../routes/constants";

export const getQualityStatuses = async () => {
  return api({
    url: `${base_url}/api/site_observation_quality/`,
    method: METHOD.GET
  })
    .then(resp => {
      return resp.data.results;
    })
    .catch(err => {
      console.log('error fetching site_observation_quality', err);
      return [];
    });
};

export const postQualityStatuse = async (data) => {
  return api({
    url: `${base_url}/api/site_observation_quality/`,
    method: METHOD.POST,
    data: data
  })
    .then(resp => {
      return resp.data;
    })
    .catch(err => {
      console.log('error posting site_observation_quality', err);
      return [];
    });
};
