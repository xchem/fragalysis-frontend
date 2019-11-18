import React, { Fragment, memo } from 'react';
import { Divider, ListItem as MaterialListItem } from '@material-ui/core';

export const ListItem = memo(({ ...rest }) => {
  return (
    <Fragment>
      <MaterialListItem {...rest} />
      <Divider />
    </Fragment>
  );
});
