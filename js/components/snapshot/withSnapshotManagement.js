import React, { memo, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import DownloadPdb from './downloadPdb';
import { savingStateConst } from './constants';
import { HeaderContext } from '../header/headerContext';
import { setOpenSnapshotSavingDialog } from './redux/actions';
import { useRouteMatch } from 'react-router-dom';

/**
 * Created by ricgillams on 13/06/2018.
 */

export const withSnapshotManagement = WrappedComponent => {
  return memo(({ ...rest }) => {
    let match = useRouteMatch();
    const { setHeaderNavbarTitle, setHeaderButtons, setSnackBarTitle, setSnackBarColor } = useContext(HeaderContext);
    const dispatch = useDispatch();
    const savingState = useSelector(state => state.apiReducers.savingState);
    const sessionTitle = useSelector(state => state.apiReducers.sessionTitle);

    const targetIdList = useSelector(state => state.apiReducers.target_id_list);
    const targetName = useSelector(state => state.apiReducers.target_on_name);
    const projectId = match && match.params && match.params.projectId;

    const disableButtons =
      (savingState &&
        (savingState.startsWith(savingStateConst.saving) || savingState.startsWith(savingStateConst.overwriting))) ||
      !projectId ||
      !targetName ||
      false;

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
          Save
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
