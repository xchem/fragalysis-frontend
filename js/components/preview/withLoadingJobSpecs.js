import React, { memo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getJobConfigurationsFromServer } from '../projects/redux/dispatchActions';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { setJobList } from '../projects/redux/actions';

export const withLoadingJobSpecs = WrappedComponent => {
  return memo(({ ...rest }) => {
    const dispatch = useDispatch();

    const authenticated = DJANGO_CONTEXT['authenticated'];

    //now only authenticated users can see the job specs
    // useEffect(() => {
    //   if (authenticated) {
    //     const jobsList = dispatch(getJobConfigurationsFromServer());
    //     dispatch(setJobList(jobsList));
    //   }
    // }, [dispatch, authenticated]);

    return <WrappedComponent {...rest} />;
  });
};
