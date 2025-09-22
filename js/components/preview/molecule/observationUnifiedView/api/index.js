import { api, METHOD } from "../../../../../utils/api";
import { base_url } from "../../../../routes/constants";

export const getActivityData = async targetId => {
    return api({ url: `${base_url}/api/activity_data/?result_upload__target=${targetId}` }).then(response => {
        if (response?.data) {
            return response.data?.results;
        }
    });
};

export const getActivityColumns = async targetId => {
    return api({ url: `${base_url}/api/assay_data_property/?target=${targetId}` }).then(response => {
        if (response?.data) {
            return response.data?.results;
        }
    });
};

/**
 * data should contain: target, target_access_string, query, structure_type (compound|site_observation)
 * data could contain: is_substructure, is_smarts, use_chirality
 *
 * @param {Object} data
 * @returns [<filtered_compounds>]
 */
export const filterLHSCompounds = async data => {
    // const { target, target_access_string, query, is_substructure, is_smarts, use_chirality, structure_type } = data;
    const jsonString = JSON.stringify(data);
    return api({
        url: `${base_url}/api/structure_filter/`,
        method: METHOD.POST,
        data: jsonString
    }).then(response => {
        if (response?.data) {
            return response.data?.result;
        }
    }).catch(err => console.log(err));;
};