/**
 * Created by ricgillams on 28/06/2018.
 */

import React, { memo, useState, useContext, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../common/Inputs/Button';
import { Settings, Mouse, PersonalVideo, Undo, Redo, Restore } from '@material-ui/icons';
import { ButtonGroup, Grid, makeStyles, Tooltip } from '@material-ui/core';
import { SettingControls } from './settingsControls';
import DisplayControls from './displayControls/';
import { MouseControls } from './mouseControls';
import { ActionCreators as UndoActionCreators } from '../../../undoredo/actions';
import {
  undoAction,
  redoAction,
  getCanRedo,
  getCanUndo,
  getUndoActionText,
  getRedoActionText,
  restoreNglViewSettings
} from '../../../../js/reducers/tracking/dispatchActions';
import {
  undoAction as nglUndoAction,
  redoAction as nglRedoAction,
  getUndoActionText as nglGetUndoActionText,
  getRedoActionText as nglGetRedoActionText
} from '../../../../js/reducers/nglTracking/dispatchActions';
import { NglContext } from '../../nglView/nglProvider';
import { nglTrackingRedo, nglTrackingUndo } from '../../../reducers/nglTracking/actions';

const drawers = {
  settings: 'settings',
  display: 'display',
  mouse: 'mouse'
};

const initDrawers = { [drawers.settings]: false, [drawers.display]: false, [drawers.mouse]: false };

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing(2)
  },
  button: {
    padding: theme.spacing(1)
  },
  nglButtons: {
    flexBasis: 0,
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing()
  }
}));

export const ViewerControls = memo(({ leftColumnOpen, setLeftColumnOpen, rightColumnOpen, setRightColumnOpen }) => {
  const [drawerSettings, setDrawerSettings] = useState(JSON.parse(JSON.stringify(initDrawers)));
  const classes = useStyles();
  const dispatch = useDispatch();
  const { nglViewList } = useContext(NglContext);
  const [undoTooltip, setUndoTooltip] = useState('Undo');
  const [redoTooltip, setRedoTooltip] = useState('Redo');
  const [canUndo, setCanUndo] = useState(true);
  const [canRedo, setCanRedo] = useState(false);
  const [nglUndoTooltip, nglSetUndoTooltip] = useState('Undo');
  const [nglRedoTooltip, nglSetRedoTooltip] = useState('Redo');
  const isActionTracking = useSelector(state => state.trackingReducers.isActionTracking);

  const nglUndoLength = useSelector(state => state.undoableNglTrackingReducers.past).length;
  const nglRedoLength = useSelector(state => state.undoableNglTrackingReducers.future).length;
  const nglCanUndo = nglUndoLength > 0;
  const nglCanRedo = nglRedoLength > 0;

  useEffect(() => {
    nglSetUndoTooltip(dispatch(nglGetUndoActionText()));
  }, [dispatch, nglUndoLength]);

  useEffect(() => {
    nglSetRedoTooltip(dispatch(nglGetRedoActionText()));
  }, [dispatch, nglRedoLength]);

  const openDrawer = key => {
    //close all and open selected by key
    let newDrawerState = JSON.parse(JSON.stringify(initDrawers));
    newDrawerState[key] = !drawerSettings[key];
    setDrawerSettings(newDrawerState);
  };
  const closeAllDrawers = () => {
    setDrawerSettings(JSON.parse(JSON.stringify(initDrawers)));
  };

  const doUndo = () => {
    dispatch(UndoActionCreators.undo());
    setCanRedo(dispatch(getCanRedo()));
    setCanUndo(dispatch(getCanUndo()));
    dispatch(undoAction(nglViewList));

    setUndoTooltip(dispatch(getUndoActionText()));
    setRedoTooltip(dispatch(getRedoActionText()));
  };

  const nglDoUndo = () => {
    dispatch(nglTrackingUndo());
    dispatch(nglUndoAction(nglViewList));
  };

  const doRedo = () => {
    dispatch(UndoActionCreators.redo());
    setCanRedo(dispatch(getCanRedo()));
    setCanUndo(dispatch(getCanUndo()));
    dispatch(redoAction(nglViewList));

    setUndoTooltip(dispatch(getUndoActionText()));
    setRedoTooltip(dispatch(getRedoActionText()));
  };

  const nglDoRedo = () => {
    dispatch(nglTrackingRedo());
    dispatch(nglRedoAction(nglViewList));
  };

  const handleUserKeyPress = useCallback(e => {
    var evtobj = window.event ? window.event : e;
    if (evtobj.keyCode === 90 && evtobj.ctrlKey) {
      doUndo();
    } else if (evtobj.keyCode === 89 && evtobj.ctrlKey) {
      doRedo();
    }
  });

  useEffect(() => {
    if (isActionTracking === false) {
      setUndoTooltip(dispatch(getUndoActionText()));
      setRedoTooltip(dispatch(getRedoActionText()));
    }
    window.addEventListener('keydown', handleUserKeyPress);

    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [handleUserKeyPress, dispatch, isActionTracking]);

  return (
    <>
      <div className={classes.root}>
        <Tooltip title={leftColumnOpen ? 'Close left hand side' : 'Open left hand side'}>
          <Button
            variant={leftColumnOpen ? 'contained' : 'outlined'}
            size="small"
            color="primary"
            onClick={() => setLeftColumnOpen(!leftColumnOpen)}
            className={classes.button}
          >
            LHS
          </Button>
        </Tooltip>

        <div className={classes.nglButtons}>
          <ButtonGroup variant="contained" color="primary">
            <Tooltip title={nglUndoTooltip}>
              <Button
                size="small"
                color="secondary"
                onClick={() => {
                  nglDoUndo();
                }}
                className={classes.button}
                disabled={!nglCanUndo}
              >
                <Undo />
              </Button>
            </Tooltip>
            <Tooltip title={undoTooltip}>
              <Button
                size="small"
                color="primary"
                onClick={() => {
                  doUndo();
                }}
                className={classes.button}
                disabled={!canUndo}
              >
                <Undo />
              </Button>
            </Tooltip>
            <Tooltip title="Settings controls">
              <Button
                size="small"
                color="primary"
                onClick={() => openDrawer(drawers.settings)}
                className={classes.button}
              >
                <Settings />
              </Button>
            </Tooltip>
            <Tooltip title="Display controls">
              <Button
                size="small"
                color="primary"
                onClick={() => openDrawer(drawers.display)}
                className={classes.button}
              >
                <PersonalVideo />
              </Button>
            </Tooltip>
            <Tooltip title="Mouse controls">
              <Button size="small" color="primary" onClick={() => openDrawer(drawers.mouse)} className={classes.button}>
                <Mouse />
              </Button>
            </Tooltip>
            <Tooltip title={redoTooltip}>
              <Button
                size="small"
                color="primary"
                onClick={() => {
                  doRedo();
                }}
                className={classes.button}
                disabled={!canRedo}
              >
                <Redo />
              </Button>
            </Tooltip>
            <Tooltip title={nglRedoTooltip}>
              <Button
                size="small"
                color="secondary"
                onClick={() => {
                  nglDoRedo();
                }}
                className={classes.button}
                disabled={!nglCanRedo}
              >
                <Redo />
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Tooltip title="Restore ngl view settings">
            <Button
              color="primary"
              onClick={() => dispatch(restoreNglViewSettings(nglViewList))}
              startIcon={<Restore />}
              className={classes.button}
            >
              Restore clip/slab/centre
            </Button>
          </Tooltip>
        </div>

        <Tooltip title={rightColumnOpen ? 'Close right hand side' : 'Open right hand side'}>
          <Button
            variant={rightColumnOpen ? 'contained' : 'outlined'}
            size="small"
            color="primary"
            onClick={() => setRightColumnOpen(!rightColumnOpen)}
            className={classes.button}
          >
            RHS
          </Button>
        </Tooltip>
      </div>
      <SettingControls open={drawerSettings[drawers.settings]} onClose={closeAllDrawers} />
      <DisplayControls open={drawerSettings[drawers.display]} onClose={closeAllDrawers} />
      <MouseControls open={drawerSettings[drawers.mouse]} onClose={closeAllDrawers} />
    </>
  );
});
