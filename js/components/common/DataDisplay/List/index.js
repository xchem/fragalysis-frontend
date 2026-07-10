import React, { memo } from 'react';
import { List as MaterialList } from '../../../../ui';
import { makeStyles } from '../../../../ui/styles';

const useStyles = makeStyles(theme => ({
  list: {
    backgroundColor: theme.palette.background.paper
  }
}));

export const List = memo(({ children, ...rest }) => {
  const classes = useStyles();

  return (
    <MaterialList className={classes.list} {...rest}>
      {children}
    </MaterialList>
  );
});
