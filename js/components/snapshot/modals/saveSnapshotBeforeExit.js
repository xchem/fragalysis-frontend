import React, { memo, useContext } from 'react';
import Modal from '../../common/Modal';
import { DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Button } from '../../common/Inputs/Button';
import { switchBetweenSnapshots } from '../../preview/redux/dispatchActions';
import { useDispatch, useSelector } from 'react-redux';
import { NglContext } from '../../nglView/nglProvider';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { setIsOpenModalBeforeExit, setOpenSnapshotSavingDialog, setSelectedSnapshotToSwitch } from '../redux/actions';

export const SaveSnapshotBeforeExit = memo(() => {
  const { nglViewList } = useContext(NglContext);
  let history = useHistory();
  let match = useRouteMatch();
  const paramsProjectID = match && match.params && match.params.projectId;
  const isOpen = useSelector(state => state.snapshotReducers.isOpenModalSaveSnapshotBeforeExit);
  const snapshotID = useSelector(state => state.snapshotReducers.selectedSnapshotToSwitch);
  const currentProject = useSelector(state => state.projectReducers.currentProject);
  const currentProjectID = currentProject && currentProject.projectID;

  const dispatch = useDispatch();

  const handleCloseModal = () => {
    dispatch(setIsOpenModalBeforeExit(false));
  };

  const handleOnNo = () => {
    let projectID = paramsProjectID && paramsProjectID != null ? paramsProjectID : currentProjectID;
    dispatch(switchBetweenSnapshots({ nglViewList, projectID, snapshotID, history }));
    dispatch(setSelectedSnapshotToSwitch(null));
    handleCloseModal();
  };

  const handleOnYes = () => {
    dispatch(setOpenSnapshotSavingDialog(true));
    handleCloseModal();
  };

  return (
    <Modal open={isOpen}>
      <DialogTitle id="form-dialog-title">Do you want to save all changes?</DialogTitle>
      <DialogContent>
        <DialogContentText>Please consider saving your changes because you can lose them.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOnYes} color="primary">
          Yes
        </Button>
        <Button onClick={handleOnNo} color="secondary">
          No
        </Button>
      </DialogActions>
    </Modal>
  );
});
