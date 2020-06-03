/**
 * Created by ricgillams on 28/06/2018.
 */

import React, { memo, useState } from 'react';
import { Button } from '../../common/Inputs/Button';
import { Settings, Mouse, PersonalVideo } from '@material-ui/icons';
import { ButtonGroup, Grid, makeStyles, Tooltip } from '@material-ui/core';
import { SettingControls } from './settingsControls';
import DisplayControls from './displayControls/';
import { MouseControls } from './mouseControls';

const drawers = {
  settings: 'settings',
  display: 'display',
  mouse: 'mouse'
};

const initDrawers = { [drawers.settings]: false, [drawers.display]: false, [drawers.mouse]: false };

const useStyles = makeStyles(theme => ({
  button: {
    padding: theme.spacing(1)
  }
}));

export const ViewerControls = memo(({}) => {
  const [drawerSettings, setDrawerSettings] = useState(JSON.parse(JSON.stringify(initDrawers)));
  const classes = useStyles();

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
      <Grid container justify="center">
        <Grid item>
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
        </Grid>
      </Grid>
      <SettingControls open={drawerSettings[drawers.settings]} onClose={closeAllDrawers} />
      <DisplayControls open={drawerSettings[drawers.display]} onClose={closeAllDrawers} />
      <MouseControls open={drawerSettings[drawers.mouse]} onClose={closeAllDrawers} />
    </>
  );
});
