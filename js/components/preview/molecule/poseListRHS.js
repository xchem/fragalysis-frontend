/**
 * Created by abradley on 14/03/2018.
 */
import React, { memo, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 } from 'uuid';
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
  initializeRHSMolecules,
  applyDirectSelection,
  addQuality,
  removeQuality,
  withDisabledMoleculesNglControlButtons,
  removeSelectedTypesInHitNavigator,
  selectAllHits,
  selectAllVisibleObservations,
  searchForObservations
} from './redux/dispatchActions';
import { getRHSCompoundsList, selectAllMoleculeList, selectJoinedMoleculeListRHS } from './redux/selectors';
import {
  setFilter,
  setMolListToEdit,
  setNextXMolecules,
  setObservationsForLHSCmp,
  setOpenObservationsDialog,
  setRHSCompoundsInitialized,
  setPoseIdForObservationsDialog,
  setSearchSettingsDialogOpen,
  setRHSIsFullyRendered,
  setSelectedAllByType,
  setDeselectedAllByType,
  setTagEditorOpen,
  setIsTagGlobalEdit,
  setIsLHSCmpTagEdit,
  updateMoleculeInLHSObservations,
  addToastMessage
} from '../../../reducers/selection/actions';
import { initializeFilter } from '../../../reducers/selection/dispatchActions';
import { setSortDialogOpen, setSearchStringOfHitNavigator } from './redux/actions';
import { getMoleculeForId } from '../tags/redux/dispatchActions';
import { setRHSCompoundsList, updateRHSCompound } from '../../../reducers/api/actions';
import { PoseList } from './poseList';
import { RHS_OBSERVATION_VIEW_CONFIG, buildObservationViewConfig } from './observationUnifiedView/viewConfigs';

export const PoseListRHS = memo(({ expandHandler }) => {
  const dispatch = useDispatch();

  // RHS-specific dataset state
  const datasetID = useSelector(state => state.datasetsReducers.datasets[0]?.id);
  const currentMoleculeList = useSelector(state => state.datasetsReducers.moleculeLists[datasetID] || []);
  const rhsCompoundsList = useSelector(state => getRHSCompoundsList(state));

  // Shared state (same as PoseListLHS)
  const nextXMolecules = useSelector(state => state.selectionReducers.nextXMolecules);
  const searchString = useSelector(state => state.previewReducers.molecule.searchStringRHS);
  const filter = useSelector(state => state.selectionReducers.filter);
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
  const isLHSCmpTagEdit = useSelector(state => state.selectionReducers.isLHSCmpTagEdit);
  const isTagEditorForCurrentSide = !isLHSCmpTagEdit;
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
  const rhsDataIsLoaded = useSelector(state => state.apiReducers.rhsDataIsLoaded);
  const observationsForLHSCmp = useSelector(state => state.selectionReducers.observationsForLHSCmp);
  const proteinsHasLoaded = useSelector(state => state.nglReducers.proteinsHasLoaded);
  const searchSettings = useSelector(state => state.selectionReducers.searchSettings);

  // When rhs_compounds_list is empty but the dataset molecule list is not, generate virtual poses.
  // This is a fallback for when poses were not populated by loadMoleculesAndTagsNew.
  useEffect(() => {
    if (!rhsCompoundsList || rhsCompoundsList.length === 0) {
      const generatedPoses = [];
      if (currentMoleculeList?.length > 0) {
        currentMoleculeList.forEach(m => {
          const observation = allMoleculesList?.find(mol => mol.id === m.id);
          if (observation) {
            generatedPoses.push({
              id: v4(),
              display_name: m.name,
              canon_site: null,
              compound: observation.cmpd,
              main_site_observation: observation.id,
              site_observations: [observation.id],
              main_site_observation_cmpd_code: observation.cmpd_code,
              smiles: observation.smiles,
              code: observation.code,
              canonSiteConf: observation.canon_site_conf,
              canonSite: null,
              associatedObs: [{ ...observation }]
            });
          }
        });
        if (generatedPoses.length > 0) {
          dispatch(setRHSCompoundsList(generatedPoses));
        }
      }
    }
  }, [rhsCompoundsList, currentMoleculeList, allMoleculesList, dispatch]);

  // For RHS, select molecules using RHS-specific tag-filtering logic,
  // then intersect with the dataset's currentMoleculeList.
  const tagFilteredJoinedMolecules = useSelector(state => selectJoinedMoleculeListRHS(state));
  const getJoinedMoleculeList = useMemo(() => {
    if (!tagFilteredJoinedMolecules || !currentMoleculeList) return [];
    return tagFilteredJoinedMolecules.filter(mol => currentMoleculeList.some(m => m.id === mol.id));
  }, [tagFilteredJoinedMolecules, currentMoleculeList]);

  const handlers = useMemo(
    () => ({
      setFullyRendered: value => dispatch(setRHSIsFullyRendered(value)),
      addToastMessage: payload => dispatch(addToastMessage(payload)),
      searchForObservations: (searchTerm, observations, settings) =>
        dispatch(searchForObservations(searchTerm, observations, settings)),
      searchHitNavigator: (searchTerm, joinedMoleculeList, compoundsList, settings) => {
        const normalizedSearchTerm = searchTerm?.toLowerCase().trim();

        if (!normalizedSearchTerm) {
          return joinedMoleculeList;
        }

        const matchedObservationIds = new Set(
          dispatch(searchForObservations(searchTerm, joinedMoleculeList, settings)).map(observation => observation.id)
        );

        const visibleObservationIds = new Set(joinedMoleculeList.map(observation => observation.id));
        const searchBy = settings?.searchBy || {};
        const shouldMatchPoseName = searchBy.shortcode !== false;
        const shouldMatchCompoundCode = searchBy.compoundId !== false;
        const shouldMatchAliases = searchBy.aliases !== false;

        (compoundsList || []).forEach(compound => {
          const associatedObservations = compound?.associatedObs || [];
          const mainObservation =
            associatedObservations.find(observation => observation.id === compound.main_site_observation) ||
            associatedObservations[0];

          const hasVisibleObservation = associatedObservations.some(observation => visibleObservationIds.has(observation.id));
          if (!hasVisibleObservation) {
            return;
          }

          const poseNames = [compound?.code, compound?.display_name, mainObservation?.code, mainObservation?.virtual_name]
            .filter(Boolean)
            .map(value => value.toLowerCase());
          const compoundCodes = [compound?.main_site_observation_cmpd_code, mainObservation?.compound_code]
            .filter(Boolean)
            .map(value => value.toLowerCase());
          const aliases = (mainObservation?.identifiers || [])
            .map(identifier => identifier?.name)
            .filter(Boolean)
            .map(value => value.toLowerCase());

          const isMatched =
            (shouldMatchPoseName && poseNames.some(value => value.includes(normalizedSearchTerm))) ||
            (shouldMatchCompoundCode && compoundCodes.some(value => value.includes(normalizedSearchTerm))) ||
            (shouldMatchAliases && aliases.some(value => value.includes(normalizedSearchTerm)));

          if (isMatched) {
            associatedObservations.forEach(observation => {
              if (visibleObservationIds.has(observation.id)) {
                matchedObservationIds.add(observation.id);
              }
            });
          }
        });

        return joinedMoleculeList.filter(observation => matchedObservationIds.has(observation.id));
      },
      setNextXMolecules: value => dispatch(setNextXMolecules(value)),
      getMoleculeForId: moleculeId => dispatch(getMoleculeForId(moleculeId)),
      applyDirectSelection: majorViewStage => dispatch(applyDirectSelection(majorViewStage)),
      setCompoundsInitialized: value => dispatch(setRHSCompoundsInitialized(value)),
      initializeFilter: (objectSelection, joinedMolecules) =>
        dispatch(initializeFilter(objectSelection, joinedMolecules)),
      onInitialize: ({
        majorViewStage,
        target,
        joinedMoleculeLists,
        areLSHCompoundsInitialized,
        proteinsHasLoaded,
        all_mol_lists,
        lhsCompoundsList,
        directAccessProcessed,
        directDisplay,
        object_selection,
        tags,
        categories,
        noTagsReceived
      }) => {
        if (
          (proteinsHasLoaded === true || proteinsHasLoaded === null) &&
          all_mol_lists?.length > 0 &&
          (lhsCompoundsList?.length > 0 || currentMoleculeList?.length > 0)
        ) {
          if (
            !directAccessProcessed &&
            directDisplay &&
            directDisplay.molecules &&
            directDisplay.molecules.length > 0
          ) {
            dispatch(applyDirectSelection(majorViewStage));
            dispatch(setRHSCompoundsInitialized(true));
          }
          if (
            majorViewStage &&
            all_mol_lists &&
            target !== undefined &&
            !areLSHCompoundsInitialized &&
            tags &&
            tags.length > 0 &&
            categories &&
            categories.length > 0
          ) {
            dispatch(initializeFilter(object_selection, joinedMoleculeLists));
            dispatch(initializeRHSMolecules());
            dispatch(setRHSCompoundsInitialized(true));
          }
          if (
            majorViewStage &&
            all_mol_lists &&
            target !== undefined &&
            !areLSHCompoundsInitialized &&
            noTagsReceived
          ) {
            dispatch(initializeFilter(object_selection, joinedMoleculeLists));
            dispatch(initializeRHSMolecules());
            dispatch(setRHSCompoundsInitialized(true));
          }
        }
      },
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
      setSearchString: value => dispatch(setSearchStringOfHitNavigator(value, 'rhs')),
      setIsTagGlobalEdit: value => dispatch(setIsTagGlobalEdit(value)),
      setTagEditorOpen: value => dispatch(setTagEditorOpen(value)),
      setIsTagEditorForCurrentSide: () => dispatch(setIsLHSCmpTagEdit(false)),
      resetTagEditorSide: () => dispatch(setIsLHSCmpTagEdit(false)),
      updateTagEditorCompound: cmp => dispatch(updateRHSCompound(cmp)),
      updateMoleculeInTagEditorObservations: mol => dispatch(updateMoleculeInLHSObservations(mol)),
      setSortDialogOpen: value => dispatch(setSortDialogOpen(value)),
      selectAllHits: (allFilteredLhsCompounds, unselect) =>
        dispatch(selectAllHits(allFilteredLhsCompounds, setNextXMolecules, unselect)),
      selectAllVisibleObservations: (visibleObservations, setNextXMoleculesFn, unselect) =>
        dispatch(selectAllVisibleObservations(visibleObservations, setNextXMoleculesFn, unselect))
    }),
    [dispatch, currentMoleculeList]
  );

  const instanceConfig = useMemo(
    () => ({
      selectSortDialogOpen: state => state.previewReducers.molecule.sortDialogOpen,
      selectIsObservationDialogOpen: state => state.selectionReducers.isObservationDialogOpen,
      selectSearchSettingsDialogOpen: state => state.selectionReducers.searchSettingsDialogOpen,
      selectAreLHSCompoundsInitialized: state => state.selectionReducers.areRHSCompoundsInitialized,
      tagEditorOpenActionCreator: setTagEditorOpen,
      instanceSide: 'rhs'
    }),
    []
  );

  const viewConfig = useMemo(() => buildObservationViewConfig(RHS_OBSERVATION_VIEW_CONFIG), []);

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
      lhsDataIsLoaded={rhsDataIsLoaded}
      observationsForLHSCmp={observationsForLHSCmp}
      lhsCompoundsList={rhsCompoundsList || []}
      proteinsHasLoaded={proteinsHasLoaded}
      searchSettings={searchSettings}
      viewConfig={viewConfig}
      isTagEditorForCurrentSide={isTagEditorForCurrentSide}
      handlers={handlers}
      instanceConfig={instanceConfig}
      expandHandler={expandHandler}
    />
  );
});
