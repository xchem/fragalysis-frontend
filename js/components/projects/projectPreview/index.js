import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import Preview from '../../preview/Preview';
import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { loadCurrentSnapshotByID, loadSnapshotByProjectID } from '../redux/dispatchActions';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { setDownloadStructuresDialogOpen } from '../../snapshot/redux/actions';
import { ToastContext } from '../../toast';
import { LegacySnapshotModal } from '../legacySnapshotModal';
import { NglContext } from '../../nglView/nglProvider';
import { VIEWS } from '../../../constants/constants';
import { getToBeDisplayedStructures, getToBeDisplayedStructuresDataset } from '../../../reducers/ngl/utils';
import { NGL_OBJECTS } from '../../../reducers/ngl/constants';
import {
  setNglViewFromSnapshotRendered,
  setReapplyOrientation,
  setSnapshotOrientationApplied
} from '../../../reducers/ngl/actions';

export const ProjectPreview = memo(({}) => {
  const { toast } = useContext(ToastContext);
  const [canShow, setCanShow] = useState(undefined);
  const isSnapshotLoaded = useRef(undefined);
  let match = useRouteMatch();
  const dispatch = useDispatch();

  const projectId = match && match.params && match.params.projectId;
  const snapshotId = match && match.params && match.params.snapshotId;
  const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);
  const currentSessionProject = useSelector(state => state.projectReducers.currentProject);
  const isActionRestoring = false; //useSelector(state => state.trackingReducers.isActionRestoring);
  const isActionRestored = true; //useSelector(state => state.trackingReducers.isActionRestored);

  const toBeDisplayedListLHS = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const toBeDisplayedListRHS = useSelector(state => state.datasetsReducers.toBeDisplayedList);
  const displayedLigandsLHS = useSelector(state => state.selectionReducers.fragmentDisplayList);
  const displayedLigandsRHS = useSelector(state => state.datasetsReducers.ligandLists);
  const reapplyOrientation = useSelector(state => state.nglReducers.reapplyOrientation);
  const isNglViewFromSnapshotRendered = useSelector(state => state.nglReducers.nglViewFromSnapshotRendered);

  const snapshotNglOrientation = useSelector(state => {
    let result = null;
    if (state.nglReducers.snapshotNglOrientation) {
      if (state.nglReducers.snapshotNglOrientation[VIEWS.MAJOR_VIEW]) {
        result = state.nglReducers.snapshotNglOrientation[VIEWS.MAJOR_VIEW];
      }
    }
    return result;
  });

  // const reapplyOrientation = useSelector(state => state.nglReducers.reapplyOrientation);

  const [showLegacySnapshotModal, setShowLegacySnapshotModal] = useState(false);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  // useEffect(() => {
  //   if (isNglViewFromSnapshotRendered && stage && snapshotNglOrientation && snapshotNglOrientation?.elements) {
  //     stage.viewerControls.orient(snapshotNglOrientation.elements);
  //     dispatch(setSnapshotOrientationApplied(true));
  //   }
  // }, [dispatch, isNglViewFromSnapshotRendered, snapshotNglOrientation, stage]);

  useEffect(() => {
    if (
      (isNglViewFromSnapshotRendered && stage && snapshotNglOrientation && snapshotNglOrientation?.elements) ||
      reapplyOrientation
    ) {
      try {
        stage.viewerControls.orient(snapshotNglOrientation.elements);
        dispatch(setSnapshotOrientationApplied(true));
        if (reapplyOrientation) {
          dispatch(setReapplyOrientation(false));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [stage, snapshotNglOrientation, isNglViewFromSnapshotRendered, dispatch, reapplyOrientation]);

  useEffect(() => {
    if (!isNglViewFromSnapshotRendered) {
      let notYetDisplayedFound = false;

      const toBeDisplayedLigandsLHS = getToBeDisplayedStructures(
        toBeDisplayedListLHS,
        displayedLigandsLHS,
        NGL_OBJECTS.LIGAND
      );
      notYetDisplayedFound = toBeDisplayedLigandsLHS?.length > 0;

      if (!notYetDisplayedFound) {
        const toBeDisplayedLigandsRHS = getToBeDisplayedStructuresDataset(
          toBeDisplayedListRHS,
          displayedLigandsRHS,
          NGL_OBJECTS.LIGAND
        );
        notYetDisplayedFound = toBeDisplayedLigandsRHS?.length > 0;
      }

      if (!notYetDisplayedFound) {
        dispatch(setNglViewFromSnapshotRendered(true));
      }
    }
  }, [
    toBeDisplayedListLHS,
    displayedLigandsLHS,
    displayedLigandsRHS,
    dispatch,
    isNglViewFromSnapshotRendered,
    toBeDisplayedListRHS
  ]);

  useEffect(() => {
    if (!snapshotId && currentSnapshotID === null) {
      dispatch(loadSnapshotByProjectID(projectId))
        .then(response => {
          if (response !== false) {
            isSnapshotLoaded.current = response;
            // dispatch(setIsSnapshotDirty(false));
            setCanShow(true);
          }
        })
        .catch(error => {
          setCanShow(true);
          throw new Error(error);
        });
    } else {
      if (currentSnapshotID === null) {
        dispatch(loadCurrentSnapshotByID(snapshotId))
          .then(response => {
            if (response !== false) {
              if (response) {
                if (response.session_project && `${response.session_project.id}` === projectId) {
                  isSnapshotLoaded.current = response.id;
                  // dispatch(setIsSnapshotDirty(false));
                  setCanShow(true);
                } else {
                  setCanShow(false);
                  setShowLegacySnapshotModal(true);
                }
                if (response.data) {
                  const dataObj = JSON.parse(response.data);
                  if (dataObj.downloadTag) {
                    dispatch(setDownloadStructuresDialogOpen(true));
                  }
                }
              } else {
                isSnapshotLoaded.current = response;
                setCanShow(false);
                setShowLegacySnapshotModal(true);
              }
            }
          })
          .catch(error => {
            setCanShow(false);
            throw new Error(error);
          });
      } else {
        if (isActionRestoring === false && isActionRestored === false) {
          isSnapshotLoaded.current = currentSnapshotID;
          setCanShow(true);
        }
      }
    }
  }, [currentSnapshotID, dispatch, projectId, snapshotId, isActionRestoring, isActionRestored, canShow]);

  if (canShow === false) {
    toast('Not valid snapshot!');
  }

  console.log(
    `Logged in user: ${DJANGO_CONTEXT['pk']} and project author: ${currentSessionProject.authorID} and project id: ${currentSessionProject.projectID}`
  );

  return canShow === true && isSnapshotLoaded.current !== undefined ? (
    <Preview
      isSnapshot={true}
      isStateLoaded={isSnapshotLoaded.current !== null}
      hideProjects={
        DJANGO_CONTEXT['pk'] === undefined ||
        (DJANGO_CONTEXT['pk'] !== undefined &&
          (currentSessionProject.projectID === null || currentSessionProject.authorID === null))
      }
    />
  ) : (
    <LegacySnapshotModal open={showLegacySnapshotModal} project={projectId} snapshot={snapshotId} />
  );
});
