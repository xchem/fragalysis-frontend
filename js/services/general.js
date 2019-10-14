import * as listTypes from '../components/listTypes';
import * as R from 'ramda';

const fetchWithMemoize = R.memoizeWith(R.identity, url => {
  return fetch(url)
    .then(response => response.json())
    .catch(error => console.log('An error occurred.', error));
});
exports.fetchWithMemoize = fetchWithMemoize;

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
  let base_url = window.location.protocol + '//' + window.location.host;
  // eslint-disable-next-line no-undef
  if (DJANGO_CONTEXT['pk'] !== undefined) {
    // eslint-disable-next-line no-undef
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
  } else if (list_type === listTypes.MOLGROUPS) {
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
  let results = json.results;
  if (afterPush) {
    afterPush(results);
  }
  if (list_type === listTypes.SESSIONS && seshListSaving === true) {
    setSeshListSaving(false);
  }
  return results || [];
};

//url means gall getUrl function
// setOldUrl means: this.old_url = url.toString();
export const loadFromServer = ({
  beforePush,
  url,
  setOldUrl,
  old_url,
  mol_group_on,
  cached_mol_lists,
  setObjectList,
  setCachedMolLists,
  list_type,
  seshListSaving,
  setSeshListSaving,
  afterPush
}) => {
  if (url.toString() !== old_url) {
    if (beforePush) {
      beforePush();
    }
    fetchWithMemoize(url).then(json => {
      setObjectList(processResults({ json, list_type, seshListSaving, setSeshListSaving, afterPush }));
      // if we are handling molecule list and molecule data for mol_group are fetched
      if (list_type === listTypes.MOLECULE && mol_group_on && setCachedMolLists) {
        // update cached mol lists
        const newMolLists = Object.assign({}, cached_mol_lists, {
          [mol_group_on]: json
        });
        setCachedMolLists(newMolLists);
      }

      // TODO: Do we need to fetch all or wait for click on molecule group?
      if (list_type === listTypes.MOLGROUPS) {
        // json.results.forEach(molgroup => {
        //     const molgroup_id = molgroup.id;
        //     console.log(`Fetch data for mol_group ${molgroup_id}`);
        // })
      }
    });
  }
  setOldUrl(url.toString());
};

// END of functions from GenericList
