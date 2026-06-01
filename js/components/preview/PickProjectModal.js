import React, { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Grid, MenuItem, Select, Typography } from '@material-ui/core';
import { setCurrentProject, setOpenPickProjectModal } from '../target/redux/actions';
import { URLS } from '../routes/constants';
import { Modal } from '../common';
import { useHistory } from 'react-router-dom';
import RichTooltip from '../tooltip/RichTooltip';

export const PickProjectModal = memo(({}) => {
  const dispatch = useDispatch();
  const openPickProjectModal = useSelector(state => state.targetReducers.openPickProjectModal);
  const projects = useSelector(state => state.targetReducers.projects);
  const { selectedProject, setSelectProject } = useState(0);
  let history = useHistory();

  const onSelectedProjectChanged = event => {
    setSelectProject(event.target.value);
  };

  const handleCloseModal = () => {
    dispatch(setOpenPickProjectModal(false));
    //redirect to landing page
    history.push(URLS.landing);
  };

  const submit = () => {
    if (projects && projects.length > 0) {
      const project = projects.find(p => p.id === selectedProject);
      if (project) {
        dispatch(setCurrentProject(project));
      } else {
        //redirect to landing page
        history.push(URLS.landing);
      }
    } else {
      //redirect to landing page
      history.push(URLS.landing);
    }
  };

  return (
    <Modal open={openPickProjectModal}>
      <Grid container direction="column">
        <Grid item>
          <Typography variant="h5">No project was detected. Please pick one from available projects.</Typography>
        </Grid>
        <Grid>
          <RichTooltip path="pickProject.selectProject">
            <Select value={selectedProject} label="Project" onChange={onSelectedProjectChanged}>
              {projects &&
                projects.map(p => (
                  <MenuItem key={`pick-project-modal-${p.id}`} value={p.id}>
                    {p.target_access_string}
                  </MenuItem>
                ))}
            </Select>
          </RichTooltip>
        </Grid>
        <Grid container justifyContent="flex-end" direction="row">
          <Grid item>
            <RichTooltip path="pickProject.cancel">
              <Button color="secondary" disabled={false} onClick={handleCloseModal}>
                Cancel
              </Button>
            </RichTooltip>
          </Grid>
          <Grid item>
            <RichTooltip path="pickProject.create">
              <Button color="primary" onClick={submit} disabled={false}>
                Create
              </Button>
            </RichTooltip>
          </Grid>
        </Grid>
      </Grid>
    </Modal>
  );
});
