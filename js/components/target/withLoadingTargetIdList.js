import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTargetProjectCombinations, loadLegacyTargetList, loadTargetList } from './redux/dispatchActions';
import { setTargetIdList } from '../../reducers/api/actions';

export const withLoadingTargetList = WrappedComponent => {
  return memo(() => {
    const dispatch = useDispatch();
    const targetIdList = useSelector(state => state.apiReducers.target_id_list);
    const projects = useSelector(state => state.targetReducers.projects);

    useEffect(() => {
      let onCancel = () => {};
      dispatch(loadTargetList(onCancel)).catch(error => {
        throw new Error(error);
      });
      // dispatch(loadLegacyTargetList());
      return () => {
        onCancel();
      };
    }, [dispatch]);

    useEffect(() => {
      if (targetIdList && targetIdList.length > 0 && projects && projects.length > 0) {
        const firstTarget = targetIdList[0];
        if (typeof firstTarget.project !== 'object') {
          const combinations = getTargetProjectCombinations(targetIdList, projects);
          const updatedTargets = combinations.map(c => c.updatedTarget);
          dispatch(setTargetIdList(updatedTargets));
        }
      }
    }, [dispatch, targetIdList, projects]);

    return <WrappedComponent />;
  });
};
