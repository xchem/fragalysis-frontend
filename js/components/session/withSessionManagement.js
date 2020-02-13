import React, { memo, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import { Save, SaveOutlined, Share } from '@material-ui/icons';
import DownloadPdb from './downloadPdb';
import { savingStateConst } from './constants';

import { NglContext } from '../nglView/nglProvider';
import { HeaderContext } from '../header/headerContext';
import { setTargetAndReloadSession, reloadScene, newSession, saveSession, newSnapshot } from './redux/dispatchActions';

/**
 * Created by ricgillams on 13/06/2018.
 */

export const withSessionManagement = WrappedComponent => {
  return memo(({ ...rest }) => {
    const [/* state */ setState] = useState();

    const { pathname } = window.location;
    const { nglViewList } = useContext(NglContext);
    const { setHeaderNavbarTitle, setHeaderButtons, setSnackBarTitle } = useContext(HeaderContext);
    const dispatch = useDispatch();
    const savingState = useSelector(state => state.apiReducers.savingState);
    const sessionTitle = useSelector(state => state.apiReducers.sessionTitle);
    const uuid = useSelector(state => state.apiReducers.uuid);
    const sessionId = useSelector(state => state.apiReducers.sessionId);
    const saveType = useSelector(state => state.sessionReducers.saveType);
    const newSessionFlag = useSelector(state => state.sessionReducers.newSessionFlag);
    const nextUuid = useSelector(state => state.sessionReducers.nextUuid);
    const loadedSession = useSelector(state => state.sessionReducers.loadedSession);
    const targetIdList = useSelector(state => state.apiReducers.target_id_list);

    const disableButtons =
      (savingState &&
        (savingState.startsWith(savingStateConst.saving) || savingState.startsWith(savingStateConst.overwriting))) ||
      false;

    useEffect(() => {
      dispatch(setTargetAndReloadSession({ pathname, nglViewList, loadedSession, targetIdList }));
    }, [dispatch, loadedSession, nglViewList, pathname, targetIdList]);

    useEffect(() => {
      dispatch(reloadScene({ saveType, newSessionFlag, nextUuid, uuid, sessionId })).catch(error => {
        setState(() => {
          throw error;
        });
      });
    }, [dispatch, newSessionFlag, nextUuid, saveType, sessionId, setState, uuid]);

    // Function for set Header buttons, target title and snackBar information about session
    useEffect(() => {
      if (targetIdList[0] !== undefined) {
        setHeaderNavbarTitle(targetIdList[0].title);
      }
      if (sessionTitle === undefined || sessionTitle === 'undefined') {
        setHeaderButtons([
          <Button
            key="saveAs"
            color="primary"
            onClick={() => dispatch(newSession())}
            startIcon={<Save />}
            disabled={disableButtons}
          >
            Save Session As
          </Button>,
          <Button
            key="share"
            color="primary"
            onClick={() => dispatch(newSnapshot())}
            startIcon={<Share />}
            disabled={disableButtons}
          >
            Share Snapshot
          </Button>,
          <DownloadPdb key="download" />
        ]);
        setSnackBarTitle('Currently no active session.');
      } else {
        setHeaderButtons([
          <Button
            key="saveSession"
            color="primary"
            onClick={() => dispatch(saveSession())}
            startIcon={<SaveOutlined />}
            disabled={disableButtons}
          >
            Save Session
          </Button>,
          <Button key="saveAs" color="primary" onClick={newSession} startIcon={<Save />} disabled={disableButtons}>
            Save Session As
          </Button>,
          <Button key="share" color="primary" onClick={newSnapshot} startIcon={<Share />} disabled={disableButtons}>
            Share Snapshot
          </Button>,
          <DownloadPdb key="download" />
        ]);
        setSnackBarTitle(`Session: ${sessionTitle}`);
      }

      return () => {
        setHeaderButtons(null);
        setSnackBarTitle(null);
        setHeaderNavbarTitle('');
      };
    }, [
      disableButtons,
      dispatch,
      sessionTitle,
      setHeaderNavbarTitle,
      setHeaderButtons,
      setSnackBarTitle,
      targetIdList
    ]);

    return <WrappedComponent {...rest} />;
  });
};
