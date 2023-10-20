import React, { memo, useState } from 'react';
import { LoadingContext } from './LoadingContext';
import { LinearProgress, makeStyles } from '@material-ui/core';

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

  const classes = useStyles();

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
      {
        (isLoading === true || moleculesAndTagsAreLoading === true) && (
          <LinearProgress color="secondary" className={classes.loadingProgress} variant="query" />
        )
      }
    </LoadingContext.Provider>
  );
});
