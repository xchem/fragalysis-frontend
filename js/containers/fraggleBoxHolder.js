/**
 * Created by ricgillams in 25/06/2018.
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Grid, withStyles } from '@material-ui/core';
import MolGroupList from '../hoc/withLoadingMolGroupList';
import MoleculeList from '../components/moleculeList';
import MolGroupSelector from '../components/molGroupSelector';
import SummaryView from '../components/summaryView';
import CompoundList from '../components/compoundList';
import NGLView from '../components/nglComponents';
import NglViewerControls from '../components/nglViewerControls';
import { withRouter } from 'react-router-dom';
import * as apiActions from '../actions/apiActions';
import * as nglLoadActions from '../actions/nglLoadActions';
import ModalTargetUnrecognised from '../components/modalTargetUnrecognised';
import ModalLoadingScreen from '../components/modalLoadingScreen';
import ModalStateSave from '../components/modalStateSave';
import ModalErrorMessage from '../components/modalErrorDisplay';
import HotspotList from '../components/hotspotList';
import BrowserBomb from '../components/browserBombModal';

const styles = () => ({
  gridItemLhs: {
    width: '500px'
  },
  gridItemRhs: {
    width: 'calc(100% - 500px)'
  },
  fullWidth: {
    width: '100%'
  }
});

class FraggleBox extends PureComponent {
  componentDidMount() {
    if (this.props.match.params.uuid !== undefined) {
      var uuid = this.props.match.params.uuid;
      this.props.setUuid(uuid);
      this.props.setLatestSession(uuid);
    } else if (this.props.match.params.snapshotUuid !== undefined) {
      var snapshotUuid = this.props.match.params.snapshotUuid;
      this.props.setUuid(snapshotUuid);
    }
  }

  render() {
    const { classes } = this.props;
    var screenHeight = window.innerHeight * (0.7).toString() + 'px';
    var molListHeight = window.innerHeight * (0.45).toString() + 'px';
    return (
      <Grid container spacing={2}>
        <Grid item container direction="column" alignItems="stretch" spacing={2} className={classes.gridItemLhs}>
          <Grid item className={classes.fullWidth}>
            <MolGroupSelector />
          </Grid>
          <Grid item>
            <MoleculeList height={molListHeight} />
          </Grid>
        </Grid>
        <Grid item container className={classes.gridItemRhs} spacing={2}>
          <Grid item lg={6} md={12}>
            <NGLView div_id="major_view" height={screenHeight} />
            <NglViewerControls />
          </Grid>
          <Grid item lg={6} md={12}>
            <SummaryView />
            <CompoundList />
            <HotspotList />
          </Grid>
        </Grid>
        <ModalStateSave />
        <ModalErrorMessage />
        <ModalTargetUnrecognised />
        <ModalLoadingScreen />
        <BrowserBomb />
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {
    targetOnName: state.apiReducers.present.target_on_name,
    targetIdList: state.apiReducers.present.target_id_list,
    targetUnrecognised: state.apiReducers.present.targetUnrecognised
  };
}
const mapDispatchToProps = {
  setUuid: apiActions.setUuid,
  setLatestSession: apiActions.setLatestSession,
  setTargetUnrecognised: apiActions.setTargetUnrecognised,
  setLoadingState: nglLoadActions.setLoadingState
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(FraggleBox))
);
