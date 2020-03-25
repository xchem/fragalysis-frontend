import React, { memo, useEffect, useRef, useState } from 'react';
import Preview from '../../preview/Preview';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { loadSnapshotByProjectID } from '../redux/dispatchActions';

export const ProjectPreview = memo(({}) => {
  const [canShow, setCanShow] = useState(false);
  const snapshotID = useRef(undefined);
  let match = useRouteMatch();
  const dispatch = useDispatch();
  const projectId = match && match.params && match.params.projectId;

  useEffect(() => {
    dispatch(loadSnapshotByProjectID(projectId))
      .then(response => {
        snapshotID.current = response;
        setCanShow(true);
      })
      .catch(error => {
        console.log(error);
        throw new Error(error);
      });
  }, [dispatch, projectId]);

  return canShow === true && snapshotID.current !== undefined ? (
    <Preview isStateLoaded={snapshotID.current !== null} />
  ) : null;
});
