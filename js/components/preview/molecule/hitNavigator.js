/**
 * Created by abradley on 14/03/2018.
 */
import React, { memo } from 'react';
import { MoleculeList } from './moleculeList';

const HitNavigator = memo(({ hideProjects }) => {
  return <MoleculeList hideProjects={hideProjects} />;
});

export default HitNavigator;
