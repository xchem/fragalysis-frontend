import React, { memo, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@material-ui/core';
import { Save, Restore, Share } from '@material-ui/icons';
import DownloadPdb from './downloadPdb';
import { HeaderContext } from '../header/headerContext';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { activateSnapshotDialog, saveAndShareSnapshot } from './redux/dispatchActions';
import { NglContext } from '../nglView/nglProvider';
import { restoreSnapshotActions } from '../preview/moleculeGroups/redux/dispatchActions';
import { extractTargetFromURLParam } from '../preview/utils';

/**
 * Created by ricgillams on 13/06/2018.
 */

export const withSnapshotManagement = WrappedComponent => {
  return memo(({ ...rest }) => {
    const history = useHistory();
    let match = useRouteMatch();
    const { setHeaderNavbarTitle, setHeaderButtons, setSnackBarTitle, setSnackBarColor } = useContext(HeaderContext);
    const { nglViewList } = useContext(NglContext);
    const dispatch = useDispatch();
    const sessionTitle = useSelector(state => state.apiReducers.sessionTitle);

    const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);

    const targetIdList = useSelector(state => state.apiReducers.target_id_list);
    const targetName = useSelector(state => state.apiReducers.target_on_name);
    const currentSessionProject = useSelector(state => state.projectReducers.currentProject);
    const currentSnapshot = useSelector(state => state.projectReducers.currentSnapshot);
    const directDisplay = useSelector(state => state.apiReducers.direct_access);
    const currentProject = useSelector(state => state.targetReducers.currentProject);

    const sessionProjectId = currentSessionProject.projectID;
    const snapshotJustSaved = useSelector(state => state.snapshotReducers.snapshotJustSaved);
    // let target = match && match.params && match.params.target;
    let target = match && match.params && extractTargetFromURLParam(match.params[0]);
    // Check whether the snapshot was just saved
    target = snapshotJustSaved ? undefined : target;

    if (directDisplay && directDisplay.target) {
      target = directDisplay.target;
    }

    const enableSaveButton =
      (sessionProjectId &&
        currentSessionProject.projectID !== null &&
        currentSessionProject.authorID !== null &&
        DJANGO_CONTEXT['pk']) ||
      target !== undefined;

    const disableShareButton =
      (sessionProjectId !== undefined &&
        currentSessionProject.projectID === null &&
        currentSnapshotID === null &&
        !target) ||
      (!target && !sessionProjectId);

    // Function for set Header buttons, target title and snackBar information about session
    useEffect(() => {
      if (targetName !== undefined) {
        if (currentProject) {
          setHeaderNavbarTitle(`${targetName} | ${currentProject?.target_access_string}`);
        } else {
          setHeaderNavbarTitle(`${targetName}`);
        }
      }
      setHeaderButtons([
        <Button
          key="saveSnapshot"
          color="primary"
          onClick={() => dispatch(activateSnapshotDialog(DJANGO_CONTEXT['pk']))}
          startIcon={<Save />}
          disabled={!enableSaveButton || false}
        >
          Save
        </Button>,
        !target && currentSnapshotID && (
          <Button
            key="restoreSnapshot"
            color="primary"
            onClick={() =>
              dispatch(
                restoreSnapshotActions({
                  nglViewList,
                  projectId: sessionProjectId,
                  snapshotId: currentSnapshot.id,
                  history
                })
              )
            }
            startIcon={<Restore />}
            disabled={disableShareButton || false}
          >
            Restore
          </Button>
        ),
        <Button
          key="shareSnapshot"
          color="primary"
          size="small"
          startIcon={<Share />}
          disabled={disableShareButton || false}
          onClick={() => {
            dispatch(saveAndShareSnapshot(nglViewList, true, {}));
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
      sessionProjectId,
      currentSnapshotID,
      currentSessionProject,
      disableShareButton,
      target,
      nglViewList,
      currentSnapshot.id,
      history,
      currentProject
    ]);

    return (
      <WrappedComponent
        {...rest}
        hideProjects={
          DJANGO_CONTEXT['pk'] === undefined ||
          (DJANGO_CONTEXT['pk'] !== undefined &&
            (currentSessionProject.projectID === null || currentSessionProject.authorID === null))
        }
      />
    );
  });
};
