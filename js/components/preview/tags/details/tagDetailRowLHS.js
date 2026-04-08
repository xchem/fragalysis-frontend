import React, { memo } from 'react';
import TagDetailRow from './tagDetailRow';

export const TagDetailRowLHS = memo(props => {
  return <TagDetailRow {...props} />;
});

export default TagDetailRowLHS;
