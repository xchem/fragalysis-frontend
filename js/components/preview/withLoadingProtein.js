/**
 * Created by abradley on 13/03/2018.
 */
import React, { memo, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NglContext } from '../nglView/nglProvider';
import { shouldLoadProtein } from './redux/dispatchActions';
import { useRouteMatch } from 'react-router-dom';

// is responsible for loading molecules list
export const withLoadingProtein = WrappedComponent => {
  return memo(({ isStateLoaded, ...rest }) => {
    const { nglViewList } = useContext(NglContext);
    let match = useRouteMatch();
    const dispatch = useDispatch();
    const routeProjectID = match && match.params && match.params.projectId;
    const routeSnapshotID = match && match.params && match.params.snapshotId;
    const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);
    const isLoadingCurrentSnapshot = useSelector(state => state.projectReducers.isLoadingCurrentSnapshot);

    useEffect(() => {
      dispatch(
        shouldLoadProtein({
          nglViewList,
          isStateLoaded,
          routeProjectID,
          routeSnapshotID,
          currentSnapshotID,
          isLoadingCurrentSnapshot
        })
      );
    }, [
      dispatch,
      isStateLoaded,
      nglViewList,
      routeProjectID,
      routeSnapshotID,
      currentSnapshotID,
      isLoadingCurrentSnapshot
    ]);

    return <WrappedComponent isStateLoaded={isStateLoaded} {...rest} />;
  });
};
