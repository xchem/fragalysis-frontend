import React, { memo } from 'react';
import { Divider, ListItem as MaterialListItem } from '@material-ui/core';

export const ListItem = memo(({ ...rest }) => {
  return (
    <>
      <MaterialListItem {...rest} />
      <Divider />
    </>
  );
});
