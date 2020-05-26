/**
 * Created by abradley on 14/03/2018.
 */
import React, { memo } from 'react';
import { MoleculeList } from './moleculeList';

const HitNavigator = memo(({ height, setFilterItemsHeight, filterItemsHeight, hideProjects }) => {
  return (
    <MoleculeList
      height={height}
      setFilterItemsHeight={setFilterItemsHeight}
      filterItemsHeight={filterItemsHeight}
      hideProjects={hideProjects}
    />
  );
});

export default HitNavigator;
