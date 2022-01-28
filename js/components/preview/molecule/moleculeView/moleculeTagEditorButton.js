import React, { useContext } from 'react';
import { IconButton } from '@material-ui/core';
import { useSelector } from 'react-redux';
import GroupNglControlButtonsContext from '../groupNglControlButtonsContext';

const MoleculeTagEditorButton = ({ children, moleculeID, noTagsReceived, ...rest }) => {
  const disableGroupNglControlButtons = useContext(GroupNglControlButtonsContext);
  const disableMoleculeNglControlButtons =
    useSelector(state => state.previewReducers.molecule.disableNglControlButtons[moleculeID]) || {};

  const moleculeAnyLPCControlButtonDisabled = ['ligand', 'protein', 'complex'].some(
    type => disableMoleculeNglControlButtons[type] || disableGroupNglControlButtons[type]
  );

  return (
    <IconButton {...rest} disabled={noTagsReceived || moleculeAnyLPCControlButtonDisabled}>
      {children}
    </IconButton>
  );
};

export default MoleculeTagEditorButton;
