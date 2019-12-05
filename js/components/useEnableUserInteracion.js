import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export const useEnableUserInteraction = () => {
  const [enableInteraction, setEnableInteraction] = useState(false);
  const countOfPendingVectorLoadRequests = useSelector(
    state => state.selectionReducers.present.countOfPendingVectorLoadRequests
  );
  const countOfRemainingMoleculeGroups = useSelector(state => state.nglReducers.present.countOfRemainingMoleculeGroups);
  const proteinsHasLoad = useSelector(state => state.nglReducers.present.proteinsHasLoad);

  useEffect(() => {
    if (countOfPendingVectorLoadRequests === 0 && countOfRemainingMoleculeGroups === 0 && proteinsHasLoad === true) {
      setEnableInteraction(true);
    } else {
      setEnableInteraction(false);
    }
  }, [countOfPendingVectorLoadRequests, countOfRemainingMoleculeGroups, proteinsHasLoad]);

  return enableInteraction;
};
