import React, { memo } from 'react';
import TagGridRows from './tagGridRows';

export const TagGridRowsRHS = memo(props => {
  return <TagGridRows {...props} />;
});

export default TagGridRowsRHS;
