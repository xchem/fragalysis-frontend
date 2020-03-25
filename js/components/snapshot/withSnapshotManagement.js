import React, { memo, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import DownloadPdb from './downloadPdb';
import { savingStateConst } from './constants';
// import { NglContext } from '../nglView/nglProvider';
import { HeaderContext } from '../header/headerContext';
// import { setTargetAndReloadSession, reloadScene } from './redux/dispatchActions';
import { setOpenSnapshotSavingDialog } from './redux/actions';
import { useRouteMatch } from 'react-router-dom';

/**
 * Created by ricgillams on 13/06/2018.
 */

export const withSnapshotManagement = WrappedComponent => {
  return memo(({ ...rest }) => {
    // const [state, setState] = useState();
    let match = useRouteMatch();
    // const { pathname } = window.location;
    // const { nglViewList } = useContext(NglContext);
    const { setHeaderNavbarTitle, setHeaderButtons, setSnackBarTitle, setSnackBarColor } = useContext(HeaderContext);
    const dispatch = useDispatch();
    const savingState = useSelector(state => state.apiReducers.savingState);
    const sessionTitle = useSelector(state => state.apiReducers.sessionTitle);
    // const uuid = useSelector(state => state.apiReducers.uuid);
    // const sessionId = useSelector(state => state.apiReducers.sessionId);
    // const saveType = useSelector(state => state.snapshotReducers.saveType);
    // const newSessionFlag = useSelector(state => state.snapshotReducers.newSessionFlag);
    // const nextUuid = useSelector(state => state.snapshotReducers.nextUuid);
    // const loadedSession = useSelector(state => state.snapshotReducers.loadedSession);

    const targetIdList = useSelector(state => state.apiReducers.target_id_list);
    const targetName = useSelector(state => state.apiReducers.target_on_name);
    const projectId = match && match.params && match.params.projectId;

    const disableButtons =
      (savingState &&
        (savingState.startsWith(savingStateConst.saving) || savingState.startsWith(savingStateConst.overwriting))) ||
      !projectId ||
      !targetName ||
      false;

    // useEffect(() => {
    //   dispatch(setTargetAndReloadSession({ pathname, nglViewList, loadedSession, targetIdList }));
    // }, [dispatch, loadedSession, nglViewList, pathname, targetIdList]);

    // useEffect(() => {
    //   dispatch(reloadScene({ saveType, newSessionFlag, nextUuid, uuid, sessionId })).catch(error => {
    //     setState(() => {
    //       throw error;
    //     });
    //   });
    // }, [dispatch, newSessionFlag, nextUuid, saveType, sessionId, setState, uuid]);

    // Function for set Header buttons, target title and snackBar information about session
    useEffect(() => {
      if (targetName !== undefined) {
        setHeaderNavbarTitle(targetName);
      }
      setHeaderButtons([
        <Button
          key="saveSnapshot"
          color="primary"
          onClick={() => dispatch(setOpenSnapshotSavingDialog(true))}
          startIcon={<Save />}
          // disabled={disableButtons}
        >
          Save Snapshot
        </Button>,
        <DownloadPdb key="download" />
      ]);
      //   setSnackBarTitle('Currently no active session.');
      //  setSnackBarTitle(`Session: ${sessionTitle}`);

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
      targetIdList,
      targetName,
      setSnackBarColor,
      projectId
    ]);

    return <WrappedComponent {...rest} />;
  });
};
