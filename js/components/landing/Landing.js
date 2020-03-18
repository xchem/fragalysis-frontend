/**
 * Created by ricgillams on 21/06/2018.
 */
import { Grid, Link } from '@material-ui/core';
import React, { memo, useContext, useEffect, useState } from 'react';
import TargetList from '../target/targetList';
//import SessionList from '../session/sessionList';
import { connect } from 'react-redux';
import * as apiActions from '../../reducers/api/actions';
import * as selectionActions from '../../reducers/selection/actions';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { Projects } from '../projects';
import { HeaderContext } from '../header/headerContext';
import { resetCurrentCompoundsSettings } from '../preview/compounds/redux/actions';
import { resetProjectsReducer } from '../projects/redux/actions';

const Landing = memo(
  ({ resetSelectionState, resetTargetState, resetCurrentCompoundsSettings, resetProjectsReducer, history }) => {
    const { setSnackBarTitle } = useContext(HeaderContext);
    const [loginText, setLoginText] = useState("You're logged in as " + DJANGO_CONTEXT['username']);

    useEffect(() => {
      if (DJANGO_CONTEXT['authenticated'] !== true) {
        setLoginText(
          <>
            {'To view own targets login here: '}
            <Link href="/accounts/login" color="inherit" variant="subtitle2">
              FedID Login
            </Link>
          </>
        );
      }
    }, []);

    useEffect(() => {
      resetTargetState();
      resetSelectionState();
      setSnackBarTitle(loginText);
      resetCurrentCompoundsSettings(true);
      resetProjectsReducer();
    }, [
      resetTargetState,
      resetSelectionState,
      setSnackBarTitle,
      loginText,
      resetCurrentCompoundsSettings,
      resetProjectsReducer
    ]);

    return (
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <TargetList key="TARGLIST" />
        </Grid>
        <Grid item xs={8}>
          {/*<SessionList />*/}
          <Projects history={history} />
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

export default connect(mapStateToProps, mapDispatchToProps)(Landing);
