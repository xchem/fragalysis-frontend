import { Popper } from '@material-ui/core';
import React from 'react';
import { makeStyles } from '@material-ui/core';
import { Button } from '../../common/Inputs/Button';
import { useDispatch, useSelector } from 'react-redux';
import { setIsOpenModalBeforeExit, setSelectedSnapshotToSwitch } from '../../snapshot/redux/actions';
import { setJobPopUpAnchorEl } from '../../projects/redux/actions';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { loadNewDatasetsAndCompounds } from '../../datasets/redux/dispatchActions';

const useStyles = makeStyles(theme => ({
  jobPopup: {
    width: '300px',
    borderRadius: '5px',
    border: '1px solid #000',
    display: 'flex',
    flexDirection: 'column'
  },

  topPopup: {
    width: '100%',
    borderRadius: '5px 5px 0 0',
    backgroundColor: '#3f51b5',
    color: '#fff',
    paddingLeft: '20px',
    lineHeight: '30px'
  },

  popUpButton: {
    borderRadius: '0 5px 0 0',
    backgroundColor: '#d33f3f',
    color: '#fff',
    padding: '5px 10px 5px 10px',
    border: 'none',
    float: 'right',
    height: '30px',
    '&:hover': {
      borderRadius: '0 5px 0 0',
      backgroundColor: '#aa3939',
      color: '#fff',
      cursor: 'pointer'
    }
  },

  bodyPopup: {
    padding: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '0 0 5px 5px'
  }
}));

const JobPopup = ({ jobPopUpAnchorEl, jobPopupInfo }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { jobInfo, hash } = jobPopupInfo;
  let jobLauncherSquonkUrl = null;
  if (jobInfo?.squonk_url_ext) {
    jobLauncherSquonkUrl = DJANGO_CONTEXT['squonk_ui_url'] + jobInfo?.squonk_url_ext.replace('data-manager-ui', '');
  }

  const target_on = useSelector(state => state.apiReducers.target_on);

  const getStatus = jobInfo => {
    let status = 'UNKNOWN';
    if (jobInfo?.upload_status === 'FAILURE') {
      status = 'UPLOADF FAILED';
    } else {
      status = jobInfo ? jobInfo.job_status : 'UNKNOWN';
    }

    return status;
  };

  return (
    <Popper
      open={!!jobPopUpAnchorEl}
      onClose={() => dispatch(setJobPopUpAnchorEl(null))}
      anchorEl={jobPopUpAnchorEl}
      placement="right"
    >
      <div className={classes.jobPopup}>
        <div className={classes.topPopup}>
          <span>Job</span>
          <button className={classes.popUpButton} onClick={() => dispatch(setJobPopUpAnchorEl(null))}>
            X
          </button>
        </div>
        <div className={classes.bodyPopup}>
          <p>
            Status: <strong>{getStatus(jobInfo)}</strong>
          </p>
          <p>
            Parameters: <strong></strong>
          </p>
          <p>
            Results: <strong></strong>
          </p>
          <Button
            color="primary"
            onClick={() => {
              dispatch(setSelectedSnapshotToSwitch(hash));
              dispatch(setIsOpenModalBeforeExit(true));
            }}
          >
            Open associated snapshot
          </Button>
          <Button
            key={jobInfo?.id}
            onClick={() => {
              if (jobLauncherSquonkUrl) {
                window.open(jobLauncherSquonkUrl, '_blank');
              }
            }}
            color="secondary"
            size="large"
          >
            Open in Squonk
          </Button>
        </div>
      </div>
    </Popper>
  );
};

export default JobPopup;
