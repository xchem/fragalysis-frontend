import React, { memo } from 'react';
import { useSelector } from 'react-redux';
import { getRHSTags } from '../../../../reducers/api/selectors';
import { layoutItemNames } from '../../../../reducers/layout/constants';
import TagDetails from './tagDetails';
import { TagDetailRowRHS } from './tagDetailRowRHS';
import { TagGridRowsRHS } from './tagGridRowsRHS';

export const TagDetailsRHS = memo(({ expandHandler = null }) => {
  const preTagList = useSelector(state => getRHSTags(state));

  return (
    <TagDetails
      preTagList={preTagList}
      panelLayoutItemName={layoutItemNames.RHS_TAG_DETAILS}
      expandHandler={expandHandler}
      TagDetailRowComponent={TagDetailRowRHS}
      TagGridRowsComponent={TagGridRowsRHS}
    />
  );
});

export default TagDetailsRHS;
