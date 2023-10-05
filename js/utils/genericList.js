import * as listTypes from '../constants/listTypes';
import { api } from './api';
import { DJANGO_CONTEXT } from './djangoContext';
import { OBJECT_TYPE } from '../components/nglView/constants';
import { CONSTANTS } from '../constants/constants';
import { base_url as base_url_const } from '../components/routes/constants';

// START of functions from GenericList
export const getUrl = ({
  list_type,
  project_id,
  target_on,
  group_type,
  mol_group_on,
  pandda_site_on,
  setSeshListSaving
}) => {
  let userId = null;
  // This should be defined by type
  let base_url = base_url_const;

  if (DJANGO_CONTEXT['pk'] !== undefined) {
    userId = DJANGO_CONTEXT['pk'].toString();
  }

  // Set the version
  base_url += '/api/';
  let get_params = {};
  if (list_type === listTypes.TARGET) {
    base_url += 'targets/';
    if (project_id !== undefined) {
      get_params.project_id = project_id;
    }
  } else if (list_type === OBJECT_TYPE.MOLECULE_GROUP) {
    if (target_on !== undefined) {
      get_params.target_id = target_on;
      base_url += 'molgroup/';
      get_params.group_type = group_type;
    }
  } else if (list_type === listTypes.MOLECULE) {
    if (target_on !== undefined && mol_group_on !== undefined) {
      // mol group choice
      base_url += 'molecules/';
      get_params.mol_groups = mol_group_on;
      get_params.mol_type = 'PR';
    }
  } else if (list_type === listTypes.PANDDA_EVENT) {
    if (target_on !== undefined && pandda_site_on !== undefined) {
      // mol group choice
      base_url += 'events/';
      get_params.target_id = target_on;
      get_params.limit = -1;
      get_params.pandda_site = pandda_site_on;
    }
  } else if (list_type === listTypes.PANDDA_SITE) {
    if (target_on !== undefined) {
      // mol group choice
      base_url += 'sites/';
      get_params.target_id = target_on;
      get_params.limit = -1;
    }
  } else if (list_type === listTypes.HOTSPOT) {
    if (target_on !== undefined) {
      base_url += 'hotspots/';
      get_params.target_id = target_on;
    }
  } else if (list_type === listTypes.SESSIONS) {
    base_url += 'viewscene/?user_id=' + userId;
    if (project_id !== undefined) {
      get_params.project_id = project_id;
      setSeshListSaving(true);
    }
  } else {
    console.log('DEFAULT');
  }
  const url = new URL(base_url);
  Object.keys(get_params).forEach(key => url.searchParams.append(key, get_params[key]));
  return url;
};

/**
 * Process the results - switched to be used for pagination
 * @param json
 * @param list_type
 * @param seshListSaving
 * @param setSeshListSaving
 * @param afterPush
 * @returns {*|Array}
 */
export const processResults = ({ json, list_type, seshListSaving, setSeshListSaving, afterPush }) => {
  let results = [];
  if (json) {
    results = json.results;
  }
  if (afterPush) {
    afterPush(results);
  }
  if (list_type === listTypes.SESSIONS && seshListSaving === true && setSeshListSaving) {
    setSeshListSaving(false);
  }
  return results;
};

//url means gall getUrl function
// setOldUrl means: this.old_url = url.toString();
export const loadFromServer = ({
  beforePush,
  url,
  setOldUrl,
  old_url,
  mol_group_on,
  setObjectList,
  setCachedMolLists,
  list_type,
  seshListSaving,
  setSeshListSaving,
  afterPush,
  cancel
}) => {
  if (url.toString() !== old_url) {
    if (beforePush) {
      beforePush();
    }
    return api({ url, cancel })
      .then(response => {
        setObjectList(processResults({ json: response.data, list_type, seshListSaving, setSeshListSaving, afterPush }));
        // if we are handling molecule list and molecule data for mol_group are fetched
        if (list_type === listTypes.MOLECULE && mol_group_on && setCachedMolLists) {
          // update cached mol lists
          let moleculeLists = [];
          let data = response.data.results;
          let cachedDataArray = (data && data) || [];
          cachedDataArray.forEach(r => {
            let result = getNumberFromCode(r.code);
            moleculeLists.push(Object.assign({ number: result.number }, r));
          });
        }

        // TODO: Do we need to fetch all or wait for click on molecule group?
        if (list_type === OBJECT_TYPE.MOLECULE_GROUP) {
          // json.results.forEach(molgroup => {
          //     const molgroup_id = molgroup.id;
          //     console.log(`Fetch data for mol_group ${molgroup_id}`);
          // })
        }
      })
      .finally(() => {
        setOldUrl(url.toString());
      })
      .catch(err => {
        console.log(err);
      });
  }
  setOldUrl(url.toString());
  return Promise.resolve();
};

// export const loadAllMolsFromMolGroup = ({ url, mol_group, origList }) => {
//   return api({ url }).then(response => {
//     origList[mol_group] = [];
//     response.data.results.forEach(r => {
//       let result = getNumberFromCode(r.protein_code);
//       origList[mol_group].push({...r, number: result.number });
//     });
//     return origList;
//   });
// };

export const loadAllMolsFromMolGroup = ({ url, mol_group }) => {
  return api({ url }).then(response => {
    let list = [];
    response.data.results.forEach(r => {
      let result = getNumberFromCode(r.code);
      list.push({ ...r, number: result.number });
    });
    return { mol_group: mol_group, molecules: list };
  });
};

// export const loadAllMolsForAllMolGroups = (list_type, mol_group_list, target_on) => {
//   let allMols = {};
//   for (let i = 0; i < mol_group_list.length; i++) {
//     let molGroup = mol_group_list[i];
//     let url = getUrl({ list_type, target_on, mol_group_on: molGroup.id });
//     api({ url }).then(response => {
//       allMols[molGroup.id] = [];
//       response.data.results.forEach(r => {
//         let result = getNumberFromCode(r.protein_code);
//         allMols[molGroup.id].push({...r, number: result.number });
//       });
//     });
//   }
// };

export function getNumberFromCode(inputCode) {
  let number = 0;
  let subNumber = 0;

  let code = inputCode.toLowerCase();
  let codeAfterIdentifier = code.split(CONSTANTS.MAIN_IDENTIFIER)[1];

  if (codeAfterIdentifier != null) {
    let startingNumber = (codeAfterIdentifier.match(/\d+/) || [0])
      .map(function(v) {
        return +v;
      })
      .shift();

    number = startingNumber;

    if (codeAfterIdentifier.includes(CONSTANTS.SUB_IDENTIFIER)) {
      let codeAfterSubIdentifier = codeAfterIdentifier.split(CONSTANTS.sub_identifier)[1];
      if (codeAfterSubIdentifier != null) {
        let startingSubNumber = (codeAfterSubIdentifier.match(/\d+/) || [0])
          .map(function(v) {
            return +v;
          })
          .shift();
        subNumber = startingSubNumber;
      }
    }
  }

  let numberWithSub = +(number + '.' + subNumber);
  return { number: numberWithSub };
}

// END of functions from GenericList
