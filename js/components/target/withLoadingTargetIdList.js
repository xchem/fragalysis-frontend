import React, { memo, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { loadTargetList } from './redux/dispatchActions';

export const withLoadingTargetList = WrappedComponent => {
  return memo(() => {
    const [state, setState] = useState();
    const dispatch = useDispatch();

    useEffect(() => {
      let onCancel = () => {};
      dispatch(loadTargetList(onCancel)).catch(error => {
        setState(() => {
          throw error;
        });
      });
      return () => {
        onCancel();
      };
    }, [dispatch]);

    return <WrappedComponent />;
  });
};
