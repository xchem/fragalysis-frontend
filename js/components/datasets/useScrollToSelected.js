import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { setDatasetScrolled } from './redux/actions';
import { getJoinedMoleculeLists } from './redux/selectors';

/**
 * A hook which scrolls to the first selected dataset molecule when a snapshot is loaded.
 */
export const useScrollToSelected = (datasetID, moleculesPerPage, setCurrentPage) => {
  const dispatch = useDispatch();

  const joinedMoleculeLists = useSelector(state => getJoinedMoleculeLists(datasetID, state), shallowEqual);
  const compoundsToBuyList = useSelector(state => state.datasetsReducers.compoundsToBuyDatasetMap[datasetID]);

  const ligands = useSelector(state => state.datasetsReducers.ligandLists[datasetID]);

  const proteins = useSelector(state => state.datasetsReducers.proteinLists[datasetID]);
  const complexes = useSelector(state => state.datasetsReducers.complexLists[datasetID]);
  const surfaces = useSelector(state => state.datasetsReducers.surfaceLists[datasetID]);

  const proteinList = useSelector(state => state.selectionReducers.proteinList);
  const complexList = useSelector(state => state.selectionReducers.complexList);
  const surfaceList = useSelector(state => state.selectionReducers.surfaceList);

  const scrollFired = useSelector(state => state.datasetsReducers.datasetScrolledMap[datasetID]);
  const rhsOpen = useSelector(state => state.previewReducers.viewerControls.sidesOpen.RHS);
  const isInspirationsDialogOpened = useSelector(state => state.datasetsReducers.isOpenInspirationDialog);
  const inspirationLists = useSelector(state => state.datasetsReducers.inspirationLists);
  const isItForSelectedCompoundsList = useSelector(
    state => state.datasetsReducers.inspirationsDialogOpenedForSelectedCompound
  );

  const dialogOpenedForInspirationWithId =
    inspirationLists.hasOwnProperty(datasetID) && inspirationLists[datasetID]?.length > 0
      ? inspirationLists[datasetID][0]
      : 0;

  const [moleculeViewRefs, setMoleculeViewRefs] = useState({});
  const [scrollToMoleculeId, setScrollToMoleculeId] = useState(null);

  const tabValue = useSelector(state => state.datasetsReducers.tabValue);
  const isComputedDatasetsTab = tabValue > 1;

  // First pass, iterates over all the molecules and checks if any of them is selected. If it is,
  // it saves the ID of the molecule and determines how many pages of molecules should be displayed.
  // This is done only once and only if right hand side is open.
  // This also gets reset on snapshot change.
  useEffect(() => {
    if (rhsOpen && isComputedDatasetsTab) {
      if (!scrollFired) {
        if (isInspirationsDialogOpened && dialogOpenedForInspirationWithId && !isItForSelectedCompoundsList) {
          for (let i = 0; i < joinedMoleculeLists?.length; i++) {
            const molecule = joinedMoleculeLists[i];

            if (molecule.id === dialogOpenedForInspirationWithId) {
              setCurrentPage(i / moleculesPerPage + 1);
              setScrollToMoleculeId(molecule.id);
              break;
            }
          }
        } else {
          for (let i = 0; i < joinedMoleculeLists?.length; i++) {
            const molecule = joinedMoleculeLists[i];

            if (molecule.isCustomPdb) {
              if (
                ligands?.includes(molecule.id) ||
                proteins?.includes(molecule.id) ||
                complexes?.includes(molecule.id) ||
                surfaces?.includes(molecule.id)
              ) {
                setCurrentPage(i / moleculesPerPage + 1);
                setScrollToMoleculeId(molecule.id);
                break;
              }
            } else {
              if (
                ligands?.includes(molecule.id) ||
                proteinList?.includes(molecule.id) ||
                complexList?.includes(molecule.id) ||
                surfaceList?.includes(molecule.id)
              ) {
                setCurrentPage(i / moleculesPerPage + 1);
                setScrollToMoleculeId(molecule.id);
                break;
              }
            }
          }
        }
      }

      dispatch(setDatasetScrolled(datasetID));
    }
  }, [
    compoundsToBuyList,
    datasetID,
    dispatch,
    joinedMoleculeLists,
    moleculesPerPage,
    rhsOpen,
    scrollFired,
    setCurrentPage,
    ligands,
    proteins,
    complexes,
    surfaces,
    dialogOpenedForInspirationWithId,
    isItForSelectedCompoundsList,
    isInspirationsDialogOpened,
    proteinList,
    complexList,
    surfaceList,
    isComputedDatasetsTab
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

  return { addMoleculeViewRef, setScrollToMoleculeId, getNode };
};
