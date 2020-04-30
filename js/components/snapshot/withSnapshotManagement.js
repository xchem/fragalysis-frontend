import React, { memo, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import { Save, Share } from '@material-ui/icons';
import DownloadPdb from './downloadPdb';
import { HeaderContext } from '../header/headerContext';
import { useRouteMatch } from 'react-router-dom';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
import { activateSnapshotDialog } from './redux/dispatchActions';

/**
 * Created by ricgillams on 13/06/2018.
 */

export const withSnapshotManagement = WrappedComponent => {
  return memo(({ ...rest }) => {
    let match = useRouteMatch();
    const { setHeaderNavbarTitle, setHeaderButtons, setSnackBarTitle, setSnackBarColor } = useContext(HeaderContext);
    const dispatch = useDispatch();
    const sessionTitle = useSelector(state => state.apiReducers.sessionTitle);

    const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);

    const targetIdList = useSelector(state => state.apiReducers.target_id_list);
    const targetName = useSelector(state => state.apiReducers.target_on_name);
    const currentProject = useSelector(state => state.projectReducers.currentProject);
    const projectId = match && match.params && match.params.projectId;
    const target = match && match.params && match.params.target;
    const disableUserInteraction = useDisableUserInteraction();

    const enableSaveButton =
      (projectId && currentProject.projectID !== null && currentProject.authorID !== null && DJANGO_CONTEXT['pk']) ||
      target !== undefined;

    const enableShareButton =
      (projectId && currentProject.projectID !== null && currentSnapshotID !== null) || target !== undefined;

    // Function for set Header buttons, target title and snackBar information about session
    useEffect(() => {
      if (targetName !== undefined) {
        setHeaderNavbarTitle(targetName);
      }
      setHeaderButtons([
        <Button
          key="saveSnapshot"
          color="primary"
          onClick={() => dispatch(activateSnapshotDialog(DJANGO_CONTEXT['pk']))}
          startIcon={<Save />}
          disabled={!enableSaveButton || disableUserInteraction}
        >
          Save
        </Button>,
        <Button
          key="shareSnapshot"
          color="primary"
          size="small"
          startIcon={<Share />}
          disabled={!enableShareButton || disableUserInteraction}
          onClick={() => {
            dispatch(activateSnapshotDialog(DJANGO_CONTEXT['pk'], true));
          }}
        >
          Share
        </Button>,
        <DownloadPdb key="download" />
      ]);

      return () => {
        setHeaderButtons(null);
        setSnackBarTitle(null);
        setHeaderNavbarTitle('');
      };
    }, [
      enableSaveButton,
      dispatch,
      sessionTitle,
      setHeaderNavbarTitle,
      setHeaderButtons,
      setSnackBarTitle,
      targetIdList,
      targetName,
      setSnackBarColor,
      projectId,
      disableUserInteraction,
      enableShareButton
    ]);

    return <WrappedComponent {...rest} />;
  });
};
