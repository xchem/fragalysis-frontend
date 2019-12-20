import { Drawer as MaterialDrawer, makeStyles, IconButton, useTheme } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React, { memo, useContext } from 'react';
import { Panel } from '../../Surfaces/Panel';
import { HeaderContext } from '../../../header/headerContext';

const useStyles = makeStyles(theme => ({
  list: {
    width: 250
  },
  fullList: {
    width: 'auto'
  },
  drawerPaper: {
    backgroundColor: theme.palette.background.paper,
    right: theme.spacing(1),
    bottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    outline: 0,
    zIndex: 1,
    position: 'fixed',
    overflowY: 'auto',
    minWidth: 446
  }
}));

export const Drawer = memo(({ title, open, onClose, children, ...rest }) => {
  const classes = useStyles();
  const { headerHeight } = useContext(HeaderContext);
  const theme = useTheme();
  return (
    <MaterialDrawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      PaperProps={{ className: null }}
      {...rest}
    >
      <Panel
        hasHeader
        bodyOverflow
        secondaryBackground
        title={title}
        className={classes.drawerPaper}
        style={{ height: `calc(100% - ${headerHeight}px - ${theme.spacing(2)}px)` }}
        headerActions={[
          <IconButton onClick={onClose} color="inherit">
            <Close />
          </IconButton>
        ]}
      >
        {children}
      </Panel>
    </MaterialDrawer>
  );
});
