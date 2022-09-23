import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDatasetScrolled } from './redux/actions';
import { getJoinedMoleculeLists } from './redux/selectors';

/**
 * A hook which scrolls to the first selected dataset molecule when a snapshot is loaded.
 */
export const useScrollToSelected = (datasetID, moleculesPerPage, setCurrentPage) => {
  const dispatch = useDispatch();

  const joinedMoleculeLists = useSelector(state => getJoinedMoleculeLists(datasetID, state));
  const compoundsToBuyList = useSelector(state => state.datasetsReducers.compoundsToBuyDatasetMap[datasetID]);
  const scrollFired = useSelector(state => state.datasetsReducers.datasetScrolledMap[datasetID]);
  const rhsOpen = useSelector(state => state.previewReducers.viewerControls.sidesOpen.RHS);

  const [moleculeViewRefs, setMoleculeViewRefs] = useState({});
  const [scrollToMoleculeId, setScrollToMoleculeId] = useState(null);

  // First pass, iterates over all the molecules and checks if any of them is selected. If it is,
  // it saves the ID of the molecule and determines how many pages of molecules should be displayed.
  // This is done only once and only if right hand side is open.
  // This also gets reset on snapshot change.
  useEffect(() => {
    if (rhsOpen) {
      if (!scrollFired) {
        if (compoundsToBuyList?.length) {
          for (let i = 0; i < joinedMoleculeLists.length; i++) {
            const molecule = joinedMoleculeLists[i];

            if (compoundsToBuyList.includes(molecule.id)) {
              setCurrentPage(i / moleculesPerPage + 1);
              setScrollToMoleculeId(molecule.id);
              break;
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
    setCurrentPage
  ]);

  // Second pass, once the list of molecules is displayed and the refs to their DOM nodes have been
  // obtained, scroll to the the saved molecule from the first pass.
  // setTimeout might be necessary for the scrolling to happen.
  useEffect(() => {
    if (scrollToMoleculeId !== null) {
      const node = moleculeViewRefs[scrollToMoleculeId];
      if (node) {
        setScrollToMoleculeId(null);
        setTimeout(() => {
          node.scrollIntoView();
        });
      }
    }
  }, [moleculeViewRefs, scrollToMoleculeId]);

  // Used to attach the ref of DOM nodes.
  const addMoleculeViewRef = useCallback((moleculeId, node) => {
    setMoleculeViewRefs(prevRefs => ({
      ...prevRefs,
      [moleculeId]: node
    }));
  }, []);

  return addMoleculeViewRef;
};
