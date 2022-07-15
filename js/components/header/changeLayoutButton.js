import React, { useState } from 'react';
import { Button, makeStyles, MenuItem, Paper, Popover, Select, Tooltip } from '@material-ui/core';
import { Layers } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { layouts } from '../../reducers/layout/layouts';
import { setSelectedLayoutName } from '../../reducers/layout/actions';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing()
  },
  select: {
    minWidth: 160
  }
}));

export const ChangeLayoutButton = () => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const selectedLayoutName = useSelector(state => state.layoutReducers.selectedLayoutName);

  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <Tooltip title="Change layout">
        <Button variant="contained" onClick={e => setAnchorEl(e.currentTarget)}>
          <Layers />
        </Button>
      </Tooltip>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <Paper className={classes.root}>
          <Select
            className={classes.select}
            value={selectedLayoutName}
            onChange={e => dispatch(setSelectedLayoutName(e.target.value))}
          >
            {Object.keys(layouts).map(layoutName => (
              <MenuItem key={layoutName} value={layoutName}>
                {layoutName}
              </MenuItem>
            ))}
          </Select>
        </Paper>
      </Popover>
    </>
  );
};
