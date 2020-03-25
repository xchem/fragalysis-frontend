/**
 * Created by abradley on 13/03/2018.
 */
import React, { memo, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
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

    useEffect(() => {
      dispatch(shouldLoadProtein(nglViewList, isStateLoaded, projectId));
    }, [dispatch, isStateLoaded, nglViewList, projectId]);

    return <WrappedComponent isStateLoaded={isStateLoaded} {...rest} />;
  });
};
