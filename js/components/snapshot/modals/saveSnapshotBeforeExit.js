import React, { memo, useContext } from 'react';
import Modal from '../../common/Modal';
import { DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Button } from '../../common/Inputs/Button';
import { useDispatch, useSelector } from 'react-redux';
import { NglContext } from '../../nglView/nglProvider';
import { useRouteMatch } from 'react-router-dom';
import { setIsOpenModalBeforeExit, setOpenSnapshotSavingDialog, setSelectedSnapshotToSwitch } from '../redux/actions';
import { changeSnapshot } from '../../../reducers/tracking/dispatchActionsSwitchSnapshot';
import { VIEWS } from '../../../constants/constants';

export const SaveSnapshotBeforeExit = memo(() => {
  const { nglViewList, getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
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

  const handleOnNo = async () => {
    const projectID = paramsProjectID && paramsProjectID != null ? paramsProjectID : currentProjectID;
    dispatch(setIsOpenModalBeforeExit(false));
    await dispatch(changeSnapshot(projectID, snapshotID, nglViewList, stage));

    dispatch(setSelectedSnapshotToSwitch(null));
    dispatch(setIsOpenModalBeforeExit(false));
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
