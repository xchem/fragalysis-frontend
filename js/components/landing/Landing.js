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
import { resetCurrentCompoundsSettings } from '../preview/compounds/redux/actions';
import { resetProjectsReducer } from '../projects/redux/actions';
import { withLoadingProjects } from '../target/withLoadingProjects';
import { ToastContext } from '../toast';
import { EditTargetDialog } from '../target/editTargetDialog';
import { TOAST_LEVELS } from '../toast/constants';
import { TargetSettingsModal } from '../target/targetSettingsModal';
import { setEditTargetDialogOpen } from '../target/redux/actions';

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

    const [isResizing, setIsResizing] = useState(false);
    const [resizer, setResizer] = useState(null);
    // const [targetListWidth, setTargetListWidth] = useState(450);
    const [publicTargetListWidth, setPublicTargetListWidth] = useState(window.innerWidth * 0.4);
    const [privateTargetListWidth, setPrivateTargetListWidth] = useState(window.innerWidth * 0.4);
    const [legacyTargetListWidth, setLegacyTargetListWidth] = useState(window.innerWidth * 0.2);

    const [privateTargets, setPrivateTargets] = useState([]);
    const [publicTargets, setPublicTargets] = useState([]);

    const target_id_list = useSelector(state => state.apiReducers.target_id_list);
    const legacy_target_id_list = useSelector(state => state.apiReducers.legacy_target_id_list);

    useEffect(() => {
      let tempPrivateTargets = [];
      let tempPublicTargets = [];
      target_id_list?.forEach(target => {
        if (target.project.open_to_public === false) {
          tempPrivateTargets.push(target);
        } else {
          tempPublicTargets.push(target);
        }
      });
      setPrivateTargets(tempPrivateTargets);
      setPublicTargets(tempPublicTargets);
    }, [target_id_list]);

    const { toast, toastSuccess, toastError, toastInfo, toastWarning } = useContext(ToastContext);
    const [loginText, setLoginText] = useState(
      DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN' ? '' : "You're logged in as " + DJANGO_CONTEXT['username']
    );
    const toastMessages = useSelector(state => state.selectionReducers.toastMessages);
    const isEditTargetDialogOpen = useSelector(state => state.targetReducers.isEditTargetDialogOpen);

    const onModalClose = () => {
      dispatch(setEditTargetDialogOpen(false));
      dispatch(selectionActions.setTargetToEdit(null));
    };

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

      const handleWindowResize = () => {
        setPublicTargetListWidth(window.innerWidth * 0.4);
        setPrivateTargetListWidth(window.innerWidth * 0.4);
        setLegacyTargetListWidth(window.innerWidth * 0.2);
      };

      window.addEventListener('resize', handleWindowResize);

      return () => {
        window.removeEventListener('resize', handleWindowResize);
      };
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

    const handleMouseDownResizer = resizer => {
      setIsResizing(true);
      setResizer(resizer);
    };

    const handleMouseMove = useCallback(
      e => {
        if (!isResizing || resizer === null) return;
        const leftPartWidth = e.clientX;
        const rightPartWidth = window.innerWidth - leftPartWidth;
        if (resizer === 1) {
          setPublicTargetListWidth(leftPartWidth);
          setPrivateTargetListWidth(rightPartWidth);
        } else if (resizer === 2) {
          setPrivateTargetListWidth(leftPartWidth);
          setLegacyTargetListWidth(rightPartWidth);
        }
      },
      [isResizing, resizer]
    );

    const handleMouseUp = useCallback(() => {
      setIsResizing(false);
      setResizer(null);
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
          <Grid item style={{ width: publicTargetListWidth }}>
            <TargetList list={publicTargets} title={'Public targets'} />
          </Grid>
          <div
            style={{
              cursor: 'col-resize',
              width: 3,
              minWidth: 3,
              height: '100%',
              backgroundColor: '#eeeeee',
              borderRadius: '3px'
            }}
            className="resizer-left"
            onMouseDown={() => handleMouseDownResizer(1)}
          ></div>
          <Grid item style={{ width: privateTargetListWidth }}>
            <TargetList list={privateTargets} title={'Private targets'} authRequired={true} />
          </Grid>
          <div
            style={{
              cursor: 'col-resize',
              width: 3,
              minWidth: 3,
              height: '100%',
              backgroundColor: '#eeeeee',
              borderRadius: '3px'
            }}
            className="resizer-right"
            onMouseDown={() => handleMouseDownResizer(2)}
          ></div>
          <Grid item style={{ width: legacyTargetListWidth }}>
            <TargetList list={legacy_target_id_list} title={'Legacy targets'} legacy={true} />
          </Grid>
        </Grid>
        <TargetSettingsModal openModal={isEditTargetDialogOpen} onModalClose={onModalClose} isTargetOn={false} />
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
