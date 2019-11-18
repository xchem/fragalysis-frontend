import React, { memo } from 'react';
import { ListItem as MaterialListItem, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  listItem: {
    borderColor: '#dddddd',
    borderWidth: 1,
    borderStyle: 'solid'
  }
}));

export const ListItem = memo(({ ...rest }) => {
  const classes = useStyles();

  return <MaterialListItem className={classes.listItem} {...rest} />;
});
