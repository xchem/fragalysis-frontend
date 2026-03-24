/**
 * Created by abradley on 14/03/2018.
 */
import React, { memo, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { colourList } from './utils/color';
import {
  addVector,
  removeVector,
  addHitProtein,
  removeHitProtein,
  addComplex,
  removeComplex,
  addSurface,
  removeSurface,
  addDensity,
  removeDensity,
  addLigand,
  removeLigand,
  initializeMolecules,
  applyDirectSelection,
  addQuality,
  removeQuality,
  withDisabledMoleculesNglControlButtons,
  removeSelectedTypesInHitNavigator,
  selectAllHits,
  selectAllVisibleObservations,
  searchForObservations
} from './redux/dispatchActions';
import { getLHSCompoundsList, selectAllMoleculeList, selectJoinedMoleculeList } from './redux/selectors';
import {
  setFilter,
  setMolListToEdit,
  setNextXMolecules,
  setObservationsForLHSCmp,
  setOpenObservationsDialog,
  setLHSCompoundsInitialized,
  setPoseIdForObservationsDialog,
  setSearchSettingsDialogOpen,
  setLHSIsFullyRendered,
  setSelectedAllByType,
  setDeselectedAllByType,
  setTagEditorOpen,
  setIsTagGlobalEdit,
  addToastMessage
} from '../../../reducers/selection/actions';
import { initializeFilter } from '../../../reducers/selection/dispatchActions';
import { setSortDialogOpen, setSearchStringOfHitNavigator } from './redux/actions';
import { getMoleculeForId } from '../tags/redux/dispatchActions';
import { PoseList } from './poseList';
import { LHS_OBSERVATION_VIEW_CONFIG } from './observationUnifiedView/viewConfigs';
export const PoseListLHS = memo(({}) => {
  const dispatch = useDispatch();

  const nextXMolecules = useSelector(state => state.selectionReducers.nextXMolecules);
  const searchString = useSelector(state => state.previewReducers.molecule.searchStringLHS);
  const filter = useSelector(state => state.selectionReducers.filter);
  const getJoinedMoleculeList = useSelector(state => selectJoinedMoleculeList(state));
  const allMoleculesList = useSelector(state => selectAllMoleculeList(state));
  const dataAreDownloading = useSelector(state => state.apiReducers.dataAreDownloading);
  const dataAreDownloaded = useSelector(state => state.apiReducers.dataAreDownloaded);
  const errorOccuredDuringDownload = useSelector(state => state.apiReducers.errorOccuredDuringDownload);
  const proteinList = useSelector(state => state.selectionReducers.proteinList);
  const complexList = useSelector(state => state.selectionReducers.complexList);
  const fragmentDisplayList = useSelector(state => state.selectionReducers.fragmentDisplayList);
  const surfaceList = useSelector(state => state.selectionReducers.surfaceList);
  const densityList = useSelector(state => state.selectionReducers.densityList);
  const qualityList = useSelector(state => state.selectionReducers.qualityList);
  const vectorOnList = useSelector(state => state.selectionReducers.vectorOnList);
  const informationList = useSelector(state => state.selectionReducers.informationList);
  const isTagEditorOpen = useSelector(state => state.selectionReducers.tagEditorOpened);
  const molForTagEditId = useSelector(state => state.selectionReducers.molForTagEdit);
  const moleculesToEditIds = useSelector(state => state.selectionReducers.moleculesToEdit);
  const isGlobalEdit = useSelector(state => state.selectionReducers.isGlobalEdit);
  const object_selection = useSelector(state => state.selectionReducers.mol_group_selection);
  const all_mol_lists = useSelector(state => state.apiReducers.all_mol_lists);
  const directDisplay = useSelector(state => state.apiReducers.direct_access);
  const directAccessProcessed = useSelector(state => state.apiReducers.direct_access_processed);
  const tags = useSelector(state => state.apiReducers.tagList);
  const noTagsReceived = useSelector(state => state.apiReducers.noTagsReceived);
  const categories = useSelector(state => state.apiReducers.categoryList);
  const lhsDataIsLoaded = useSelector(state => state.apiReducers.lhsDataIsLoaded);
  const observationsForLHSCmp = useSelector(state => state.selectionReducers.observationsForLHSCmp);
  const lhsCompoundsList = useSelector(state => getLHSCompoundsList(state));
  const proteinsHasLoaded = useSelector(state => state.nglReducers.proteinsHasLoaded);
  const searchSettings = useSelector(state => state.selectionReducers.searchSettings);

  const handlers = useMemo(
    () => ({
      setFullyRendered: value => dispatch(setLHSIsFullyRendered(value)),
      addToastMessage: payload => dispatch(addToastMessage(payload)),
      searchForObservations: (searchTerm, observations, settings) =>
        dispatch(searchForObservations(searchTerm, observations, settings)),
      setNextXMolecules: value => dispatch(setNextXMolecules(value)),
      getMoleculeForId: moleculeId => dispatch(getMoleculeForId(moleculeId)),
      applyDirectSelection: majorViewStage => dispatch(applyDirectSelection(majorViewStage)),
      setCompoundsInitialized: value => dispatch(setLHSCompoundsInitialized(value)),
      initializeFilter: (objectSelection, joinedMolecules) =>
        dispatch(initializeFilter(objectSelection, joinedMolecules)),
      initializeMolecules: majorViewStage => dispatch(initializeMolecules(majorViewStage)),
      setFilter: filterValue => dispatch(setFilter(filterValue)),
      setObservationsForLHSCmp: observations => dispatch(setObservationsForLHSCmp(observations)),
      setOpenObservationsDialog: open => dispatch(setOpenObservationsDialog(open)),
      setPoseIdForObservationsDialog: poseId => dispatch(setPoseIdForObservationsDialog(poseId)),
      setMolListToEdit: molecules => dispatch(setMolListToEdit(molecules)),
      addLigand: (...args) => dispatch(addLigand(...args)),
      addHitProtein: (...args) => dispatch(addHitProtein(...args)),
      addComplex: (...args) => dispatch(addComplex(...args)),
      addSurface: (...args) => dispatch(addSurface(...args)),
      addQuality: (...args) => dispatch(addQuality(...args)),
      addDensity: (...args) => dispatch(addDensity(...args)),
      addVector: (...args) => dispatch(addVector(...args)),
      removeLigand: (...args) => dispatch(removeLigand(...args)),
      removeHitProtein: (...args) => dispatch(removeHitProtein(...args)),
      removeComplex: (...args) => dispatch(removeComplex(...args)),
      removeSurface: (...args) => dispatch(removeSurface(...args)),
      removeQuality: (...args) => dispatch(removeQuality(...args)),
      removeDensity: (...args) => dispatch(removeDensity(...args)),
      removeVector: (...args) => dispatch(removeVector(...args)),
      removeSelectedTypesInHitNavigator: (...args) => dispatch(removeSelectedTypesInHitNavigator(...args)),
      addNewType: (type, selectedMolecules, majorViewStage, skipTracking = false) => {
        const addType = {
          ligand: addLigand,
          protein: addHitProtein,
          complex: addComplex,
          surface: addSurface,
          quality: addQuality,
          density: addDensity,
          vector: addVector
        };

        return dispatch(
          withDisabledMoleculesNglControlButtons(
            selectedMolecules.map(molecule => molecule.id),
            type,
            async () => {
              const promises = [];
              const actionCreator = addType[type];

              if (!actionCreator) {
                return;
              }

              if (type === 'ligand') {
                selectedMolecules.forEach(molecule => {
                  promises.push(
                    dispatch(
                      actionCreator(
                        majorViewStage,
                        molecule,
                        colourList[molecule.id % colourList.length],
                        false,
                        true,
                        skipTracking
                      )
                    )
                  );
                });
              } else {
                selectedMolecules.forEach(molecule => {
                  promises.push(
                    dispatch(
                      actionCreator(majorViewStage, molecule, colourList[molecule.id % colourList.length], skipTracking)
                    )
                  );
                });
              }

              await Promise.all(promises);
            }
          )
        );
      },
      setSelectedAllByType: (type, molecules) => dispatch(setSelectedAllByType(type, molecules)),
      setDeselectedAllByType: (type, molecules) => dispatch(setDeselectedAllByType(type, molecules)),
      setSearchSettingsDialogOpen: open => dispatch(setSearchSettingsDialogOpen(open)),
      setSearchString: value => dispatch(setSearchStringOfHitNavigator(value)),
      setIsTagGlobalEdit: value => dispatch(setIsTagGlobalEdit(value)),
      setTagEditorOpen: value => dispatch(setTagEditorOpen(value)),
      setSortDialogOpen: value => dispatch(setSortDialogOpen(value)),
      selectAllHits: (allFilteredLhsCompounds, unselect) =>
        dispatch(selectAllHits(allFilteredLhsCompounds, setNextXMolecules, unselect)),
      selectAllVisibleObservations: (visibleObservations, setNextXMoleculesFn, unselect) =>
        dispatch(selectAllVisibleObservations(visibleObservations, setNextXMoleculesFn, unselect))
    }),
    [dispatch]
  );

  const instanceConfig = useMemo(
    () => ({
      selectSortDialogOpen: state => state.previewReducers.molecule.sortDialogOpen,
      selectIsObservationDialogOpen: state => state.selectionReducers.isObservationDialogOpen,
      selectSearchSettingsDialogOpen: state => state.selectionReducers.searchSettingsDialogOpen,
      selectAreLHSCompoundsInitialized: state => state.selectionReducers.areLSHCompoundsInitialized,
      tagEditorOpenActionCreator: setTagEditorOpen
    }),
    []
  );

  return (
    <PoseList
      nextXMolecules={nextXMolecules}
      searchString={searchString}
      filter={filter}
      getJoinedMoleculeList={getJoinedMoleculeList}
      allMoleculesList={allMoleculesList}
      dataAreDownloading={dataAreDownloading}
      dataAreDownloaded={dataAreDownloaded}
      errorOccuredDuringDownload={errorOccuredDuringDownload}
      proteinList={proteinList}
      complexList={complexList}
      fragmentDisplayList={fragmentDisplayList}
      surfaceList={surfaceList}
      densityList={densityList}
      qualityList={qualityList}
      vectorOnList={vectorOnList}
      informationList={informationList}
      isTagEditorOpen={isTagEditorOpen}
      molForTagEditId={molForTagEditId}
      moleculesToEditIds={moleculesToEditIds}
      isGlobalEdit={isGlobalEdit}
      object_selection={object_selection}
      all_mol_lists={all_mol_lists}
      directDisplay={directDisplay}
      directAccessProcessed={directAccessProcessed}
      tags={tags}
      noTagsReceived={noTagsReceived}
      categories={categories}
      lhsDataIsLoaded={lhsDataIsLoaded}
      observationsForLHSCmp={observationsForLHSCmp}
      lhsCompoundsList={lhsCompoundsList}
      proteinsHasLoaded={proteinsHasLoaded}
      searchSettings={searchSettings}
      viewConfig={LHS_OBSERVATION_VIEW_CONFIG}
      handlers={handlers}
      instanceConfig={instanceConfig}
    />
  );
});
