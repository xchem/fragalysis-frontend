import React, { memo } from 'react';
import { Divider, ListItem as MaterialListItem } from '../../../../ui';

export const ListItem = memo(({ ...rest }) => {
  return (
    <>
      <MaterialListItem {...rest} />
      <Divider />
    </>
  );
});
