/**
 * Created by ricgillams on 28/06/2018.
 */

import React, { memo, Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { Button } from '../../common/Inputs/Button';
import { Panel } from '../../common';
import { Settings, Mouse, PersonalVideo } from '@material-ui/icons';
import { Grid } from '@material-ui/core';
import { SettingControls } from './settingsControls';
import { DisplayControls } from './displayControls';
import { MouseControls } from './mouseControls';

const drawers = {
  settings: 'settings',
  display: 'display',
  mouse: 'mouse'
};

const initDrawers = { [drawers.settings]: false, [drawers.display]: false, [drawers.mouse]: false };

const Index = memo(({}) => {
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
    <Fragment>
      <Panel hasHeader title="Viewer controls">
        <Grid container justify="space-between" direction="row">
          <Grid item>
            <Button color="primary" onClick={() => openDrawer(drawers.settings)} startIcon={<Settings />}>
              Settings
            </Button>
          </Grid>
          <Grid item>
            <Button color="primary" onClick={() => openDrawer(drawers.display)} startIcon={<PersonalVideo />}>
              Display controls
            </Button>
          </Grid>
          <Grid item>
            <Button color="primary" onClick={() => openDrawer(drawers.mouse)} startIcon={<Mouse />}>
              Mouse controls
            </Button>
          </Grid>
        </Grid>
      </Panel>
      <SettingControls open={drawerSettings[drawers.settings]} onClose={closeAllDrawers} />
      <DisplayControls open={drawerSettings[drawers.display]} onClose={closeAllDrawers} />
      <MouseControls open={drawerSettings[drawers.mouse]} onClose={closeAllDrawers} />
    </Fragment>
  );
});

function mapStateToProps(state) {
  return {
    nglProtStyle: state.nglReducers.present.nglProtStyle
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
