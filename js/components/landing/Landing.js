/**
 * Created by ricgillams on 21/06/2018.
 */
import { GridLegacy as Grid, Link } from '@mui/material';
import { makeStyles } from '../../ui/styles';
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
import { TooltipPathProvider } from '../tooltip/TooltipPathContext';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    gap: theme.spacing(1),
    flexWrap: 'nowrap',
    padding: theme.spacing(),
    flexDirection: 'column',
    width: '100%',
    minHeight: 0,
    boxSizing: 'border-box'
  },
  targetPanel: {
    flexBasis: 0,
    minHeight: 0,
    overflow: 'hidden'
  },
  resizer: {
    cursor: 'row-resize',
    width: '100%',
    height: 3,
    flexShrink: 0,
    backgroundColor: '#eeeeee',
    borderRadius: 3
  }
}));

export const Landing = memo(
  ({ resetSelectionState, resetTargetState, resetCurrentCompoundsSettings, resetProjectsReducer }) => {
    const dispatch = useDispatch();
    const classes = useStyles();

    const [panelProportions, setPanelProportions] = useState([0.6, 0.2, 0.2]);
    const [resizing, setResizing] = useState(null);

    const [privateTargets, setPrivateTargets] = useState([]);
    const [publicTargets, setPublicTargets] = useState([]);

    const target_id_list = useSelector(state => state.apiReducers.target_id_list);
    const legacy_target_id_list = useSelector(state => state.apiReducers.legacy_target_id_list);

    useEffect(() => {
      let tempPrivateTargets = [];
      let tempPublicTargets = [];
      target_id_list?.forEach(target => {
        if (target.project && typeof target.project === 'object') {
          if (target.project.open_to_public === false) {
            tempPrivateTargets.push(target);
          } else {
            tempPublicTargets.push(target);
          }
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

    const handleMouseDownResizer = (event, index) => {
      event.preventDefault();
      const divider = event.currentTarget;
      const adjacentHeight =
        divider.previousElementSibling.getBoundingClientRect().height +
        divider.nextElementSibling.getBoundingClientRect().height;
      if (adjacentHeight > 0) {
        setResizing({ index, startY: event.clientY, adjacentHeight, proportions: panelProportions });
      }
    };

    const handleMouseMove = useCallback(
      e => {
        if (!resizing) return;
        const { index, startY, adjacentHeight, proportions } = resizing;
        const total = proportions[index] + proportions[index + 1];
        const minimum = (Math.min(70, adjacentHeight / 2) / adjacentHeight) * total;
        const first = Math.max(
          minimum,
          Math.min(total - minimum, proportions[index] + ((e.clientY - startY) / adjacentHeight) * total)
        );
        const next = [...proportions];
        next[index] = first;
        next[index + 1] = total - first;
        setPanelProportions(next);
      },
      [resizing]
    );

    const handleMouseUp = useCallback(() => {
      setResizing(null);
    }, []);

    useEffect(() => {
      if (resizing) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [resizing, handleMouseMove, handleMouseUp]);

    return (
      <TooltipPathProvider path="targetLists">
        <Grid container className={classes.root}>
          <Grid item className={classes.targetPanel} style={{ flexGrow: panelProportions[0] }}>
            <TargetList list={publicTargets} title={'Public targets'} />
          </Grid>
          <div
            role="separator"
            aria-label="Resize public and private targets"
            aria-orientation="horizontal"
            className={classes.resizer}
            onMouseDown={event => handleMouseDownResizer(event, 0)}
          ></div>
          <Grid item className={classes.targetPanel} style={{ flexGrow: panelProportions[1] }}>
            <TargetList list={privateTargets} title={'Private targets'} authRequired={true} />
          </Grid>
          <div
            role="separator"
            aria-label="Resize private and legacy targets"
            aria-orientation="horizontal"
            className={classes.resizer}
            onMouseDown={event => handleMouseDownResizer(event, 1)}
          ></div>
          <Grid item className={classes.targetPanel} style={{ flexGrow: panelProportions[2] }}>
            <TargetList list={legacy_target_id_list} title={'Legacy targets'} legacy={true} />
          </Grid>
        </Grid>
        <TargetSettingsModal openModal={isEditTargetDialogOpen} onModalClose={onModalClose} isTargetOn={false} />
      </TooltipPathProvider>
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
