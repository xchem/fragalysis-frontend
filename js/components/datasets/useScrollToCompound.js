import { useCallback, useEffect, useState } from 'react';

export const useScrollToCompound = () => {
  const [moleculeViewRefs, setMoleculeViewRefs] = useState({});
  const [scrollToMoleculeId, setScrollToMoleculeId] = useState(null);

  useEffect(() => {
    if (scrollToMoleculeId !== null) {
      const node = moleculeViewRefs[scrollToMoleculeId];
      if (node) {
        setScrollToMoleculeId(null);
        if (!elementIsVisibleInViewport(node)) {
          setTimeout(() => {
            node.scrollIntoView();
          });
        }
      }
    }
  }, [moleculeViewRefs, scrollToMoleculeId]);

  const elementIsVisibleInViewport = (el, partiallyVisible = false) => {
    const { top, left, bottom, right } = el.getBoundingClientRect();
    const { innerHeight, innerWidth } = window;
    return partiallyVisible
      ? ((top > 0 && top < innerHeight) || (bottom > 0 && bottom < innerHeight)) &&
          ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
      : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
  };

  // Used to attach the ref of DOM nodes.
  // const addMoleculeViewRef = useCallback((moleculeId, node) => {
  //   if (moleculeId && node) {
  //     setMoleculeViewRefs(prevRefs => ({
  //       ...prevRefs,
  //       [moleculeId]: node
  //     }));
  //   }
  // }, []);

  const addMoleculeViewRef = useCallback((moleculeId, node) => {
    setMoleculeViewRefs(prevRefs => {
      if (prevRefs.hasOwnProperty(moleculeId)) return prevRefs;
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

  return { addMoleculeViewRef, setScrollToMoleculeId, getNode };
};
