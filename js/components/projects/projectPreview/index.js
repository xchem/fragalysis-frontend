import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import Preview from '../../preview/Preview';
import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { loadCurrentSnapshotByID, loadSnapshotByProjectID } from '../redux/dispatchActions';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { restoreCurrentActionsList } from '../../../reducers/tracking/dispatchActions';
import { setIsSnapshotDirty } from '../../../reducers/tracking/actions';
import { setDownloadStructuresDialogOpen } from '../../snapshot/redux/actions';
import { ToastContext } from '../../toast';
import { LegacySnapshotModal } from '../legacySnapshotModal';

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
  const isActionRestoring = useSelector(state => state.trackingReducers.isActionRestoring);
  const isActionRestored = useSelector(state => state.trackingReducers.isActionRestored);

  const [showLegacySnapshotModal, setShowLegacySnapshotModal] = useState(false);

  useEffect(() => {
    if (!snapshotId && currentSnapshotID === null) {
      dispatch(loadSnapshotByProjectID(projectId))
        .then(response => {
          if (response !== false) {
            isSnapshotLoaded.current = response;
            dispatch(setIsSnapshotDirty(false));
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
                  dispatch(setIsSnapshotDirty(false));
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
          let snapshotID = currentSnapshotID;
          isSnapshotLoaded.current = currentSnapshotID;
          setCanShow(true);

          dispatch(restoreCurrentActionsList(snapshotID));
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
