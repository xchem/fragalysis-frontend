import React, { memo, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@mui/material';
import { Restore, Share } from '@mui/icons-material';
import DownloadPdb from './downloadPdb';
import { HeaderContext } from '../header/headerContext';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { saveAndShareSnapshot } from './redux/dispatchActions';
import { NglContext } from '../nglView/nglProvider';
import { restoreSnapshotActions } from '../preview/moleculeGroups/redux/dispatchActions';
import { extractTargetFromURLParam } from '../preview/utils';
import { setDontShowShareSnapshot } from './redux/actions';
import RichTooltip from '../tooltip/RichTooltip';

/**
 * Created by ricgillams on 13/06/2018.
 */

export const withSnapshotManagement = WrappedComponent => {
  return memo(({ ...rest }) => {
    const history = useHistory();
    let match = useRouteMatch();
    const { setHeaderNavbarTitle, setHeaderButtons } = useContext(HeaderContext);
    const { nglViewList } = useContext(NglContext);
    const dispatch = useDispatch();
    const sessionTitle = useSelector(state => state.apiReducers.sessionTitle);

    const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);

    const targetIdList = useSelector(state => state.apiReducers.target_id_list);
    const targetOnName = useSelector(state => state.apiReducers.target_on_name);
    const targetId = useSelector(state => state.apiReducers.target_on);
    // const targetObj = targetIdList.find(t => t.id === targetId);
    const targetName = targetOnName; // targetObj?.display_name;
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
        <RichTooltip key="shareSnapshot" path="shareSnapshot">
          <Button
            id="header-share-button"
            color="primary"
            size="small"
            startIcon={<Share />}
            disabled={disableShareButton || false}
            onClick={() => {
              dispatch(saveAndShareSnapshot(nglViewList, true, {})).then(() =>
                dispatch(setDontShowShareSnapshot(false))
              );
            }}
          >
            Share
          </Button>
        </RichTooltip>,
        <DownloadPdb key="download" />
      ]);

      return () => {
        setHeaderButtons(null);
        setHeaderNavbarTitle('');
      };
    }, [
      enableSaveButton,
      dispatch,
      sessionTitle,
      setHeaderNavbarTitle,
      setHeaderButtons,
      targetIdList,
      targetName,
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
