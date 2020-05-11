import { deleteObject, loadObject, setOrientation } from '../../../reducers/ngl/dispatchActions';
import {
  setFilter,
  appendLigandList,
  appendProteinList,
  appendComplexList,
  appendSurfaceList,
  removeFromLigandList,
  removeFromProteinList,
  removeFromComplexList,
  removeFromSurfaceList,
  addDataset,
  setDataset
} from './actions';
import { base_url } from '../../routes/constants';
import {
  generateMoleculeId,
  generateHitProteinObject,
  generateComplexObject,
  generateSurfaceObject,
  generateMoleculeObject
} from '../../nglView/generatingObjects';
import { VIEWS } from '../../../constants/constants';
import { MOL_ATTRIBUTES } from '../../preview/molecule/redux/constants';

import { addMoleculeList } from './actions';
import { api } from '../../../utils/api';

export const initializeDatasetMoleculeLists = moleculeList => (dispatch, getState) => {
  console.log('initializing testing datasets');
  const state = getState();
  const customDatasets = state.datasetsReducers.datasets;
  const testingMoleculeList = moleculeList.slice(0, 6);
  // TODO temporarily, just adding testing data
  customDatasets.forEach(dataset => {
    dispatch(
      addMoleculeList(
        dataset.id,
        (testingMoleculeList => {
          const newList = [];
          testingMoleculeList.forEach(molecule => {
            // molecule.protein_code is used as prefix for element names in display controls
            newList.push(Object.assign({}, molecule, { protein_code: dataset.id + '_' + molecule.id }));
          });
          return newList;
        })(testingMoleculeList)
      )
    );
  });
};

export const getListedMolecules = (object_selection, cached_mol_lists) => {
  let molecules = [];
  if ((object_selection || []).length) {
    for (let molgroupId of object_selection) {
      // Selected molecule groups
      const molGroup = cached_mol_lists[molgroupId];
      if (molGroup) {
        molecules = molecules.concat(molGroup);
      } else {
        console.log(`Molecule group ${molgroupId} not found in cached list`);
      }
    }
  }

  return molecules;
};

export const initializeFilter = (object_selection, cached_mol_lists) => (dispatch, getState) => {
  const state = getState();
  if (!object_selection || !cached_mol_lists) {
    object_selection = (() => {
      let tmp = [];
      state.datasetsReducers.datasets.forEach(dataset => {
        tmp.push(dataset.id);
      });
      return tmp;
    })(state.datasetsReducers.datasets);
    cached_mol_lists = state.datasetsReducers.moleculeLists;
  }

  let initObject = state.selectionReducers.filter;

  if (initObject === undefined) {
    initObject = {
      active: false,
      predefined: 'none',
      filter: {},
      priorityOrder: MOL_ATTRIBUTES.map(molecule => molecule.key)
    };
  } else {
    initObject = Object.assign({}, initObject);
    console.log('using saved filter');
  }

  for (let attr of MOL_ATTRIBUTES) {
    const lowAttr = attr.key.toLowerCase();
    let minValue = -999999;
    let maxValue = 0;
    for (let molecule of getListedMolecules(object_selection, cached_mol_lists)) {
      const attrValue = molecule[lowAttr];
      if (attrValue > maxValue) maxValue = attrValue;
      if (minValue === -999999) minValue = maxValue;
      if (attrValue < minValue) minValue = attrValue;
    }

    initObject.filter[attr.key] = {
      priority: 0,
      order: 1,
      minValue: minValue,
      maxValue: maxValue,
      isFloat: attr.isFloat
    };
  }
  dispatch(setFilter(initObject));
  return initObject;
};

/* ----------------------------------------------- */

export const addProtein = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateHitProteinObject(data, colourToggle, base_url)),
      stage,
      undefined,
      null
    )
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendProteinList(datasetID, generateMoleculeId(data)));
};

export const removeProtein = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateHitProteinObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromProteinList(datasetID, generateMoleculeId(data)));
};

export const addComplex = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
      stage,
      undefined,
      null
    )
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendComplexList(datasetID, generateMoleculeId(data)));
};

export const removeComplex = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromComplexList(datasetID, generateMoleculeId(data)));
};

export const addSurface = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url)),
      stage,
      undefined,
      null
    )
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendSurfaceList(datasetID, generateMoleculeId(data)));
};

export const removeSurface = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromSurfaceList(datasetID, generateMoleculeId(data)));
};

export const addLigand = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(
    loadObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data, colourToggle)),
      stage,
      undefined,
      null
    )
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendLigandList(datasetID, generateMoleculeId(data)));
};

export const removeLigand = (stage, data, colourToggle, datasetID) => dispatch => {
  dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data)), stage));
  dispatch(removeFromLigandList(datasetID, generateMoleculeId(data)));
};

export const loadDataSets = () => dispatch =>
  api({ url: `${base_url}/api/compound-sets/` }).then(response => {
    dispatch(setDataset(response.data.results.map(ds => ({ id: ds.id, title: ds.name }))));
  });
