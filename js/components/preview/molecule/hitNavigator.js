/**
 * Created by abradley on 14/03/2018.
 */
import React, { memo } from 'react';
import { PoseListLHS } from './poseListLHS';
import { TooltipPathProvider } from '../../tooltip/TooltipPathContext';

const HitNavigator = memo(({}) => {
  return (
    <TooltipPathProvider path="hitnavigator">
      <PoseListLHS />
    </TooltipPathProvider>
  );
});

export default HitNavigator;
