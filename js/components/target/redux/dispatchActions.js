import * as listType from '../../../constants/listTypes';
import { getUrl, loadFromServer } from '../../../utils/genericList';
import {
  resetTargetState,
  setLegacyTargetIdList,
  setTargetIdList,
  setTargetOn,
  setTargetUnrecognised,
  setUuid
} from '../../../reducers/api/actions';
import { setIsTargetLoading, setOldUrl } from './actions';
import { api, legacyApi, METHOD } from '../../../utils/api';
import { resetSelectionState } from '../../../reducers/selection/actions';
import { base_url } from '../../routes/constants';
import { setCurrentProject } from '../../projects/redux/actions';
import { setCurrentProject as setProject } from './actions';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
// eslint-disable-next-line import/extensions
import { results as legacyTargetData } from '../../../../legacy/legacy_targets.json';

export const loadTargetList = onCancel => (dispatch, getState) => {
  const oldUrl = getState().targetReducers.oldUrl;
  const list_type = listType.TARGET;
  dispatch(setIsTargetLoading(true));
  dispatch(loadLegacyTargetList());
  return loadFromServer({
    url: getUrl({ list_type }),
    setOldUrl: url => {
      dispatch(setOldUrl(url));
      dispatch(setIsTargetLoading(false));
    },
    old_url: oldUrl,
    setObjectList: params => dispatch(setTargetIdList(params)),
    list_type,
    cancel: onCancel
  });
};

export const loadLegacyTargetList = () => async (dispatch, getState) => {
  if (DJANGO_CONTEXT['legacy_url'] && DJANGO_CONTEXT['legacy_url'] !== '') {
    const legacyBaseTargetUrl = DJANGO_CONTEXT['legacy_url'] + '/viewer/react/preview/target/';

    if (legacyTargetData && legacyTargetData.length > 0) {
      const copy = [...legacyTargetData];
      copy.forEach(legacyTarget => {
        legacyTarget['isLegacy'] = true;
        legacyTarget['legacyUrl'] = legacyBaseTargetUrl + legacyTarget['title'] + '/tas/lb18145-1';
      });

      dispatch(setLegacyTargetIdList(copy));
    }
  }
};

export const loadProjectsList = () => async (dispatch, getState) => {
  const url = `${base_url}/api/projects/`;
  const resp = await api({ url, method: METHOD.GET });
  return resp.data.results;
};

export const updateTarget = ({ target, setIsLoading, targetIdList, projectId }) => (dispatch, getState) => {
  const state = getState();
  const isActionRestoring = state.trackingReducers.isActionRestoring;
  const currentSessionProject = state.projectReducers.currentProject;
  const targetOn = state.apiReducers.target_on;
  const currentProject = state.targetReducers.currentProject;

  // Get from the REST API
  let targetUnrecognisedFlag = true;
  // if (target !== undefined) {
  if (target) {
    if (targetIdList && targetIdList.length > 0) {
      targetIdList.forEach(targetId => {
        if (target === targetId.title) {
          targetUnrecognisedFlag = false;
        }
      });
    }
    dispatch(setTargetUnrecognised(targetUnrecognisedFlag));
  } else if (projectId !== undefined) {
    targetUnrecognisedFlag = false;
    dispatch(setTargetUnrecognised(targetUnrecognisedFlag));
  }
  // for Targets
  if (targetUnrecognisedFlag === false) {
    setIsLoading(true);
    let url = undefined;
    if (target) {
      url = `${base_url}/api/targets/?title=${target}`;
      return api({ url })
        .then(response => {
          return dispatch(setTargetOn(response.data['results'][0].id));
        })
        .finally(() => setIsLoading(false));
    }
    // for Projects
    else if (projectId !== undefined) {
      setIsLoading(true);
      return api({ url: `${base_url}/api/session-projects/${projectId}/` })
        .then(response => {
          let promises = [];
          if (!isActionRestoring || isActionRestoring === false) {
            if (!targetOn) {
              promises.push(dispatch(setTargetOn(response.data.target.id, true)));
            }
            if (!currentSessionProject) {
              promises.push(
                dispatch(
                  setCurrentProject({
                    projectID: response.data.id,
                    authorID: response.data.author || null,
                    title: response.data.title,
                    description: response.data.description,
                    targetID: response.data.target.id,
                    tags: JSON.parse(response.data.tags)
                  })
                )
              );
            }
            if (!currentProject) {
              promises.push(dispatch(setProject(response.data.project)));
            }
          }

          return Promise.all(promises);
        })
        .finally(() => setIsLoading(false));
    }
  }
  return Promise.resolve();
};

export const setTargetUUIDs = (uuid, snapshotUuid) => dispatch => {
  if (uuid !== undefined) {
    dispatch(setUuid(uuid));
  } else if (snapshotUuid !== undefined) {
    dispatch(setUuid(snapshotUuid));
  }
};

export const resetTargetAndSelection = resetSelection => dispatch => {
  if (resetSelection) {
    dispatch(resetTargetState());
    dispatch(resetSelectionState());
  }
};

export const getTargetProjectCombinations = (targets, projects) => {
  const result = [];

  const targetItems = Object.entries(targets);

  if (targetItems.length > 0 && projects?.length > 0) {
    targetItems.forEach(([targetId, target]) => {
      if (!target.isLegacy) {
        const updatedTarget = target;
        if (Array.isArray(target.project)) {
          target.project.forEach(projectId => {
            console.log('target.project array member', projectId);
            const project = projects.find(project => project.id === projectId);
            // const project = projects[projectId];
            if (project) {
              updatedTarget.project = project;
              result.push({ updatedTarget });
            } else {
              console.log(
                `User don't have access to project ${projectId} which is associated with target ${target.title}`
              );
            }
          });
        } else {
          console.log('target.project', target.project);
          const projectId = typeof target.project === 'object' ? target.project.id : target.project;
          const project = projects.find(project => project.id === projectId);
          // const project = projects[projectId];
          if (project) {
            updatedTarget.project = project;
            result.push({ updatedTarget });
          } else {
            console.log(
              `User don't have access to project ${projectId} which is associated with target ${target.title}`
            );
          }
        }
      } else {
        result.push({ updatedTarget: { ...target, project: { target_access_string: 'Legacy' } } });
      }
    });
  } else if (targetItems.length > 0) {
    targetItems.forEach(([targetId, target]) => {
      if (target.isLegacy) {
        result.push({ updatedTarget: { ...target, project: { target_access_string: 'Legacy' } } });
      }
    });
  }

  return result;
};
