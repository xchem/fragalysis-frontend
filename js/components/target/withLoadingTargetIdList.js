import React, { memo, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadTargetList } from './redux/dispatchActions';
import { HeaderContext } from '../header/headerContext';

export const withLoadingTargetList = WrappedComponent => {
  return memo(() => {
    const { setError } = useContext(HeaderContext);
    const dispatch = useDispatch();

    useEffect(() => {
      let onCancel = () => {};
      dispatch(loadTargetList(onCancel)).catch(error => {
        setError(error);
      });
      return () => {
        onCancel();
      };
    }, [dispatch, setError]);

    return <WrappedComponent />;
  });
};
