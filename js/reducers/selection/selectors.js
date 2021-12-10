import { createSelector } from 'reselect';
import { getAllMoleculeList } from '../api/selectors';

const getCurrentCompoundClass = state => state.previewReducers.compounds.currentCompoundClass;
const getVectorList = state => state.selectionReducers.vector_list;
const getCurrentVector = state => state.selectionReducers.currentVector;
const getBondColorMapOfVectors = state => state.selectionReducers.bondColorMapOfVectors;
const getCompoundsOfVectors = state => state.selectionReducers.compoundsOfVectors;

export const getMoleculeOfCurrentVector = createSelector(
  getCurrentVector,
  getVectorList,
  getAllMoleculeList,
  (selectedVectorSmile, vectorList, moleculeList) => {
    if (selectedVectorSmile !== null && vectorList && moleculeList) {
      const foundedVector = vectorList.find(vector => vector.name.includes(selectedVectorSmile));
      if (foundedVector) {
        let molecule = moleculeList.find(m => m.id === foundedVector.moleculeId);
        if (molecule) {
          return molecule;
        }
        return undefined;
      }
    }
    return null;
  }
);

export const getAllCurrentVectorCompounds = createSelector(
  getCompoundsOfVectors,
  getMoleculeOfCurrentVector,
  (compoundsOfVectors, currentMolecule) => {
    if (currentMolecule && currentMolecule.smiles && compoundsOfVectors) {
      return compoundsOfVectors[currentMolecule.smiles];
    }
    return null;
  }
);

export const getAllCurrentBondColorMapOfVectors = createSelector(
  getBondColorMapOfVectors,
  getMoleculeOfCurrentVector,
  (bondColorMapOfVectors, currentMolecule) => {
    if (currentMolecule && currentMolecule.smiles && bondColorMapOfVectors) {
      return bondColorMapOfVectors[currentMolecule.smiles];
    }
    return null;
  }
);

export const getCurrentVectorCompoundsFiltered = createSelector(
  getAllCurrentVectorCompounds,
  getCurrentVector,
  (currentVectorCompounds, selectedVectorSmile) => {
    if (currentVectorCompounds && selectedVectorSmile !== null) {
      var new_this_vector_list = {};
      Object.keys(currentVectorCompounds).forEach(key => {
        if (key.split('_')[0] === selectedVectorSmile) {
          new_this_vector_list[key] = currentVectorCompounds[key];
        }
      });
      return new_this_vector_list;
    }
    return null;
  }
);

export const getAllCompoundsList = createSelector(
  getCurrentVectorCompoundsFiltered,
  getCurrentCompoundClass,
  getMoleculeOfCurrentVector,
  (currentVectorCompoundsFiltered, currentCompoundClass, moleculeOfVector) => {
    let compoundsList = [];
    if (currentVectorCompoundsFiltered) {
      Object.keys(currentVectorCompoundsFiltered).forEach(key => {
        const vector_smi = currentVectorCompoundsFiltered[key].vector;
        const change_list = currentVectorCompoundsFiltered[key].addition;
        change_list.forEach(data_transfer => {
          const inputData = {};
          inputData.smiles = data_transfer && data_transfer.end;
          // Set this back for now - because it's confusing - alter to change if want later
          inputData.show_frag = data_transfer && data_transfer.end;
          inputData.vector = vector_smi;
          inputData.mol = moleculeOfVector && moleculeOfVector.smiles;
          inputData.class = currentCompoundClass;
          inputData.isShowed = false;
          inputData.compound_ids = data_transfer.compound_ids;
          compoundsList.push(inputData);
        });
      });
    }
    return compoundsList;
  }
);
