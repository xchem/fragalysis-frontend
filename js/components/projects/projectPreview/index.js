import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import Preview from '../../preview/Preview';
import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { loadCurrentSnapshotByID, loadSnapshotByProjectID } from '../redux/dispatchActions';
import { HeaderContext } from '../../header/headerContext';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';

export const ProjectPreview = memo(({}) => {
  const { setSnackBarTitle } = useContext(HeaderContext);
  const [canShow, setCanShow] = useState(undefined);
  const isSnapshotLoaded = useRef(undefined);
  let match = useRouteMatch();
  const dispatch = useDispatch();
  const projectId = match && match.params && match.params.projectId;
  const snapshotId = match && match.params && match.params.snapshotId;
  const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);
  const currentProject = useSelector(state => state.projectReducers.currentProject);

  useEffect(() => {
    if (!snapshotId && currentSnapshotID === null) {
      dispatch(loadSnapshotByProjectID(projectId))
        .then(response => {
          if (response !== false) {
            isSnapshotLoaded.current = response;
            setCanShow(true);
          }
        })
        .catch(error => {
          setCanShow(true);
          throw new Error(error);
        });
    } else {
      dispatch(loadCurrentSnapshotByID(snapshotId || currentSnapshotID))
        .then(response => {
          if (response !== false) {
            if (response) {
              if (response.session_project && `${response.session_project.id}` === projectId) {
                isSnapshotLoaded.current = response.id;
                setCanShow(true);
              } else {
                setCanShow(false);
              }
            } else {
              isSnapshotLoaded.current = response;
              setCanShow(false);
            }
          }
        })
        .catch(error => {
          setCanShow(false);
          throw new Error(error);
        });
    }
  }, [currentSnapshotID, dispatch, projectId, snapshotId]);

  if (canShow === false) {
    setSnackBarTitle('Not valid snapshot!');
  }

  return canShow === true && isSnapshotLoaded.current !== undefined ? (
    <Preview
      isStateLoaded={isSnapshotLoaded.current !== null}
      hideProjects={currentProject.projectID === null || currentProject.authorID === null}
    />
  ) : null;
});
