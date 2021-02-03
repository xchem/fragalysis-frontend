import React from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { makeStyles } from '@material-ui/core';
import { useDispatch } from 'react-redux';

const useStyles = makeStyles(theme => ({
  dropDown: {
    width: 90
  }
}));
export const DatasetSelectorMenuButton = ({
  anchorRef,
  open,
  setOpen,
  customDatasets,
  selectedDatasetIndex,
  setSelectedDatasetIndex
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const handleMenuItemClick = (event, index) => {
    dispatch(setSelectedDatasetIndex(index));
    setOpen(false);
    event.stopPropagation();
  };

  const handleClose = event => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition>
      {({ TransitionProps, placement }) => (
        <Grow
          {...TransitionProps}
          style={{
            transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom'
          }}
        >
          <Paper className={classes.paper}>
            <ClickAwayListener onClickAway={handleClose}>
              <MenuList id="split-button-menu" className={classes.menu}>
                {customDatasets?.map((dataset, index) => (
                  <MenuItem
                    key={index}
                    selected={index === selectedDatasetIndex}
                    onClick={event => handleMenuItemClick(event, index)}
                  >
                    {dataset.title}
                  </MenuItem>
                ))}
              </MenuList>
            </ClickAwayListener>
          </Paper>
        </Grow>
      )}
    </Popper>
  );
};
