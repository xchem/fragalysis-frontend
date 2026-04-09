import React, { memo } from 'react';
import TagGridRows from './tagGridRows';

export const TagGridRowsLHS = memo(props => {
  return <TagGridRows {...props} side="lhs" />;
});

export default TagGridRowsLHS;
