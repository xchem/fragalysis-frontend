import React, { memo, useEffect, useRef, useState } from 'react';
import Preview from '../../preview/Preview';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { loadSnapshotByID, loadSnapshotByProjectID } from '../redux/dispatchActions';

export const ProjectPreview = memo(({}) => {
  const [canShow, setCanShow] = useState(false);
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
          isSnapshotLoaded.current = response;
          setCanShow(true);
        })
        .catch(error => {
          console.log(error);
          throw new Error(error);
        });
    }
  }, [dispatch, projectId, snapshotId]);

  return canShow === true && isSnapshotLoaded.current !== undefined ? (
    <Preview isStateLoaded={isSnapshotLoaded.current !== null} />
  ) : null;
});
