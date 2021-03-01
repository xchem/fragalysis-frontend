import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { VIEWS } from '../../constants/constants';

export const useDisableUserInteraction = () => {
  const [disableInteraction, setDisableInteraction] = useState(false);
  const countOfPendingVectorLoadRequests = useSelector(
    state => state.selectionReducers.countOfPendingVectorLoadRequests
  );
  const countOfRemainingMoleculeGroups = useSelector(state => state.nglReducers.countOfRemainingMoleculeGroups);
  const proteinsHasLoaded = useSelector(state => state.nglReducers.proteinsHasLoaded);
  const countOfPendingNglObjects = useSelector(state => state.nglReducers.countOfPendingNglObjects);
  const isLoadingTree = useSelector(state => state.projectReducers.isLoadingTree);
  const isLoadingCurrentSnapshot = useSelector(state => state.projectReducers.isLoadingCurrentSnapshot);
  const isRestoring = useSelector(state => state.trackingReducers.isActionRestoring);

  useEffect(() => {
    if (
      isRestoring === false &&
      isLoadingTree === false &&
      isLoadingCurrentSnapshot === false &&
      countOfPendingVectorLoadRequests === 0 &&
      countOfPendingNglObjects[VIEWS.SUMMARY_VIEW] === 0 &&
      countOfPendingNglObjects[VIEWS.MAJOR_VIEW] === 0 &&
      ((countOfRemainingMoleculeGroups === 0 && proteinsHasLoaded === true) ||
        (countOfRemainingMoleculeGroups === null && proteinsHasLoaded === null) ||
        (countOfRemainingMoleculeGroups === null && proteinsHasLoaded === true))
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
    isLoadingCurrentSnapshot,
    isLoadingTree,
    isRestoring,
    proteinsHasLoaded
  ]);

  return disableInteraction;
};
