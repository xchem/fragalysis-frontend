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
    const projectId = match && match.params && match.params.projectId;
    const snapshotId = match && match.params && match.params.snapshotId;
    const currentSnapshot = useSelector(state => state.projectReducers.currentSnapshot);

    useEffect(() => {
      dispatch(shouldLoadProtein({ nglViewList, isStateLoaded, projectId, snapshotId, currentSnapshot }));
    }, [dispatch, isStateLoaded, nglViewList, projectId, snapshotId, currentSnapshot]);

    return <WrappedComponent isStateLoaded={isStateLoaded} {...rest} />;
  });
};
