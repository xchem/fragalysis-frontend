import React, { memo, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import { Save, Restore, Share } from '@material-ui/icons';
import DownloadPdb from './downloadPdb';
import { HeaderContext } from '../header/headerContext';
import { setSharedSnapshot } from './redux/actions';
import { useRouteMatch } from 'react-router-dom';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { useDisableUserInteraction } from '../helpers/useEnableUserInteracion';
import { base_url, URLS } from '../routes/constants';
import { activateSnapshotDialog } from './redux/dispatchActions';
import { NglContext } from '../nglView/nglProvider';
import {
  clearMoleculeGroupSelection,
  restoreFromCurrentSnapshot
} from '../preview/moleculeGroups/redux/dispatchActions';

/**
 * Created by ricgillams on 13/06/2018.
 */

export const withSnapshotManagement = WrappedComponent => {
  return memo(({ ...rest }) => {
    let match = useRouteMatch();
    const { setHeaderNavbarTitle, setHeaderButtons, setSnackBarTitle, setSnackBarColor } = useContext(HeaderContext);
    const { getNglView } = useContext(NglContext);
    const dispatch = useDispatch();
    const sessionTitle = useSelector(state => state.apiReducers.sessionTitle);

    const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);
    const currentSnapshotTitle = useSelector(state => state.projectReducers.currentSnapshot.title);
    const currentSnapshotDescription = useSelector(state => state.projectReducers.currentSnapshot.description);

    const targetIdList = useSelector(state => state.apiReducers.target_id_list);
    const targetName = useSelector(state => state.apiReducers.target_on_name);
    const currentProject = useSelector(state => state.projectReducers.currentProject);
    const projectId = match && match.params && match.params.projectId;
    const target = match && match.params && match.params.target;
    const disableUserInteraction = useDisableUserInteraction();

    const enableButton =
      (projectId && currentProject.projectID !== null && currentProject.authorID !== null && DJANGO_CONTEXT['pk']) ||
      target !== undefined;

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
          disabled={!enableButton || disableUserInteraction}
        >
          Save
        </Button>,
        <Button
          key="restoreSnapshot"
          color="primary"
          onClick={() => dispatch(restoreFromCurrentSnapshot({ getNglView }))}
          startIcon={<Restore />}
          disabled={!enableButton || disableUserInteraction}
        >
          Restore
        </Button>,
        <Button
          key="shareSnapshot"
          color="primary"
          size="small"
          startIcon={<Share />}
          disabled={
            disableUserInteraction ||
            currentSnapshotID === null ||
            (currentProject && currentProject.projectID === null)
          }
          onClick={() => {
            dispatch(
              setSharedSnapshot({
                title: currentSnapshotTitle,
                description: currentSnapshotDescription,
                url: `${base_url}${URLS.projects}${currentProject.projectID}/${currentSnapshotID}`
              })
            );
          }}
        >
          Share
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
      enableButton,
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
      currentSnapshotID,
      currentProject,
      getNglView,
      currentSnapshotTitle,
      currentSnapshotDescription
    ]);

    return <WrappedComponent {...rest} />;
  });
};
