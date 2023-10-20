/**
 * Created by ricgillams on 21/06/2018.
 */
import { Grid, Link, makeStyles } from '@material-ui/core';
import React, { memo, useContext, useEffect, useState } from 'react';
import { TargetList } from '../target/targetList';
import { connect } from 'react-redux';
import * as apiActions from '../../reducers/api/actions';
import * as selectionActions from '../../reducers/selection/actions';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { Projects } from '../projects';
import { resetCurrentCompoundsSettings } from '../preview/compounds/redux/actions';
import { resetProjectsReducer } from '../projects/redux/actions';
import { withLoadingProjects } from '../target/withLoadingProjects';
import { ToastContext } from '../toast';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    gap: theme.spacing(2),
    flexWrap: 'nowrap',
    padding: theme.spacing()
  }
}));

const Landing = memo(
  ({ resetSelectionState, resetTargetState, resetCurrentCompoundsSettings, resetProjectsReducer }) => {
    const classes = useStyles();

    const { toast } = useContext(ToastContext);
    const [loginText, setLoginText] = useState(DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN' ? '' : "You're logged in as " + DJANGO_CONTEXT['username']);

    useEffect(() => {
      if (DJANGO_CONTEXT['authenticated'] !== true) {
        setLoginText(
          <span>
            {'To view own projects login here: '}
            <Link href="/accounts/login" color="inherit" variant="subtitle2">
              FedID Login
            </Link>
          </span>
        );
      }
    }, []);

    useEffect(() => {
      resetTargetState();
      resetSelectionState();
      toast(loginText, {
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right'
        }
      });
      resetCurrentCompoundsSettings(true);
      resetProjectsReducer();
    }, [
      resetTargetState,
      resetSelectionState,
      toast,
      loginText,
      resetCurrentCompoundsSettings,
      resetProjectsReducer
    ]);

    return (
      <Grid container className={classes.root}>
        <Grid item xs={3}>
          <TargetList />
        </Grid>
        <Grid item xs={9}>
          <Projects />
        </Grid>
      </Grid>
    );
  }
);

function mapStateToProps(state) {
  return {};
}
const mapDispatchToProps = {
  resetSelectionState: selectionActions.resetSelectionState,
  resetTargetState: apiActions.resetTargetState,
  resetCurrentCompoundsSettings,
  resetProjectsReducer
};

export default connect(mapStateToProps, mapDispatchToProps)(withLoadingProjects(Landing));
