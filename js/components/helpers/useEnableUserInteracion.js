import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export const useDisableUserInteraction = () => {
  const [disableInteraction, setDisableInteraction] = useState(false);
  const countOfPendingVectorLoadRequests = useSelector(
    state => state.selectionReducers.countOfPendingVectorLoadRequests
  );
  const countOfRemainingMoleculeGroups = useSelector(state => state.nglReducers.countOfRemainingMoleculeGroups);
  const proteinsHasLoaded = useSelector(state => state.nglReducers.proteinsHasLoaded);
  const countOfPendingNglObjects = useSelector(state => state.nglReducers.countOfPendingNglObjects);

  useEffect(() => {
    if (
      countOfPendingVectorLoadRequests === 0 &&
      countOfPendingNglObjects === 0 &&
      ((countOfRemainingMoleculeGroups === 0 && proteinsHasLoaded === true) ||
        (countOfRemainingMoleculeGroups === null && proteinsHasLoaded === null))
    ) {
      if (disableInteraction === true) {
        setDisableInteraction(false);
      }
    } else {
      if (disableInteraction === false) {
        setDisableInteraction(true);
      }
    }
  }, [
    countOfPendingNglObjects,
    countOfPendingVectorLoadRequests,
    countOfRemainingMoleculeGroups,
    disableInteraction,
    proteinsHasLoaded
  ]);

  return disableInteraction;
};
