import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const EMPTY_LIST = [];

export const getPoseObservationIds = pose => {
  if (Array.isArray(pose?.associatedObs) && pose.associatedObs.length > 0) {
    return pose.associatedObs.map(observation => observation.id);
  }

  return Array.isArray(pose?.site_observations) ? pose.site_observations : EMPTY_LIST;
};

export const getRequiredPageForIndex = (index, moleculesPerPage) => Math.floor(index / moleculesPerPage) + 1;

export const poseListsDiffer = (currentItems = EMPTY_LIST, nextItems = EMPTY_LIST) =>
  currentItems.length !== nextItems.length || currentItems.some((item, index) => item !== nextItems[index]);

export const findFirstScrollablePose = ({
  poses = EMPTY_LIST,
  prioritizedPoseId = null,
  selectedObservationIds = EMPTY_LIST
}) => {
  if (!Array.isArray(poses) || poses.length === 0) {
    return null;
  }

  if (prioritizedPoseId !== null && prioritizedPoseId !== undefined) {
    const prioritizedIndex = poses.findIndex(pose => pose.id === prioritizedPoseId);
    if (prioritizedIndex >= 0) {
      return {
        poseId: poses[prioritizedIndex].id,
        index: prioritizedIndex
      };
    }
  }

  if (!selectedObservationIds.length) {
    return null;
  }

  const selectedObservationIdsSet = new Set(selectedObservationIds);
  const selectedIndex = poses.findIndex(pose =>
    getPoseObservationIds(pose).some(observationId => selectedObservationIdsSet.has(observationId))
  );

  if (selectedIndex < 0) {
    return null;
  }

  return {
    poseId: poses[selectedIndex].id,
    index: selectedIndex
  };
};

export const elementIsVisibleInContainer = (element, container, partiallyVisible = false) => {
  if (!element) {
    return false;
  }

  const elementRect = element.getBoundingClientRect();

  if (!container) {
    const viewportRect = {
      top: 0,
      left: 0,
      bottom: window.innerHeight,
      right: window.innerWidth
    };

    return partiallyVisible
      ? elementRect.bottom > viewportRect.top &&
          elementRect.top < viewportRect.bottom &&
          elementRect.right > viewportRect.left &&
          elementRect.left < viewportRect.right
      : elementRect.top >= viewportRect.top &&
          elementRect.left >= viewportRect.left &&
          elementRect.bottom <= viewportRect.bottom &&
          elementRect.right <= viewportRect.right;
  }

  const containerRect = container.getBoundingClientRect();

  return partiallyVisible
    ? elementRect.bottom > containerRect.top &&
        elementRect.top < containerRect.bottom &&
        elementRect.right > containerRect.left &&
        elementRect.left < containerRect.right
    : elementRect.top >= containerRect.top &&
        elementRect.left >= containerRect.left &&
        elementRect.bottom <= containerRect.bottom &&
        elementRect.right <= containerRect.right;
};

/**
 * Scrolls the shared pose list to the first relevant pose when a snapshot is restored.
 */
export const useScrollToSelectedPose = ({
  poses = EMPTY_LIST,
  moleculesPerPage,
  setCurrentPage,
  scrollContainerRef,
  isDataLoaded = false,
  isObservationsDialogOpen = false,
  poseIdForObservationsDialog = null,
  shouldPrioritizeObservationsDialogPose = true,
  ligandIds = EMPTY_LIST,
  proteinIds = EMPTY_LIST,
  complexIds = EMPTY_LIST,
  surfaceIds = EMPTY_LIST,
  densityList = EMPTY_LIST,
  vectorIds = EMPTY_LIST
}) => {
  const [moleculeViewRefs, setMoleculeViewRefs] = useState({});
  const [scrollToMoleculeId, setScrollToMoleculeId] = useState(null);
  const hasHandledInitialScrollRef = useRef(false);

  const prioritizedPoseId =
    shouldPrioritizeObservationsDialogPose && isObservationsDialogOpen ? poseIdForObservationsDialog : null;

  const selectedObservationIds = useMemo(
    () => [
      ...ligandIds,
      ...proteinIds,
      ...complexIds,
      ...surfaceIds,
      ...vectorIds,
      ...densityList.map(density => density.id)
    ],
    [ligandIds, proteinIds, complexIds, surfaceIds, vectorIds, densityList]
  );

  useEffect(() => {
    if (!isDataLoaded) {
      hasHandledInitialScrollRef.current = false;
      setScrollToMoleculeId(null);
      setMoleculeViewRefs({});
    }
  }, [isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded || hasHandledInitialScrollRef.current || !poses.length) {
      return;
    }

    hasHandledInitialScrollRef.current = true;

    const targetPose = findFirstScrollablePose({
      poses,
      prioritizedPoseId,
      selectedObservationIds
    });

    if (!targetPose) {
      return;
    }

    setCurrentPage(currentPage => {
      const requiredPage = getRequiredPageForIndex(targetPose.index, moleculesPerPage);
      return currentPage >= requiredPage ? currentPage : requiredPage;
    });
    setScrollToMoleculeId(targetPose.poseId);
  }, [isDataLoaded, poses, prioritizedPoseId, selectedObservationIds, setCurrentPage, moleculesPerPage]);

  useEffect(() => {
    if (scrollToMoleculeId === null) {
      return;
    }

    const node = moleculeViewRefs[scrollToMoleculeId];
    if (!node) {
      return;
    }

    setScrollToMoleculeId(null);

    if (!elementIsVisibleInContainer(node, scrollContainerRef?.current, true)) {
      const animationFrameId = window.requestAnimationFrame(() => {
        node.scrollIntoView({
          block: 'nearest',
          inline: 'nearest'
        });
      });

      return () => {
        window.cancelAnimationFrame(animationFrameId);
      };
    }
  }, [moleculeViewRefs, scrollToMoleculeId, scrollContainerRef]);

  const addMoleculeViewRef = useCallback((moleculeId, node) => {
    setMoleculeViewRefs(prevRefs => {
      const currentNode = prevRefs[moleculeId];

      if (!node) {
        if (!Object.prototype.hasOwnProperty.call(prevRefs, moleculeId)) {
          return prevRefs;
        }

        const nextRefs = { ...prevRefs };
        delete nextRefs[moleculeId];
        return nextRefs;
      }

      if (currentNode === node) {
        return prevRefs;
      }

      return {
        ...prevRefs,
        [moleculeId]: node
      };
    });
  }, []);

  const getNode = useCallback(
    molId => {
      return moleculeViewRefs[molId];
    },
    [moleculeViewRefs]
  );

  return {
    addMoleculeViewRef,
    setScrollToMoleculeId,
    getNode,
    registeredMoleculeViewCount: Object.keys(moleculeViewRefs).length
  };
};
