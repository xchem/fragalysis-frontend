import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const useDisableNglControlButtons = selectedMolecules => {
  const disableNglControlButtons = useSelector(state => state.previewReducers.molecule.disableNglControlButtons);

  const selectedIds = useMemo(() => new Set(selectedMolecules.map(molecule => String(molecule.id))), [
    selectedMolecules
  ]);
  const [ligandControlButtonDisabled, proteinControlButtonDisabled, complexControlButtonDisabled] = useMemo(() => {
    const selectedMoleculesControlButtons = Object.entries(disableNglControlButtons).filter(([moleculeId]) =>
      selectedIds.has(moleculeId)
    );
    return ['ligand', 'protein', 'complex'].map(type =>
      selectedMoleculesControlButtons.some(([, buttonsState]) => buttonsState[type])
    );
  }, [disableNglControlButtons, selectedIds]);

  const groupNglControlButtonsDisabledState = useMemo(() => {
    return {
      ligand: ligandControlButtonDisabled,
      protein: proteinControlButtonDisabled,
      complex: complexControlButtonDisabled
    };
  }, [ligandControlButtonDisabled, proteinControlButtonDisabled, complexControlButtonDisabled]);

  return groupNglControlButtonsDisabledState;
};

export default useDisableNglControlButtons;
