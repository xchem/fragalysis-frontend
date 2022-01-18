import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const useDisableNglControlButtons = selectedMolecules => {
  const disableNglControlButtons = useSelector(state => state.previewReducers.molecule.disableNglControlButtons);

  const selectedMoleculesControlButtons = Object.entries(disableNglControlButtons).filter(([moleculeId]) => {
    return selectedMolecules.some(molecule => String(molecule.id) === moleculeId);
  });

  const ligandControlButtonDisabled = selectedMoleculesControlButtons.some(([_, buttonsState]) => buttonsState.ligand);
  const proteinControlButtonDisabled = selectedMoleculesControlButtons.some(
    ([_, buttonsState]) => buttonsState.protein
  );
  const complexControlButtonDisabled = selectedMoleculesControlButtons.some(
    ([_, buttonsState]) => buttonsState.complex
  );

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
