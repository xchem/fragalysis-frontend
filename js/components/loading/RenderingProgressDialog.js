import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, LinearProgress, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { howManyInQueueRendered, howManyInQueueRenderedDataset } from '../../reducers/ngl/utils';
import { setIsNGLQueueEmpty, setIsSnapshotRendering } from '../../reducers/ngl/actions';
import { NglContext } from '../nglView/nglProvider';
import { VIEWS } from '../../constants/constants';

export const RenderingProgressDialog = () => {
  const dispatch = useDispatch();

  const [snapshotProgress, setSnapshotProgress] = useState(0);

  const isNGLQueueEmpty = useSelector(state => state.nglReducers.isNGLQueueEmpty);
  const isSnapshotRendering = useSelector(state => state.nglReducers.isSnapshotRendering) || false;
  const objectsInSnapshotToBeRendered = useSelector(state => state.nglReducers.objectsInSnapshotToBeRendered);
  const toBeDisplayedListLHS = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const toBeDisplayedListRHS = useSelector(state => state.datasetsReducers.toBeDisplayedList);
  const snapshotLoadingInProgress = useSelector(state => state.apiReducers.snapshotLoadingInProgress);

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
  const tasksSize = stage?.tasks?.count;

  useEffect(() => {
    if (stage && (isSnapshotRendering || !isNGLQueueEmpty) && tasksSize > 0) {
      console.log(`RenderingProgressDialog - going to set listener on stage tasks`);
      stage.tasks.onZeroOnce(() => {
        console.log(`RenderingProgressDialog - render queue is empty`);
        dispatch(setIsNGLQueueEmpty(true));
        // setSnapshotProgress(0);
      });
    }
  }, [dispatch, isNGLQueueEmpty, isSnapshotRendering, snapshotLoadingInProgress, stage, tasksSize]);

  useEffect(() => {
    const lhs = howManyInQueueRendered(toBeDisplayedListLHS);
    const rhs = howManyInQueueRenderedDataset(toBeDisplayedListRHS);
    const combined = lhs + rhs;

    if (combined < objectsInSnapshotToBeRendered) {
      //snapshot is still rendering
      const progress = Math.floor((combined / objectsInSnapshotToBeRendered) * 100);
      setSnapshotProgress(progress);
    } else {
      //snapshot is fully rendered
      if (isNGLQueueEmpty) {
        dispatch(setIsSnapshotRendering(false));
        setSnapshotProgress(0);
      }
    }
  }, [dispatch, isNGLQueueEmpty, objectsInSnapshotToBeRendered, toBeDisplayedListLHS, toBeDisplayedListRHS]);

  return (
    <Dialog
      open={
        (!!console.log(
          `RenderingProgressDialog - isSnapshotRendering: ${isSnapshotRendering}, isNGLQueueEmpty: ${isNGLQueueEmpty} result: ${isSnapshotRendering &&
            !isNGLQueueEmpty}`
        ) ||
          true) &&
        isSnapshotRendering &&
        !isNGLQueueEmpty
      }
      aria-labelledby="rendering-progress-dialog-title"
    >
      <DialogTitle id="rendering-progress-dialog-title">Snapshot loading progress</DialogTitle>
      <DialogContent>
        <Typography variant="body1">Loading of snapshot is in progress...</Typography>
        <LinearProgress variant="determinate" value={snapshotProgress} />
        <Typography variant="body2">{`${snapshotProgress}%`}</Typography>
      </DialogContent>
    </Dialog>
  );
};
