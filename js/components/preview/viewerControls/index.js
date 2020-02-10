/**
 * Created by ricgillams on 28/06/2018.
 */

import React, { memo, useState } from 'react';
import { Button } from '../../common/Inputs/Button';
import { Settings, Mouse, PersonalVideo } from '@material-ui/icons';
import { ButtonGroup, Grid } from '@material-ui/core';
import { SettingControls } from './settingsControls';
import DisplayControls from './displayControls/';
import { MouseControls } from './mouseControls';

const drawers = {
  settings: 'settings',
  display: 'display',
  mouse: 'mouse'
};

const initDrawers = { [drawers.settings]: false, [drawers.display]: false, [drawers.mouse]: false };

export const ViewerControls = memo(({}) => {
  const [drawerSettings, setDrawerSettings] = useState(JSON.parse(JSON.stringify(initDrawers)));

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
            <Button color="primary" onClick={() => openDrawer(drawers.settings)} startIcon={<Settings />}>
              Settings
            </Button>
            <Button color="primary" onClick={() => openDrawer(drawers.display)} startIcon={<PersonalVideo />}>
              Display
            </Button>
            <Button color="primary" onClick={() => openDrawer(drawers.mouse)} startIcon={<Mouse />}>
              Mouse
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
      <SettingControls open={drawerSettings[drawers.settings]} onClose={closeAllDrawers} />
      <DisplayControls open={drawerSettings[drawers.display]} onClose={closeAllDrawers} />
      <MouseControls open={drawerSettings[drawers.mouse]} onClose={closeAllDrawers} />
    </>
  );
});
