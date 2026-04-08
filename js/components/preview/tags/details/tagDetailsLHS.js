import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { getLHSTags } from '../../../../reducers/api/selectors';
import { layoutItemNames } from '../../../../reducers/layout/constants';
import TagDetails from './tagDetails';
import { TagDetailRowLHS } from './tagDetailRowLHS';
import { TagGridRowsLHS } from './tagGridRowsLHS';

export const TagDetailsLHS = memo(({ expandHandler = null }) => {
  const preTagList = useSelector(state => getLHSTags(state));

  return (
    <TagDetails
      preTagList={preTagList}
      panelLayoutItemName={layoutItemNames.TAG_DETAILS}
      expandHandler={expandHandler}
      TagDetailRowComponent={TagDetailRowLHS}
      TagGridRowsComponent={TagGridRowsLHS}
    />
  );
});

export default TagDetailsLHS;
