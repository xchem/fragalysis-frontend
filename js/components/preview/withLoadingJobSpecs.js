import React, { memo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getJobConfigurations } from '../projects/redux/dispatchActions';

export const withLoadingJobSpecs = WrappedComponent => {
  return memo(({ ...rest }) => {
    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(getJobConfigurations());
    }, [dispatch]);

    return <WrappedComponent {...rest} />;
  });
};
