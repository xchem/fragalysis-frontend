import React, { useState, useEffect, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, LinearProgress, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setIsNGLQueueEmpty, setIsSnapshotRendering } from '../../reducers/ngl/actions';
import { NglContext } from '../nglView/nglProvider';
import { VIEWS } from '../../constants/constants';

const countRenderableItems = items => (items || []).filter(item => item?.display !== false).length;

const countRenderableItemsDataset = datasetsToBeDisplayed =>
  Object.values(datasetsToBeDisplayed || {}).reduce((count, items) => count + countRenderableItems(items), 0);

const countRenderedRenderableItems = items =>
  (items || []).filter(item => item?.display !== false && item?.rendered).length;

const countRenderedRenderableItemsDataset = datasetsToBeDisplayed =>
  Object.values(datasetsToBeDisplayed || {}).reduce((count, items) => count + countRenderedRenderableItems(items), 0);

export const RenderingProgressDialog = () => {
  const dispatch = useDispatch();

  const [snapshotProgress, setSnapshotProgress] = useState(0);

  const isNGLQueueEmpty = useSelector(state => state.nglReducers.isNGLQueueEmpty);
  const isSnapshotRendering = useSelector(state => state.nglReducers.isSnapshotRendering) || false;
  const toBeDisplayedListLHS = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const toBeDisplayedListRHS = useSelector(state => state.datasetsReducers.toBeDisplayedList);
  const lhsIsFullyRendered = useSelector(state => state.selectionReducers.lhsIsFullyRendered);
  const dataAreDownloading = useSelector(state => state.apiReducers.dataAreDownloading);
  const snapshotLoadingInProgress = useSelector(state => state.apiReducers.snapshotLoadingInProgress);
  const shouldPrioritizeUiRenderingDialog = dataAreDownloading || !lhsIsFullyRendered || snapshotLoadingInProgress;

  const { getViewerAdapter } = useContext(NglContext);
  const viewerAdapter = getViewerAdapter(VIEWS.MAJOR_VIEW);
  const tasksSize = viewerAdapter?.getTaskCount();

  useEffect(() => {
    if (viewerAdapter && (isSnapshotRendering || !isNGLQueueEmpty) && tasksSize > 0) {
      console.log(`RenderingProgressDialog - going to set listener on stage tasks`);
      viewerAdapter.onTasksComplete(() => {
        console.log(`RenderingProgressDialog - render queue is empty`);
        dispatch(setIsNGLQueueEmpty(true));
        // setSnapshotProgress(0);
      });
    }
  }, [dispatch, isNGLQueueEmpty, isSnapshotRendering, snapshotLoadingInProgress, viewerAdapter, tasksSize]);

  useEffect(() => {
    const lhs = countRenderedRenderableItems(toBeDisplayedListLHS);
    const rhs = countRenderedRenderableItemsDataset(toBeDisplayedListRHS);
    const combined = lhs + rhs;
    const totalItemsToRender =
      countRenderableItems(toBeDisplayedListLHS) + countRenderableItemsDataset(toBeDisplayedListRHS);

    if (totalItemsToRender === 0) {
      if (isSnapshotRendering) {
        dispatch(setIsNGLQueueEmpty(true));
        dispatch(setIsSnapshotRendering(false));
      }
      setSnapshotProgress(0);
      return;
    }

    if (combined < totalItemsToRender) {
      //snapshot is still rendering
      const progress = Math.floor((combined / totalItemsToRender) * 100);
      setSnapshotProgress(progress);
    } else {
      //snapshot is fully rendered
      if (!isNGLQueueEmpty) {
        dispatch(setIsNGLQueueEmpty(true));
      }
      if (isSnapshotRendering) {
        dispatch(setIsSnapshotRendering(false));
      }
      setSnapshotProgress(0);
    }
  }, [dispatch, isNGLQueueEmpty, isSnapshotRendering, toBeDisplayedListLHS, toBeDisplayedListRHS]);

  return (
    <Dialog
      open={isSnapshotRendering && !isNGLQueueEmpty && !shouldPrioritizeUiRenderingDialog}
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
