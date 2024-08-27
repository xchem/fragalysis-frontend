import React, { memo, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { URLS } from '../routes/constants';
import { setCurrentProject, setOpenPickProjectModal } from '../target/redux/actions';
import Preview from './Preview';
import { getProjectForProjectName, getProjectsForSelectedTarget } from './redux/dispatchActions';
import { extractProjectFromURLParam } from './utils';
import { ToastContext } from '../toast';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';

export const TASPreview = memo(props => {
  let match = useRouteMatch();
  const dispatch = useDispatch();
  let history = useHistory();

  const currentPorject = useSelector(state => state.targetReducers.currentProject);
  const currentTarget = useSelector(state => state.apiReducers.target_on);
  const targetList = useSelector(state => state.apiReducers.target_id_list);
  const projectsLoaded = useSelector(state => state.targetReducers.projectsLoaded);

  const { toastWarning } = useContext(ToastContext);

  useEffect(() => {
    let project = null;
    if (
      !currentPorject &&
      match &&
      match.params &&
      match.params[0] &&
      currentTarget &&
      targetList &&
      targetList.length > 0 &&
      projectsLoaded
    ) {
      const projectName = extractProjectFromURLParam(match.params[0]);
      if (!projectName) {
        const projectsForSelectedTarget = dispatch(getProjectsForSelectedTarget());
        if (projectsForSelectedTarget && projectsForSelectedTarget.length > 0) {
          if (projectsForSelectedTarget.length === 1) {
            dispatch(setCurrentProject(projectsForSelectedTarget[0]));
          } else {
            dispatch(setOpenPickProjectModal(true));
          }
        } else {
          //show message that there are no projects for this target
          history.push(URLS.landing);
        }
      } else {
        project = dispatch(getProjectForProjectName(projectName));
        dispatch(setCurrentProject(project));
      }
    }
  }, [dispatch, currentPorject, match, history, currentTarget, targetList, projectsLoaded]);

  useEffect(() => {
    if (DJANGO_CONTEXT.target_warning_message && DJANGO_CONTEXT.target_warning_message.length > 0) {
      toastWarning(DJANGO_CONTEXT.target_warning_message);
    }
  }, [toastWarning]);

  return <Preview isStateLoaded={false} hideProjects={true} {...props} />;
});
