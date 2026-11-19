import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createPoseRowSelectionSelector } from '../../../../../reducers/selection/selectionMembership';

export const usePoseRowSelection = observations => {
  const selectRow = useMemo(createPoseRowSelectionSelector, []);
  return useSelector(state => selectRow(state, observations));
};
