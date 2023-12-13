/**
 * Created by abradley on 14/03/2018.
 */
import React, { memo } from 'react';
import { MoleculeList } from './moleculeList';
import { ObservationCmpList } from './observationCmpList';

const HitNavigator = memo(({ hideProjects }) => {
  return <ObservationCmpList hideProjects={hideProjects} />;
});

export default HitNavigator;
