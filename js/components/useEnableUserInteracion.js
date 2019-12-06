import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export const useDisableUserInteraction = () => {
  const [disableInteraction, setDisableInteraction] = useState(false);
  const countOfPendingVectorLoadRequests = useSelector(
    state => state.selectionReducers.present.countOfPendingVectorLoadRequests
  );
  const countOfRemainingMoleculeGroups = useSelector(state => state.nglReducers.present.countOfRemainingMoleculeGroups);
  const proteinsHasLoad = useSelector(state => state.nglReducers.present.proteinsHasLoad);

  useEffect(() => {
    if (
      countOfPendingVectorLoadRequests === 0 &&
      ((countOfRemainingMoleculeGroups === 0 && proteinsHasLoad === true) ||
        (countOfRemainingMoleculeGroups === null && proteinsHasLoad === null))
    ) {
      setDisableInteraction(false);
    } else {
      setDisableInteraction(true);
    }
  }, [countOfPendingVectorLoadRequests, countOfRemainingMoleculeGroups, proteinsHasLoad]);

  return disableInteraction;
};
