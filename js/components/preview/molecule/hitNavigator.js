/**
 * Created by abradley on 14/03/2018.
 */
import React, { memo } from 'react';
import { ObservationCmpList } from './observationCmpList';
import { TooltipPathProvider } from '../../tooltip/TooltipPathContext';

const HitNavigator = memo(({}) => {
  return (
    <TooltipPathProvider path="hitnavigator">
      <ObservationCmpList />
    </TooltipPathProvider>
  );
});

export default HitNavigator;
