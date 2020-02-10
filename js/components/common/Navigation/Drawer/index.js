import { Drawer as MaterialDrawer, makeStyles, IconButton, useTheme } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React, { memo, useContext } from 'react';
import { Panel } from '../../Surfaces/Panel';
import { HeaderContext } from '../../../header/headerContext';

const useStyles = makeStyles(theme => ({
  drawerPaper: {
    backgroundColor: theme.palette.background.paper,
    right: theme.spacing(1),
    bottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    zIndex: 1,
    position: 'fixed',
    overflowY: 'auto',
    minWidth: 314,
    boxShadow: [
      '0px 61px 65px -57px rgba(0,0,0,0.4)',
      '0px 74px 88px 53px rgba(0,0,0,0.34)',
      '0px 59px 96px 58px rgba(0,0,0,0.32)'
    ],
    borderRadius: theme.spacing(1) / 2
  }
}));

export const Drawer = memo(({ title, open, onClose, children, className, ...rest }) => {
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
