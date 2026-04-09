import React, { memo } from 'react';
import TagDetailRow from './tagDetailRow';

export const TagDetailRowRHS = memo(props => {
  return <TagDetailRow {...props} side="rhs" />;
});

export default TagDetailRowRHS;
