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
import { HeaderContext } from '../header/headerContext';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    gap: theme.spacing(1),
    flexWrap: 'nowrap',
    padding: theme.spacing()
  }
}));

const Landing = memo(
  ({ resetSelectionState, resetTargetState, resetCurrentCompoundsSettings, resetProjectsReducer }) => {
    const classes = useStyles();

    const projectWidth = window.innerWidth;
    const [isResizing, setIsResizing] = useState(false);
    const [targetListWidth, setTargetListWidth] = useState(450);
    const [projectListWidth, setProjectListWidth] = useState(projectWidth);

    const { setSnackBarTitle } = useContext(HeaderContext);
    const { toast } = useContext(ToastContext);
    const [loginText, setLoginText] = useState(
      DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN' ? '' : "You're logged in as " + DJANGO_CONTEXT['username']
    );

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
    }, [resetTargetState, resetSelectionState, toast, loginText, resetCurrentCompoundsSettings, resetProjectsReducer]);

    const handleMouseDownResizer = () => {
      setIsResizing(true);
    };

    const handleMouseMove = e => {
      if (!isResizing) return;
      const targetListWidth = e.clientX;
      const projectListWidth = window.innerWidth - targetListWidth;
      setTargetListWidth(targetListWidth);
      setProjectListWidth(projectListWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    useEffect(() => {
      if (isResizing) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    }, [isResizing]);

    return (
      <Grid container className={classes.root}>
        <Grid item style={{ width: targetListWidth }}>
          <TargetList />
        </Grid>
        <div
          style={{
            cursor: 'col-resize',
            width: 3,
            height: '100%',
            backgroundColor: '#eeeeee',
            borderRadius: '3px'
          }}
          onMouseDown={handleMouseDownResizer}
        ></div>
        <Grid item style={{ width: projectListWidth }}>
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
