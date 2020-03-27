import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import Preview from '../../preview/Preview';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { loadSnapshotByID, loadSnapshotByProjectID } from '../redux/dispatchActions';
import { HeaderContext } from '../../header/headerContext';

export const ProjectPreview = memo(({}) => {
  const { setSnackBarTitle } = useContext(HeaderContext);
  const [canShow, setCanShow] = useState(undefined);
  const isSnapshotLoaded = useRef(undefined);
  let match = useRouteMatch();
  const dispatch = useDispatch();
  const projectId = match && match.params && match.params.projectId;
  const snapshotId = match && match.params && match.params.snapshotId;

  useEffect(() => {
    if (!snapshotId) {
      dispatch(loadSnapshotByProjectID(projectId))
        .then(response => {
          isSnapshotLoaded.current = response;
          setCanShow(true);
        })
        .catch(error => {
          console.log(error);
          throw new Error(error);
        });
    } else {
      dispatch(loadSnapshotByID(snapshotId))
        .then(response => {
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
        })
        .catch(error => {
          console.log(error);
          throw new Error(error);
        });
    }
  }, [dispatch, projectId, snapshotId]);

  if (canShow === false) {
    setSnackBarTitle('Not valid snapshot!');
  }

  return canShow === true && isSnapshotLoaded.current !== undefined ? (
    <Preview isStateLoaded={isSnapshotLoaded.current !== null} />
  ) : null;
});
