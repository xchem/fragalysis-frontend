/**
 * Created by ricgillams on 21/06/2018.
 */
import { Grid, Link, makeStyles } from '@material-ui/core';
import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import { TargetList } from '../target/targetList';
import { connect, useDispatch, useSelector } from 'react-redux';
import * as apiActions from '../../reducers/api/actions';
import * as selectionActions from '../../reducers/selection/actions';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { Projects } from '../projects';
import { resetCurrentCompoundsSettings } from '../preview/compounds/redux/actions';
import { resetProjectsReducer } from '../projects/redux/actions';
import { withLoadingProjects } from '../target/withLoadingProjects';
import { ToastContext } from '../toast';
import { EditTargetDialog } from '../target/editTargetDialog';
import { TOAST_LEVELS } from '../toast/constants';

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
    const dispatch = useDispatch();
    const classes = useStyles();

    const projectWidth = window.innerWidth;
    const [isResizing, setIsResizing] = useState(false);
    const [targetListWidth, setTargetListWidth] = useState(450);
    const [projectListWidth, setProjectListWidth] = useState(projectWidth);

    const { toast, toastSuccess, toastError, toastInfo, toastWarning } = useContext(ToastContext);
    const [loginText, setLoginText] = useState(
      DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN' ? '' : "You're logged in as " + DJANGO_CONTEXT['username']
    );
    const toastMessages = useSelector(state => state.selectionReducers.toastMessages);

    useEffect(() => {
      if (toastMessages?.length > 0) {
        toastMessages.forEach(message => {
          switch (message.level) {
            case TOAST_LEVELS.SUCCESS:
              toastSuccess(message.text);
              break;
            case TOAST_LEVELS.ERROR:
              toastError(message.text);
              break;
            case TOAST_LEVELS.INFO:
              toastInfo(message.text);
              break;
            case TOAST_LEVELS.WARNING:
              toastWarning(message.text);
              break;
            default:
              break;
          }
        });
        dispatch(selectionActions.setToastMessages([]));
      }
    }, [dispatch, toastError, toastInfo, toastMessages, toastSuccess, toastWarning]);

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

    const handleMouseMove = useCallback(
      e => {
        if (!isResizing) return;
        const targetListWidth = e.clientX;
        const projectListWidth = window.innerWidth - targetListWidth;
        setTargetListWidth(targetListWidth);
        setProjectListWidth(projectListWidth);
      },
      [isResizing]
    );

    const handleMouseUp = useCallback(() => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    useEffect(() => {
      if (isResizing) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    }, [isResizing, handleMouseMove, handleMouseUp]);

    return (
      <>
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
        <EditTargetDialog />
      </>
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
