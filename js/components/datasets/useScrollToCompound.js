import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getListOfSelectedComplexOfAllDatasets,
  getListOfSelectedLigandOfAllDatasets,
  getListOfSelectedProteinOfAllDatasets,
  getListOfSelectedSurfaceOfAllDatasets,
  getMoleculesObjectIDListOfCompoundsToBuy
} from './redux/selectors';
import { setSelectedDatasetScrolled } from './redux/actions';
import { v4 as uuidv4 } from 'uuid';

export const useScrollToCompound = () => {
  const dispatch = useDispatch();

  const [moleculeViewRefs, setMoleculeViewRefs] = useState({});
  const [scrollToMoleculeId, setScrollToMoleculeId] = useState(null);

  const [uuid] = useState(uuidv4());

  const isSelectedDatasetScrolled = useSelector(state => state.datasetsReducers.isSelectedDatasetScrolled);

  const ligandList = useSelector(state => getListOfSelectedLigandOfAllDatasets(state));
  const proteinList = useSelector(state => state.selectionReducers.proteinList);
  const complexList = useSelector(state => state.selectionReducers.complexList);
  const surfaceList = useSelector(state => state.selectionReducers.surfaceList);

  const proteinListDataset = useSelector(state => getListOfSelectedProteinOfAllDatasets(state));
  const complexListDataset = useSelector(state => getListOfSelectedComplexOfAllDatasets(state));
  const surfaceListDataset = useSelector(state => getListOfSelectedSurfaceOfAllDatasets(state));

  const moleculesObjectIDListOfCompoundsToBuy = useSelector(getMoleculesObjectIDListOfCompoundsToBuy);

  const isInspirationsDialogOpened = useSelector(state => state.datasetsReducers.isOpenInspirationDialog);
  const inspirationLists = useSelector(state => state.datasetsReducers.inspirationLists);
  const isItForSelectedCompoundsList = useSelector(
    state => state.datasetsReducers.inspirationsDialogOpenedForSelectedCompound
  );

  const tabValue = useSelector(state => state.datasetsReducers.tabValue);
  const rhsOpen = useSelector(state => state.previewReducers.viewerControls.sidesOpen.RHS);
  const isSelectedCompoundsTab = tabValue === 1;

  const dialogOpenedForInspirationWithId =
    isSelectedCompoundsTab && Object.keys(inspirationLists)?.length > 0
      ? inspirationLists[Object.keys(inspirationLists)]?.length > 0
        ? inspirationLists[Object.keys(inspirationLists)][0]
        : 0
      : 0;

  useEffect(() => {
    console.log(
      `${uuid} useScrollToCompound useEffect - start (rhsOpen=${rhsOpen}, isSelectedCompoundsTab=${isSelectedCompoundsTab})`
    );
    if (rhsOpen && isSelectedCompoundsTab) {
      console.log(
        `${uuid} useScrollToCompound useEffect - rhs is opened and selected compounds tab is selected (isSelectedDatasetScrolled=${isSelectedDatasetScrolled})`
      );
      if (!isSelectedDatasetScrolled) {
        console.log(
          `${uuid} useScrollToCompound useEffect - selected compounds are not scrolled yet (isInspirationsDialogOpened=${isInspirationsDialogOpened}, dialogOpenedForInspirationWithId=${dialogOpenedForInspirationWithId}, isItForSelectedCompoundsList=${isItForSelectedCompoundsList})`
        );
        if (isInspirationsDialogOpened && dialogOpenedForInspirationWithId && isItForSelectedCompoundsList) {
          console.log(`${uuid} useScrollToCompound useEffect - scrolling because inspirations dialog is opened`);
          for (let i = 0; i < moleculesObjectIDListOfCompoundsToBuy?.length; i++) {
            const molecule = moleculesObjectIDListOfCompoundsToBuy[i].molecule;

            if (molecule.id === dialogOpenedForInspirationWithId) {
              console.log(`${uuid} useScrollToCompound useEffect - found molecule to scroll to`);
              // setCurrentPage(i / moleculesPerPage + 1);
              setScrollToMoleculeId(molecule.id);
              break;
            }
          }
        } else {
          console.log(`${uuid} useScrollToCompound useEffect - scrolling because selected compounds are selected`);
          for (let i = 0; i < moleculesObjectIDListOfCompoundsToBuy?.length; i++) {
            const molecule = moleculesObjectIDListOfCompoundsToBuy[i].molecule;

            if (molecule.isCustomPdb) {
              if (
                ligandList?.includes(molecule.id) ||
                proteinListDataset?.includes(molecule.id) ||
                complexListDataset?.includes(molecule.id) ||
                surfaceListDataset?.includes(molecule.id)
              ) {
                console.log(`${uuid} useScrollToCompound useEffect - found molecule to scroll to - custom pdb`);
                // setCurrentPage(i / moleculesPerPage + 1);
                setScrollToMoleculeId(molecule.id);
                break;
              }
            } else {
              if (
                ligandList?.includes(molecule.id) ||
                proteinList?.includes(molecule.id) ||
                complexList?.includes(molecule.id) ||
                surfaceList?.includes(molecule.id)
              ) {
                console.log(
                  `${uuid} useScrollToCompound useEffect - found molecule to scroll to molecule.id: ${
                    molecule.id
                  } molecule: ${JSON.stringify(molecule)}`
                );
                // setCurrentPage(i / moleculesPerPage + 1);
                setScrollToMoleculeId(molecule.id);
                console.log(
                  `${uuid} useScrollToCompound useEffect - found molecule to scroll to - after setScrollToMoleculeId to value ${molecule.id}`
                );
                break;
              }
            }
          }
        }
        console.log(`${uuid} useScrollToCompound useEffect - end - setting selected dataset scrolled`);
        dispatch(setSelectedDatasetScrolled(true));
      }
    }
    console.log(`${uuid} useScrollToCompound useEffect - end`);
  }, [
    complexList,
    complexListDataset,
    dialogOpenedForInspirationWithId,
    dispatch,
    isInspirationsDialogOpened,
    isItForSelectedCompoundsList,
    isSelectedCompoundsTab,
    isSelectedDatasetScrolled,
    ligandList,
    moleculesObjectIDListOfCompoundsToBuy,
    proteinList,
    proteinListDataset,
    rhsOpen,
    surfaceList,
    surfaceListDataset,
    uuid
  ]);

  useEffect(() => {
    console.log(`${uuid} useScrollToCompound useEffect scrolling - scrollToMoleculeId=${scrollToMoleculeId}`);
    // console.log(
    //   `${uuid} useScrollToCompound useEffect scrolling - moleculeViewRefs=${JSON.stringify(moleculeViewRefs)}`
    // );
    if (scrollToMoleculeId !== null) {
      const node = moleculeViewRefs[scrollToMoleculeId];
      if (node) {
        setScrollToMoleculeId(null);
        if (!elementIsVisibleInViewport(node)) {
          console.log(`${uuid} useScrollToCompound useEffect scrolling - scrolling to molecule ${scrollToMoleculeId}`);
          setTimeout(() => {
            node.scrollIntoView();
          });
        } else {
          console.log(`${uuid} useScrollToCompound useEffect scrolling - node is visible - skipping scrolling`);
        }
      } else {
        console.log(`${uuid} useScrollToCompound useEffect scrolling - node is null - skipping scrolling`);
      }
    } else {
      console.log(
        `${uuid} useScrollToCompound useEffect scrolling - scrollToMoleculeId is either undefined or null or 0`
      );
    }
  }, [moleculeViewRefs, scrollToMoleculeId, uuid]);

  const elementIsVisibleInViewport = (el, partiallyVisible = false) => {
    const { top, left, bottom, right } = el.getBoundingClientRect();
    const { innerHeight, innerWidth } = window;
    return partiallyVisible
      ? ((top > 0 && top < innerHeight) || (bottom > 0 && bottom < innerHeight)) &&
          ((left > 0 && left < innerWidth) || (right > 0 && right < innerWidth))
      : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth;
  };

  const addMoleculeViewRef = useCallback((moleculeId, node) => {
    // console.log(`useScrollToCompound addMoleculeViewRef - moleculeId=${moleculeId} and node=${node ? 'yes' : 'no'}`);
    setMoleculeViewRefs(prevRefs => {
      if (prevRefs.hasOwnProperty(moleculeId) || !node) return prevRefs;
      console.log(
        `useScrollToCompound addMoleculeViewRef - adding this data moleculeId=${moleculeId} and node=${
          node ? 'yes' : 'no'
        }`
      );
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
