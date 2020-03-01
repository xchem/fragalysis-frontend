import React, { memo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadTargetList } from './redux/dispatchActions';

export const withLoadingTargetList = WrappedComponent => {
  return memo(() => {
    const dispatch = useDispatch();

    useEffect(() => {
      let onCancel = () => {};
      dispatch(loadTargetList(onCancel)).catch(error => {
        throw new Error(error);
      });
      return () => {
        onCancel();
      };
    }, [dispatch]);

    return <WrappedComponent />;
  });
};
