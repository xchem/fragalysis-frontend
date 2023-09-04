import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { api } from '../../../utils/api';
import { setSnapshotJobList } from '../../projects/redux/actions';
import { loadSnapshotTree } from '../../projects/redux/dispatchActions';
import { base_url } from '../../routes/constants';
import { ProjectHistory } from './ProjectHistory';
import { JobTable } from '../jobTable';
import { loadNewDatasetsAndCompounds } from '../../datasets/redux/dispatchActions';

export const ProjectHistoryPanel = ({ showFullHistory }) => {
  const dispatch = useDispatch();

  const projectID = useSelector(state => state.projectReducers.currentProject).projectID;
  const snapshotId = useSelector(state => state.projectReducers.currentSnapshot).id;
  const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);
  const currentSnapshotList = useSelector(state => state.projectReducers.currentSnapshotList);
  const currentSnapshotTree = useSelector(state => state.projectReducers.currentSnapshotTree);
  const isLoadingTree = useSelector(state => state.projectReducers.isLoadingTree);

  const refreshData = useSelector(state => state.projectReducers.refreshJobsData);

  const target_on = useSelector(state => state.apiReducers.target_on);

  const [expanded, setExpanded] = useState(true);
  const [currentTab, setCurrentTab] = useState('projectHistory');
  const [graphKey, setGraphKey] = useState(new Date().getTime());

  useEffect(() => {
    if (currentSnapshotID !== null) {
      dispatch(loadSnapshotTree(projectID));
      dispatch(loadNewDatasetsAndCompounds(target_on));
    }
  }, [currentSnapshotID, dispatch, projectID, snapshotId, refreshData, target_on]);

  const currentSnapshotTreeId = currentSnapshotTree?.id;
  useEffect(() => {
    const fetchJobs = async () => {
      if (!isLoadingTree) {
        const promises = [currentSnapshotTreeId, ...Object.keys(currentSnapshotList || {})].map(snapshotId => {
          if (snapshotId) {
            return api({ url: `${base_url}/api/job_request/?snapshot=${snapshotId}` }).then(response => {
              const jobList = response.data.results;
              dispatch(setSnapshotJobList({ snapshotId, jobList }));
            });
          }
        });
        // In case any request errors out, update the graph
        await Promise.allSettled(promises);
        setGraphKey(new Date().getTime());
      }
    };

    fetchJobs();
  }, [currentSnapshotList, dispatch, isLoadingTree, currentSnapshotTreeId]);

  if (currentTab === 'projectHistory') {
    return (
      <ProjectHistory
        showFullHistory={showFullHistory}
        graphKey={graphKey}
        expanded={expanded}
        onExpanded={expanded => setExpanded(expanded)}
        onTabChange={tab => setCurrentTab(tab)}
      />
    );
  }

  if (currentTab === 'jobTable') {
    return (
      <JobTable
        expanded={expanded}
        onExpanded={expanded => setExpanded(expanded)}
        onTabChange={tab => setCurrentTab(tab)}
      />
    );
  }

  return null;
};
