import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { setScrollFiredForLHS } from '../../../reducers/selection/actions';
import { getLHSCompoundsList } from './redux/selectors';

/**
 * A hook which scrolls to the first selected pose when a snapshot is loaded.
 */
export const useScrollToSelectedPose = (moleculesPerPage, setCurrentPage) => {
  const dispatch = useDispatch();

  const poses = useSelector(state => getLHSCompoundsList(state), shallowEqual);
  const ligands = useSelector(state => state.selectionReducers.fragmentDisplayList);
  const proteins = useSelector(state => state.selectionReducers.proteinList);
  const complexes = useSelector(state => state.selectionReducers.complexList);
  const surfaces = useSelector(state => state.selectionReducers.surfaceList);
  const densityList = useSelector(state => state.selectionReducers.densityList);
  const densityListCustom = useSelector(state => state.selectionReducers.densityListCustom);
  const vectorOnList = useSelector(state => state.selectionReducers.vectorOnList);

  const isObservationsDialogOpen = useSelector(state => state.selectionReducers.isObservationDialogOpen);

  const poseIdForObservationsDialog = useSelector(state => state.selectionReducers.poseIdForObservationsDialog);

  const scrollFired = useSelector(state => state.selectionReducers.isScrollFiredForLHS);

  const [moleculeViewRefs, setMoleculeViewRefs] = useState({});
  const [scrollToMoleculeId, setScrollToMoleculeId] = useState(null);

  // First pass, iterates over all the molecules and checks if any of them is selected. If it is,
  // it saves the ID of the molecule and determines how many pages of molecules should be displayed.
  // This is done only once.
  // This also gets reset on snapshot change.
  useEffect(() => {
    if (!scrollFired) {
      if (isObservationsDialogOpen && poseIdForObservationsDialog) {
        for (let i = 0; i < poses.length; i++) {
          const pose = poses[i];
          if (pose.id === poseIdForObservationsDialog) {
            setCurrentPage(i / moleculesPerPage + 1);
            setScrollToMoleculeId(poseIdForObservationsDialog);
            break;
          }
        }
      } else if (
        ligands?.length ||
        proteins?.length ||
        complexes?.length ||
        surfaces?.length ||
        densityList?.length ||
        densityListCustom?.length ||
        vectorOnList?.length
      ) {
        for (let i = 0; i < poses.length; i++) {
          const pose = poses[i];
          const molsForCmp = pose.associatedObs;

          if (
            containsAtLeastOne(ligands, molsForCmp) ||
            containsAtLeastOne(proteins, molsForCmp) ||
            containsAtLeastOne(complexes, molsForCmp) ||
            containsAtLeastOne(surfaces, molsForCmp) ||
            containsAtLeastOne(densityList, molsForCmp) ||
            containsAtLeastOne(densityListCustom, molsForCmp) ||
            containsAtLeastOne(vectorOnList, molsForCmp)
          ) {
            setCurrentPage(i / moleculesPerPage + 1);
            setScrollToMoleculeId(pose.id);
            break;
          }
        }
      }
    }

    dispatch(setScrollFiredForLHS(true));
  }, [
    dispatch,
    poses,
    moleculesPerPage,
    scrollFired,
    setCurrentPage,
    ligands,
    proteins,
    complexes,
    surfaces,
    densityList.length,
    densityListCustom.length,
    densityList,
    densityListCustom,
    vectorOnList,
    poseIdForObservationsDialog,
    isObservationsDialogOpen
  ]);

  // Second pass, once the list of molecules is displayed and the refs to their DOM nodes have been
  // obtained, scroll to the the saved molecule from the first pass.
  // setTimeout might be necessary for the scrolling to happen.
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
  //   setMoleculeViewRefs(prevRefs => ({
  //     ...prevRefs,
  //     [moleculeId]: node
  //   }));
  // }, []);

  const addMoleculeViewRef = useCallback((moleculeId, node) => {
    setMoleculeViewRefs(prevRefs => {
      if (prevRefs.hasOwnProperty(moleculeId) || !node) return prevRefs;
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

  const containsAtLeastOne = (list, molsList) => {
    for (const mol of molsList) {
      if (list.includes(mol.id)) {
        return true;
      }
    }

    return false;
  };

  return { addMoleculeViewRef, setScrollToMoleculeId, getNode };
};
