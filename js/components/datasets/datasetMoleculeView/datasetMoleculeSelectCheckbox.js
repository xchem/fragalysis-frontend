import { Checkbox } from '@material-ui/core';
import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import GroupDatasetNglControlButtonsContext from '../groupDatasetNglControlButtonsContext';

const DatasetMoleculeSelectCheckbox = ({ datasetID, moleculeID, ...rest }) => {
  const disableGroupNglControlButtons = useContext(GroupDatasetNglControlButtonsContext);
  const disableMoleculeNglControlButtons =
    useSelector(state => state.datasetsReducers.disableDatasetsNglControlButtons[datasetID]?.[moleculeID]) || {};

  const moleculeAnyLPCControlButtonDisabled = ['ligand', 'protein', 'complex'].some(
    type => disableMoleculeNglControlButtons[type] || disableGroupNglControlButtons[type]
  );

  return <Checkbox {...rest} disabled={moleculeAnyLPCControlButtonDisabled} />;
};

export default DatasetMoleculeSelectCheckbox;
