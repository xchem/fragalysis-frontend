import React, { memo, useEffect, useState } from 'react';
import { LoadingContext } from './LoadingContext';
import { LinearProgress, makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { howManyInQueueRendered, howManyInQueueRenderedDataset } from '../../reducers/ngl/utils';

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
  const [moleculesAndTagsAreLoading, setMoleculesAndTagsAreLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    const totalItemsToRender =
      toBeDisplayedListLHS.length +
      Object.keys(toBeDisplayedListRHS).reduce((acc, key) => acc + toBeDisplayedListRHS[key].length, 0);
    const shouldShowSingleItemRendering = !isSnapshotRendering && combined < totalItemsToRender;

    if (isSingleItemRendering !== shouldShowSingleItemRendering) {
      setIsSingleItemRendering(shouldShowSingleItemRendering);
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
          value={0}
        />
      )}
    </LoadingContext.Provider>
  );
});
