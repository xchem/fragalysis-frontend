/**
 * Created by ricgillams on 21/06/2018.
 */
import { Grid, makeStyles } from '@material-ui/core';
import React, { memo, useEffect } from 'react';
import TargetList from '../targetList';
import SessionList from '../session/sessionList';
import { connect } from 'react-redux';
import * as apiActions from '../../reducers/api/apiActions';
import * as selectionActions from '../../reducers/selection/selectionActions';

const useStyles = makeStyles(theme => ({
  root: {
    minHeight: 'inherit',
    width: 'inherit',
    padding: 8
  },
  paddingItem: {
    padding: 8
  }
}));

const Landing = memo(({ resetSelectionState, resetTargetState }) => {
  const classes = useStyles();
  let text_div;
  // eslint-disable-next-line no-undef
  if (DJANGO_CONTEXT['authenticated'] === true) {
    // eslint-disable-next-line no-undef
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
  }, [resetTargetState, resetSelectionState]);

  return (
    <Grid container className={classes.root}>
      <Grid
        container
        item
        xs={12}
        md={6}
        lg={4}
        direction="column"
        justify="flex-start"
        className={classes.paddingItem}
      >
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
      <Grid item xs={12} md={6} lg={4} className={classes.paddingItem}>
        <TargetList key="TARGLIST" />
      </Grid>
      <Grid item xs={12} md={6} lg={4} className={classes.paddingItem}>
        <SessionList key="SESSIONLIST" />
      </Grid>
    </Grid>
  );
});

function mapStateToProps(state) {
  return {};
}
const mapDispatchToProps = {
  resetSelectionState: selectionActions.resetSelectionState,
  resetTargetState: apiActions.resetTargetState
};

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
