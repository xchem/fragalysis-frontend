import { useStructureOperationQueue } from './useStructureOperationQueue';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NGL_OBJECTS } from './constants';
import {
  appendFragmentDisplayList,
  appendQualityList,
  removeFromFragmentDisplayList,
  removeFromQualityList,
  removeFromToBeDisplayedList,
  updateInToBeDisplayedList
} from '../selection/actions';
import { generateMoleculeId, generateMoleculeObject } from '../../components/nglView/generatingObjects';
import { VIEWS } from '../../constants/constants';
import { NglContext } from '../../components/nglView/nglProvider';
import { getRandomColor } from '../../components/preview/molecule/utils/color';
import { readQualityInformation } from '../../viewer/qualityInformation';
import { deleteObject, loadObject } from './dispatchActions';
import { removeVector } from '../../components/preview/molecule/redux/dispatchActions';
import { getToBeDisplayedStructures } from './utils';
import { setNglOrientation } from './actions';
import { isBulkLigand } from './bulkLigands';
import { LHS_BULK_LIGAND_CONCURRENCY } from '../../config/viewer';

export const useDisplayLigandLHS = () => {
  const dispatch = useDispatch();
  const runStructureOperation = useStructureOperationQueue();
  const bulkLoading = useRef(new Map());
  const mounted = useRef(false);
  const [bulkLoadVersion, setBulkLoadVersion] = useState(0);

  useEffect(() => {
    mounted.current = true;
    const activeLoads = bulkLoading.current;
    return () => {
      mounted.current = false;
      activeLoads.forEach((timer, id) => {
        if (timer !== null) {
          clearTimeout(timer);
          activeLoads.delete(id);
        }
      });
    };
  }, []);

  const toBeDisplayedList = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const displayedLigands = useSelector(state => state.selectionReducers.fragmentDisplayList);
  const allObservations = useSelector(state => state.apiReducers.all_mol_lists);

  const { getNglView, getViewerAdapter } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
  const viewerAdapter = getViewerAdapter(VIEWS.MAJOR_VIEW);

  // const isLoadingCurrentSnapshot = useSelector(state => state.projectReducers.isLoadingCurrentSnapshot);

  const displayLigand = useCallback(
    async ligandData => {
      const data = allObservations.find(obs => obs.id === ligandData.id);
      if (!data) return;
      const colourToggle = getRandomColor(data);
      const molId = generateMoleculeId(data);

      try {
        let moleculeObject = await dispatch(generateMoleculeObject(data, colourToggle));
        let qualityInformation = dispatch(readQualityInformation(moleculeObject.name, moleculeObject.sdf_info));

        let hasAdditionalInformation =
          ligandData.withQuality === true &&
          qualityInformation &&
          qualityInformation.badids &&
          qualityInformation.badids.length !== 0;
        dispatch(appendFragmentDisplayList(molId));
        if (hasAdditionalInformation) {
          dispatch(appendQualityList(molId));
        }

        await dispatch(
          loadObject({
            target: Object.assign({ display_div: VIEWS.MAJOR_VIEW }, moleculeObject),
            stage,
            previousRepresentations: ligandData.representations,
            loadQuality: hasAdditionalInformation,
            quality: qualityInformation,
            center: ligandData.center
          })
        );
        if (ligandData.center) {
          const currentOrientation = viewerAdapter.getOrientation();
          dispatch(setNglOrientation(currentOrientation, VIEWS.MAJOR_VIEW));
        }
        dispatch(updateInToBeDisplayedList({ id: data.id, rendered: true, type: NGL_OBJECTS.LIGAND }));
      } catch (error) {
        dispatch(removeFromFragmentDisplayList(molId));
        dispatch(removeFromQualityList(molId));
        dispatch(removeFromToBeDisplayedList({ id: data.id, type: NGL_OBJECTS.LIGAND }));
        throw error;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allObservations, dispatch, stage, viewerAdapter] //skipOrientationChange and isLoadingCurrentSnapshot are not included in the dependencies by desing
  );

  const removeLigand = useCallback(
    async ligandData => {
      const data = allObservations.find(obs => obs.id === ligandData.id);
      if (!data) return;
      // A bulk ligand may be deselected before it starts downloading. Deletion
      // needs only its name and must still await any native load/disposal by name.
      await dispatch(
        deleteObject(
          { display_div: VIEWS.MAJOR_VIEW, name: `${generateMoleculeId(data).name}_${NGL_OBJECTS.LIGAND}` },
          stage
        )
      );
      dispatch(removeFromFragmentDisplayList(generateMoleculeId(data)));
      dispatch(removeFromQualityList(generateMoleculeId(data)));
      if (ligandData.withVector === true) {
        // remove vector
        dispatch(removeVector(stage, data));
      }

      dispatch(removeFromToBeDisplayedList({ id: ligandData.id, type: NGL_OBJECTS.LIGAND }));
    },
    [allObservations, dispatch, stage]
  );

  useEffect(() => {
    const toBeRemovedLigands = getToBeDisplayedStructures(
      toBeDisplayedList,
      displayedLigands,
      NGL_OBJECTS.LIGAND,
      true
    );
    toBeRemovedLigands?.forEach(data => {
      runStructureOperation(data, removeLigand);
    });
    const toBeDisplayedLigands = getToBeDisplayedStructures(toBeDisplayedList, displayedLigands, NGL_OBJECTS.LIGAND);
    toBeDisplayedLigands?.forEach(data => {
      if (!isBulkLigand(data)) {
        runStructureOperation(data, displayLigand);
        return;
      }
      if (
        bulkLoading.current.has(data.id) ||
        bulkLoading.current.size >= LHS_BULK_LIGAND_CONCURRENCY ||
        !allObservations.some(observation => observation.id === data.id)
      ) {
        return;
      }

      // Hold a pool slot through coordinate fetching and native ready. Claim by
      // observation ID so repeated effects/duplicate intents cannot spend slots.
      // Leave waiting intents in Redux so deselection/snapshot replacement takes
      // effect before they start, without retaining stale loading callbacks.
      bulkLoading.current.set(data.id, null);
      const resume = () => {
        if (!mounted.current) return;
        // Yield a browser task even when coordinates/native work were cached.
        const timer = setTimeout(() => {
          bulkLoading.current.delete(data.id);
          setBulkLoadVersion(version => version + 1);
        }, 0);
        bulkLoading.current.set(data.id, timer);
      };
      runStructureOperation(data, displayLigand).then(resume, resume);
    });
  }, [
    runStructureOperation,
    toBeDisplayedList,
    displayedLigands,
    displayLigand,
    dispatch,
    stage,
    removeLigand,
    allObservations,
    bulkLoadVersion
  ]);

  return {};
};
