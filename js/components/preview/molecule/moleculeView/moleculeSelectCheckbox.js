import React, { useContext } from 'react';
import { useSelector } from 'react-redux';
import { Checkbox } from '@material-ui/core';
import GroupNglControlButtonsContext from '../groupNglControlButtonsContext';

const MoleculeSelectCheckbox = ({ moleculeID, ...rest }) => {
  const disableGroupNglControlButtons = useContext(GroupNglControlButtonsContext);
  const disableMoleculeNglControlButtons =
    useSelector(state => state.previewReducers.molecule.disableNglControlButtons[moleculeID]) || {};

  const moleculeAnyLPCControlButtonDisabled = ['ligand', 'protein', 'complex'].some(
    type => disableMoleculeNglControlButtons[type] || disableGroupNglControlButtons[type]
  );

  return <Checkbox disabled={moleculeAnyLPCControlButtonDisabled} {...rest} />;
};

export default MoleculeSelectCheckbox;
