import React, { memo } from 'react';
import TagGridRows from './tagGridRows';

export const TagGridRowsLHS = memo(props => {
  return <TagGridRows {...props} />;
});

export default TagGridRowsLHS;
