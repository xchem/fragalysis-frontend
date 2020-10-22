import { deleteObject, loadObject, setOrientation } from '../../../../reducers/ngl/dispatchActions';
import {
  appendProteinList,
  appendComplexList,
  appendSurfaceList,
  appendDensityList,
  appendFragmentDisplayList,
  appendVectorOnList,
  decrementCountOfPendingVectorLoadRequests,
  incrementCountOfPendingVectorLoadRequests,
  removeFromProteinList,
  removeFromComplexList,
  removeFromSurfaceList,
  removeFromDensityList,
  removeFromFragmentDisplayList,
  removeFromVectorOnList,
  resetCompoundsOfVectors,
  setVectorList,
  updateVectorCompounds,
  updateBondColorMapOfCompounds,
  resetBondColorMapOfVectors,
  setCurrentVector
} from '../../../../reducers/selection/actions';
import { base_url } from '../../../routes/constants';
import {
  generateArrowObject,
  generateMoleculeId,
  generateCylinderObject,
  getVectorWithColorByCountOfCompounds,
  generateHitProteinObject,
  generateComplexObject,
  generateSurfaceObject,
  generateDensityObject,
  generateMoleculeObject
} from '../../../nglView/generatingObjects';
import { VIEWS } from '../../../../constants/constants';
import { api } from '../../../../utils/api';
import { selectVectorAndResetCompounds } from '../../../../reducers/selection/dispatchActions';
import { colourList } from '../moleculeView';
import { appendMoleculeOrientation } from '../../../../reducers/ngl/actions';
import { setCompoundImage } from '../../summary/redux/actions';
import { noCompoundImage } from '../../summary/redux/reducer';
import { getMoleculeOfCurrentVector } from '../../../../reducers/selection/selectors';
import { resetCurrentCompoundsSettings } from '../../compounds/redux/actions';
import {selectMoleculeGroup} from '../../moleculeGroups/redux/dispatchActions'

/**
 * Convert the JSON into a list of arrow objects
 */
const generateObjectList = (out_data, data) => {
  const colour = [1, 0, 0];
  const deletions = out_data.deletions;
  const additions = out_data.additions;
  const linkers = out_data.linkers;
  const rings = out_data.ring;
  let outList = [];

  for (let d in deletions) {
    outList.push(generateArrowObject(data, deletions[d][0], deletions[d][1], d, colour));
  }

  for (let a in additions) {
    outList.push(generateArrowObject(data, additions[a][0], additions[a][1], a, colour));
  }

  for (let l in linkers) {
    outList.push(generateCylinderObject(data, linkers[l][0], linkers[l][1], l, colour));
  }

  for (let r in rings) {
    outList.push(generateCylinderObject(data, rings[r][0], rings[r][2], r, colour));
  }
  return outList;
};

const generateBondColorMap = inputDict => {
  var out_d = {};
  for (let keyItem in inputDict) {
    for (let vector in inputDict[keyItem]) {
      const vect = vector.split('_')[0];
      out_d[vect] = inputDict[keyItem][vector];
    }
  }
  return out_d;
};

const getViewUrl = (get_view, data) => {
  return new URL(base_url + '/api/' + get_view + '/' + data.id + '/');
};

const handleVector = (json, stage, data) => (dispatch, getState) => {
  const state = getState();
  const { vector_list, compoundsOfVectors } = state.selectionReducers;

  var objList = generateObjectList(json['3d'], data);
  dispatch(setVectorList([...vector_list, ...objList]));

  const currentVectorCompounds = compoundsOfVectors && compoundsOfVectors[data.smiles];

  // loading vector objects
  objList.map(item =>
    dispatch(
      loadObject({
        target: {
          display_div: VIEWS.MAJOR_VIEW,
          ...getVectorWithColorByCountOfCompounds(item, currentVectorCompounds)
        },
        stage,
        orientationMatrix: null
      })
    )
  );
  var vectorBondColorMap = generateBondColorMap(json['indices']);
  dispatch(updateBondColorMapOfCompounds(data.smiles, vectorBondColorMap));
};

export const addVector = (stage, data) => async (dispatch, getState) => {
  const currentVector = getState().selectionReducers.currentVector;

  dispatch(incrementCountOfPendingVectorLoadRequests());
  dispatch(appendVectorOnList(generateMoleculeId(data)));
  dispatch(selectVectorAndResetCompounds(currentVector));

  return api({ url: getViewUrl('graph', data) })
    .then(response => {
      const result = response.data.graph;
      var new_dict = {};
      // Uniquify
      if (result) {
        Object.keys(result).forEach(key => {
          var smiSet = new Set();
          new_dict[key] = {};
          new_dict[key]['addition'] = [];
          new_dict[key]['vector'] = result[key]['vector'];
          Object.keys(result[key]['addition']).forEach(index => {
            var newSmi = result[key]['addition'][index]['end'];
            if (smiSet.has(newSmi) !== true) {
              new_dict[key]['addition'].push(result[key]['addition'][index]);
              smiSet.add(newSmi);
            }
          });
        });
      }
      return dispatch(updateVectorCompounds(data.smiles, new_dict));
    })
    .then(() => api({ url: getViewUrl('vector', data) }))
    .then(response => dispatch(handleVector(response.data.vectors, stage, data)))
    .finally(() => {
      dispatch(decrementCountOfPendingVectorLoadRequests());
      const currentOrientation = stage.viewerControls.getOrientation();
      dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
    });
};

export const removeCurrentVector = currentMoleculeSmile => (dispatch, getState) => {
  const state = getState();
  const moleculeOfCurrentVector = getMoleculeOfCurrentVector(state);
  if (moleculeOfCurrentVector && moleculeOfCurrentVector.smiles === currentMoleculeSmile) {
    dispatch(setCurrentVector(null));
    dispatch(resetCurrentCompoundsSettings([]));
  }
};

export const removeVector = (stage, data) => async (dispatch, getState) => {
  const state = getState();
  const vector_list = state.selectionReducers.vector_list;
  vector_list
    .filter(item => item.moleculeId === data.id)
    .forEach(item => dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item), stage)));

  await dispatch(removeCurrentVector(data.smiles));

  dispatch(updateVectorCompounds(data.smiles, undefined));
  dispatch(updateBondColorMapOfCompounds(data.smiles, undefined));
  dispatch(removeFromVectorOnList(generateMoleculeId(data)));

  dispatch(setVectorList(vector_list.filter(item => item.moleculeId !== data.id)));
};

export const addHitProtein = (stage, data, colourToggle) => dispatch => {
  dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateHitProteinObject(data, colourToggle, base_url)),
      stage,
      orientationMatrix: null
    })
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendProteinList(generateMoleculeId(data)));
};

export const removeHitProtein = (stage, data, colourToggle) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateHitProteinObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromProteinList(generateMoleculeId(data)));
};

export const addComplex = (stage, data, colourToggle) => dispatch => {
  dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
      stage,
      orientationMatrix: null
    })
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendComplexList(generateMoleculeId(data)));
};

export const removeComplex = (stage, data, colourToggle) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateComplexObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromComplexList(generateMoleculeId(data)));
};

export const addSurface = (stage, data, colourToggle) => dispatch => {
  dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url)),
      stage,
      orientationMatrix: null
    })
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendSurfaceList(generateMoleculeId(data)));
};

export const removeSurface = (stage, data, colourToggle) => dispatch => {
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateSurfaceObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromSurfaceList(generateMoleculeId(data)));
};

export const addDensity = (stage, data, colourToggle) => dispatch => {
  console.log('TODO');
  return;
  dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateDensityObject(data, colourToggle, base_url)),
      stage,
      orientationMatrix: null
    })
  ).finally(() => {
    const currentOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, currentOrientation));
  });
  dispatch(appendDensityList(generateMoleculeId(data)));
};

export const removeDensity = (stage, data, colourToggle) => dispatch => {
  console.log('TODO');
  return;
  dispatch(
    deleteObject(
      Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateDensityObject(data, colourToggle, base_url)),
      stage
    )
  );
  dispatch(removeFromDensityList(generateMoleculeId(data)));
};

export const addLigand = (stage, data, colourToggle, centerOn = false) => (dispatch, getState) => {
  const currentOrientation = stage.viewerControls.getOrientation();
  dispatch(appendFragmentDisplayList(generateMoleculeId(data)));
  return dispatch(
    loadObject({
      target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data, colourToggle)),
      stage,
      undefined
    })
  ).finally(() => {
    const ligandOrientation = stage.viewerControls.getOrientation();
    dispatch(setOrientation(VIEWS.MAJOR_VIEW, ligandOrientation));

    dispatch(appendMoleculeOrientation(data?.id, ligandOrientation));
    if (centerOn === false) {
      // keep current orientation of NGL View
      stage.viewerControls.orient(currentOrientation);
    }
  });
};

export const removeLigand = (stage, data) => dispatch => {
  dispatch(deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMoleculeObject(data)), stage));
  dispatch(removeFromFragmentDisplayList(generateMoleculeId(data)));

  // remove vector
  dispatch(removeVector(stage, data));
};

/**
 * Turn on the complex of the first ligand of the site
 */
export const initializeMolecules = (majorView, moleculeList, first) => dispatch => {
  if (moleculeList && majorView) {
    const firstMolecule = first || moleculeList[0];
    if (firstMolecule) {
      dispatch(addHitProtein(majorView, firstMolecule, colourList[firstMolecule.id % colourList.length]));
      dispatch(addLigand(majorView, firstMolecule, colourList[firstMolecule.id % colourList.length], true));
    }
  }
};

export const hideAllSelectedMolecules = (stage, currentMolecules) => (dispatch, getState) => {
  const state = getState();
  const fragmentDisplayList = state.selectionReducers.fragmentDisplayList;
  const complexList = state.selectionReducers.complexList;
  const vectorOnList = state.selectionReducers.vectorOnList;
  const surfaceList = state.selectionReducers.surfaceList;
  const proteinList = state.selectionReducers.proteinList;

  fragmentDisplayList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      dispatch(removeLigand(stage, data));
    }
  });
  complexList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      dispatch(removeComplex(stage, data, colourList[0]));
    }
  });
  vectorOnList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      dispatch(removeVector(stage, data));
    }
  });

  // remove Surface
  surfaceList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      dispatch(removeSurface(stage, data));
    }
  });

  // remove Protein
  proteinList.forEach(moleculeId => {
    const data = currentMolecules.find(molecule => molecule.id === moleculeId);
    if (data) {
      dispatch(removeHitProtein(stage, data));
    }
  });

  // vector_list
  dispatch(setVectorList([]));
  dispatch(resetCompoundsOfVectors());
  dispatch(resetBondColorMapOfVectors());
  dispatch(setCompoundImage(noCompoundImage));
};

export const searchMoleculeGroupByMoleculeID = moleculeID => (dispatch, getState) =>
  api({ url: `${base_url}/api/molgroup/?mol_id=${moleculeID}` }).then(response => {
    let resultMolGroupID = null;
    const molGroupID = response?.data?.results[0]?.id;
    const mol_group_list = getState().apiReducers.mol_group_list;

    if (mol_group_list && Array.isArray(mol_group_list) && molGroupID) {
      mol_group_list.forEach((item, index) => {
        if (item.id === molGroupID) {
          resultMolGroupID = index + 1;
        }
      });
    }
    return Promise.resolve(resultMolGroupID);
  });

export const applyDirectSelection = (stage/*, getMolGroupNameToId*/) => (dispatch, getState) => {
  const state = getState();

  const directDisplay = state.apiReducers.direct_access;
  const mol_group_selection = state.selectionReducers.mol_group_selection;
  const fragmentDisplayList = state.selectionReducers.fragmentDisplayList;
  const proteinList = state.selectionReducers.proteinList;
  const complexList = state.selectionReducers.complexList;
  const surfaceList = state.selectionReducers.surfaceList;
  const vectorOnList = state.selectionReducers.vectorOnList;
  const mol_group_list = state.apiReducers.mol_group_list;

  if (directDisplay && directDisplay.molecules && directDisplay.molecules.length > 0) {
    const allMols = state.apiReducers.all_mol_lists;
    //const molGroupMap = getMolGroupNameToId();
    directDisplay.molecules.forEach(m => {
      let keys = Object.keys(allMols);
      for (let groupIndex = 0; groupIndex < keys.length; groupIndex++) {
        let groupId = keys[groupIndex];
        let molList = allMols[groupId];
        let molCount = molList.length;
        for (let molIndex = 0; molIndex < molCount; molIndex++) {
          let mol = molList[molIndex];
          if (mol.protein_code.includes(m.name) || mol.protein_code.includes(m.name.toLowerCase())) {
            let molGroupId = groupId;
            if (!mol_group_selection.includes(parseInt(molGroupId))) {
              let molGroup = mol_group_list.find(g => g.id === parseInt(molGroupId));
              dispatch(selectMoleculeGroup(molGroup, stage));
            }
            if (m.L && !fragmentDisplayList.includes(mol.id)) {
              dispatch(addLigand(stage, mol, colourList[mol.id % colourList.length]));
            }
            if (m.P && !proteinList.includes(mol.id)) {
              dispatch(addHitProtein(stage, mol, colourList[mol.id % colourList.length]));
            }
            if (m.C && !complexList.includes(mol.id)) {
              dispatch(addComplex(stage, mol, colourList[mol.id % colourList.length]));
            }
            if (m.S && !surfaceList.includes(mol.id)) {
              dispatch(addSurface(stage, mol, colourList[mol.id % colourList.length]));
            }
            if (m.V && !vectorOnList.includes(mol.id)) {
              dispatch(addVector(stage, mol, colourList[mol.id % colourList.length]));
            }
          }
        }
      }
    });
  }

};
