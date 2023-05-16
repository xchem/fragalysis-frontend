import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadProjectsList } from './redux/dispatchActions';
import { setProjects, setProjectsLoaded } from './redux/actions';

export const withLoadingProjects = WrappedComponent => {
  return memo(({ ...rest }) => {
    const dispatch = useDispatch();

    const projectsLoaded = useSelector(state => state.targetReducers.projectsLoaded);

    useEffect(() => {
      if (!projectsLoaded) {
        let onCancel = () => {};
        dispatch(loadProjectsList(onCancel))
          .then(resp => {
            dispatch(setProjects(resp));
            dispatch(setProjectsLoaded(true));
          })
          .catch(error => {
            throw new Error(error);
          });
        return () => {
          onCancel();
        };
      }
    }, [dispatch, projectsLoaded]);

    return <WrappedComponent {...rest} />;
  });
};
