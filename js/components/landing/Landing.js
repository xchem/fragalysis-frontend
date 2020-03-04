/**
 * Created by ricgillams on 21/06/2018.
 */
import { Grid } from '@material-ui/core';
import React, { memo, useEffect } from 'react';
import TargetList from '../target/targetList';
import SessionList from '../session/sessionList';
import { connect } from 'react-redux';
import * as apiActions from '../../reducers/api/actions';
import * as selectionActions from '../../reducers/selection/actions';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { resetCurrentCompoundsSettings } from '../preview/compounds/redux/actions';

const Landing = memo(({ resetSelectionState, resetTargetState, resetCurrentCompoundsSettings }) => {
  let text_div;

  if (DJANGO_CONTEXT['authenticated'] === true) {
    var entry_text = "You're logged in as " + DJANGO_CONTEXT['username'];
    text_div = <h3>{entry_text}</h3>;
  } else {
    text_div = (
      <h3>
        To view own targets login here:
        <a className="inline" href="/accounts/login">
          FedID Login
        </a>
      </h3>
    );
  }

  useEffect(() => {
    resetTargetState();
    resetSelectionState();
    resetCurrentCompoundsSettings(true);
  }, [resetTargetState, resetSelectionState, resetCurrentCompoundsSettings]);

  return (
    <Grid container spacing={2}>
      <Grid container item xs={12} sm={6} md={4} direction="column" justify="flex-start">
        <Grid item>
          <h1>Welcome to Fragalysis</h1>
          {text_div}
        </Grid>
        <Grid item>
          <p>
            <a className="inline" href="http://cs04r-sc-vserv-137.diamond.ac.uk:8089/overview/targets/">
              Target status overview
            </a>{' '}
            (only accessible within Diamond)
          </p>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TargetList key="TARGLIST" />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <SessionList />
      </Grid>
    </Grid>
  );
});

function mapStateToProps(state) {
  return {};
}
const mapDispatchToProps = {
  resetSelectionState: selectionActions.resetSelectionState,
  resetTargetState: apiActions.resetTargetState,
  resetCurrentCompoundsSettings
};

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
