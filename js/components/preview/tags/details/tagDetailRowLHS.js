import React, { memo } from 'react';
import TagDetailRow from './tagDetailRow';

export const TagDetailRowLHS = memo(props => {
  return <TagDetailRow {...props} side="lhs" />;
});

export default TagDetailRowLHS;
