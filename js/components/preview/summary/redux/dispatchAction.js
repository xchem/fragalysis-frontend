import { api } from '../../../../utils/api';
import { resetCompoundImage, setCompoundImage, setIsLoadingCompoundImage, setOldUrl } from './actions';
import { base_url } from '../../../routes/constants';
import { isEmpty } from 'lodash';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { DockingScripts } from '../../../../utils/script_utils';

const fetchCompoundImage = url => (dispatch, getState) => {
  const state = getState();
  const { oldUrl, width, height } = state.previewReducers.summary;
  let get_params = {
    width,
    height
  };
  Object.keys(get_params).forEach(key => url.searchParams.append(key, get_params[key]));
  if (url.toString() !== oldUrl) {
    dispatch(setIsLoadingCompoundImage());
    return api({ url: url }).then(response => dispatch(setCompoundImage(response.data)));
  }
  dispatch(setOldUrl(url.toString()));
  dispatch(resetCompoundImage());
  return Promise.reject('Error with fetching compound image');
};

const getAtomIndices = ({ currentVector, bondColorMap }) => {
  if (currentVector === undefined) {
    return undefined;
  }
  if (bondColorMap === undefined) {
    return undefined;
  }
  let optionList = bondColorMap[currentVector];
  let outStrList = [];
  for (let index in optionList) {
    let newList = [];
    for (let newIndex in optionList[index]) {
      if (optionList[index][newIndex] === 'NA') {
        newList.push(101);
      } else {
        newList.push(optionList[index][newIndex]);
      }
    }
    let newStr = newList.join(',');
    outStrList.push(newStr);
  }
  return outStrList.join(',');
};

export const reloadSummaryCompoundImage = ({ currentVector, bondColorMap }) => (dispatch, getState) => {
  const state = getState();
  const { to_query } = state.selectionReducers.present;

  let atomIndices = getAtomIndices({ currentVector, bondColorMap });
  const url = new URL(base_url + '/viewer/img_from_smiles/');
  let get_params = {};
  if (atomIndices !== undefined && to_query !== undefined) {
    get_params = { smiles: to_query, atom_indices: atomIndices };
  } else if (to_query !== undefined) {
    get_params = { smiles: to_query };
  }

  if (!isEmpty(get_params)) {
    Object.keys(get_params).forEach(key => url.searchParams.append(key, get_params[key]));
    return dispatch(fetchCompoundImage(url));
  } else {
    dispatch(resetCompoundImage());
    return Promise.resolve('Resetting of compound image');
  }
};

export const downloadAsYankDuck = () => async (dispatch, getState) => {
  const state = getState();
  const duck_yank_data = state.apiReducers.present.duck_yank_data;
  if (!isEmpty(duck_yank_data)) {
    const dockingScripts = new DockingScripts();
    let interaction = duck_yank_data['interaction'];
    let complex_id = duck_yank_data['complex_id'];
    let url = window.location.protocol + '//' + window.location.host + '/api/molecules/' + complex_id.toString() + '/';
    const mol_response = await api({ url }).catch(error => {
      return Promise.reject(error);
    });
    const mol_json = await mol_response.data;
    let prot_id = mol_json['prot_id'];
    url = window.location.protocol + '//' + window.location.host + '/api/protpdb/' + prot_id + '/';
    const prot_response = await api({ url }).catch(error => {
      return Promise.reject(error);
    });
    const prot_json = await prot_response.data;
    url = window.location.protocol + '//' + window.location.host + '/api/proteins/' + prot_id + '/';
    const prot_data_response = await api({ url }).catch(error => {
      return Promise.reject(error);
    });
    const prot_data_json = await prot_data_response.data;
    const prot_code = prot_data_json['code'];
    const pdb_data = prot_json['pdb_data'];
    const mol_data = mol_json['sdf_info'];
    // Turn these into server side
    let duck_yaml = dockingScripts.getDuckYaml(prot_code, interaction);
    let yank_yaml = dockingScripts.getYankYaml(prot_code);
    let f_name = prot_code + '_' + interaction + '_duck_yank';
    let zip = new JSZip();
    let tot_folder = zip.folder(f_name);
    tot_folder.file('duck.yaml', duck_yaml);
    tot_folder.file('yank.yaml', yank_yaml);
    tot_folder.file(prot_code + '.mol', mol_data);
    tot_folder.file(prot_code + '_apo.pdb', pdb_data);
    const content = await zip.generateAsync({ type: 'blob' });
    FileSaver.saveAs(content, f_name + '.zip');
    return Promise.resolve();
  }
  return Promise.reject('Missing duck_yank_data');
};
