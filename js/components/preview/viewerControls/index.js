/**
 * Created by ricgillams on 28/06/2018.
 */

import React, { memo, useState, useContext, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../common/Inputs/Button';
import { Settings, Mouse, PersonalVideo, Undo, Redo, Restore, Lock, LockOpen } from '@material-ui/icons';
import { ButtonGroup, Grid, makeStyles, Tooltip } from '@material-ui/core';
import { SettingControls } from './settingsControls';
import DisplayControls from './displayControls/';
import { MouseControls } from './mouseControls';
import { NglContext } from '../../nglView/nglProvider';
import { turnSide } from './redux/actions';

const drawers = {
  settings: 'settings',
  display: 'display',
  mouse: 'mouse'
};

const initDrawers = { [drawers.settings]: false, [drawers.display]: false, [drawers.mouse]: false };

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing(),
    overflow: 'hidden'
  },
  button: {
    padding: theme.spacing()
  },
  nglButtons: {
    flexBasis: 0,
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    gap: theme.spacing(),
    position: 'relative'
  }
}));

export const ViewerControls = memo(() => {
  const [drawerSettings, setDrawerSettings] = useState(JSON.parse(JSON.stringify(initDrawers)));
  const classes = useStyles();
  const dispatch = useDispatch();
  const { nglViewList } = useContext(NglContext);

  const sidesOpen = useSelector(state => state.previewReducers.viewerControls.sidesOpen);

  const openDrawer = key => {
    //close all and open selected by key
    let newDrawerState = JSON.parse(JSON.stringify(initDrawers));
    newDrawerState[key] = !drawerSettings[key];
    setDrawerSettings(newDrawerState);
  };
  const closeAllDrawers = () => {
    setDrawerSettings(JSON.parse(JSON.stringify(initDrawers)));
  };

  return (
    <>
      <div className={classes.root}>
        <Tooltip title={sidesOpen.LHS ? 'Close left hand side' : 'Open left hand side'}>
          <Button
            variant={sidesOpen.LHS ? 'contained' : 'outlined'}
            size="small"
            color="primary"
            onClick={() => dispatch(turnSide('LHS', !sidesOpen.LHS))}
            className={classes.button}
          >
            LHS
          </Button>
        </Tooltip>

        <div className={classes.nglButtons}>
          <ButtonGroup variant="contained" color="primary">
            <Tooltip title="Settings controls">
              <Button
                size="small"
                color="primary"
                onClick={() => openDrawer(drawers.settings)}
                className={classes.button}
              >
                <Settings />
              </Button>
            </Tooltip>
            <Tooltip title="Display controls">
              <Button
                size="small"
                color="primary"
                onClick={() => openDrawer(drawers.display)}
                className={classes.button}
              >
                <PersonalVideo />
              </Button>
            </Tooltip>
            <Tooltip title="Mouse controls">
              <Button size="small" color="primary" onClick={() => openDrawer(drawers.mouse)} className={classes.button}>
                <Mouse />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </div>

        <Tooltip title={sidesOpen.RHS ? 'Close right hand side' : 'Open right hand side'}>
          <Button
            variant={sidesOpen.RHS ? 'contained' : 'outlined'}
            size="small"
            color="primary"
            onClick={() => dispatch(turnSide('RHS', !sidesOpen.RHS))}
            className={classes.button}
          >
            RHS
          </Button>
        </Tooltip>
      </div>
      <SettingControls open={drawerSettings[drawers.settings]} onClose={closeAllDrawers} />
      <DisplayControls open={drawerSettings[drawers.display]} onClose={closeAllDrawers} />
      <MouseControls open={drawerSettings[drawers.mouse]} onClose={closeAllDrawers} />
    </>
  );
});
