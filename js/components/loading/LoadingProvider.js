import React, { memo, useEffect, useState } from 'react';
import { LoadingContext } from './LoadingContext';
import { LinearProgress, makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { howManyInQueueRendered, howManyInQueueRenderedDataset } from '../../reducers/ngl/utils';
import { setIsSnapshot } from '../../reducers/api/actions';
import { setIsSnapshotRendering, setNglViewFromSnapshotRendered } from '../../reducers/ngl/actions';

const useStyles = makeStyles(theme => ({
  loadingProgress: {
    position: 'absolute',
    zIndex: 1200,
    top: '43px', // headerHeight?
    width: '100%',
    height: 3
  }
}));

export const LoadingProvider = memo(props => {
  const dispatch = useDispatch();
  const [moleculesAndTagsAreLoading, setMoleculesAndTagsAreLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snapshotProgress, setSnapshotProgress] = useState(0);

  const isSnapshotRendering = useSelector(state => state.nglReducers.isSnapshotRendering);
  const objectsInSnapshotToBeRendered = useSelector(state => state.nglReducers.objectsInSnapshotToBeRendered);
  const toBeDisplayedListLHS = useSelector(state => state.selectionReducers.toBeDisplayedList);
  const toBeDisplayedListRHS = useSelector(state => state.datasetsReducers.toBeDisplayedList);

  const [isSingleItemRendering, setIsSingleItemRendering] = useState(false);

  const classes = useStyles();

  useEffect(() => {
    const lhs = howManyInQueueRendered(toBeDisplayedListLHS);
    const rhs = howManyInQueueRenderedDataset(toBeDisplayedListRHS);
    const combined = lhs + rhs;

    if (
      !isSnapshotRendering &&
      !isSingleItemRendering &&
      combined <
        toBeDisplayedListLHS.length +
          Object.keys(toBeDisplayedListRHS).reduce((acc, key) => acc + toBeDisplayedListRHS[key].length, 0)
    ) {
      setIsSingleItemRendering(true);
    } else if (!isSnapshotRendering && isSingleItemRendering) {
      setIsSingleItemRendering(false);
    } else {
      // if (combined < objectsInSnapshotToBeRendered) {
      //   //snapshot is still rendering
      //   const progress = Math.floor((combined / objectsInSnapshotToBeRendered) * 100);
      //   setSnapshotProgress(progress);
      // } else {
      //   //snapshot is fully rendered
      //   setSnapshotProgress(100);
      //   dispatch(setIsSnapshotRendering(false));
      //   // dispatch(setNglViewFromSnapshotRendered(true));
      // }
    }
  }, [
    toBeDisplayedListLHS,
    toBeDisplayedListRHS,
    dispatch,
    objectsInSnapshotToBeRendered,
    isSnapshotRendering,
    isSingleItemRendering
  ]);

  return (
    <LoadingContext.Provider
      value={{
        moleculesAndTagsAreLoading,
        setMoleculesAndTagsAreLoading,
        isLoading,
        setIsLoading
      }}
    >
      {props.children}
      {(isLoading === true || moleculesAndTagsAreLoading === true || isSingleItemRendering) && (
        <LinearProgress color="secondary" className={classes.loadingProgress} variant="query" />
      )}
      {false && isSnapshotRendering && (
        <LinearProgress
          variant="determinate"
          color="secondary"
          className={classes.loadingProgress}
          value={snapshotProgress}
        />
      )}
    </LoadingContext.Provider>
  );
});
