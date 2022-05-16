import React, { useState } from 'react';
import { Modal, Paper } from '@material-ui/core';
import { Button } from '../../common/Inputs/Button';
import { makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setJobLauncherDialogOpen } from '../../projects/redux/actions';
import { MuiForm as JSONForm } from '@rjsf/material-ui';
// eslint-disable-next-line import/extensions
import jobconfig from '../../../../jobconfigs/fragalysis-job-spec.json';
import { jobRequest } from '../../projects/redux/dispatchActions';
import { setJobLauncherSquonkUrl, setRefreshJobsData } from '../../projects/redux/actions';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';

const useStyles = makeStyles(theme => ({
  jobLauncherPopup: {
    width: '750px',
    borderRadius: '5px',
    border: '1px solid #000',
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },

  topPopup: {
    width: '100%',
    borderRadius: '5px 5px 0 0',
    backgroundColor: '#3f51b5',
    color: '#fff',
    paddingLeft: '10px',
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
  },

  successMsg: {
    padding: '10px',
    background: '#66BB6A',
    color: '#ffffff',
    fontWeight: 'bold'
  },

  errorMsg: {
    padding: '10px',
    background: 'red',
    color: '#ffffff',
    fontWeight: 'bold'
  }
}));

const JobLauncherDialog = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const jobLauncherDialogOpen = useSelector(state => state.projectReducers.jobLauncherDialogOpen);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const jobLauncherSquonkUrl = useSelector(state => state.projectReducers.jobLauncherSquonkUrl);

  const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);
  const targetId = useSelector(state => state.apiReducers.target_on);

  // Get data from previous window
  const jobLauncherData = useSelector(state => state.projectReducers.jobLauncherData);

  const refreshJobsData = useSelector(state => state.projectReducers.refreshJobsData);

  // Merges job definitions with fragalysis-jobs definitions
  const getDefinition = (configDefinitions, overrideDefinitions) => {
    const mergedDefinitions = { ...configDefinitions };

    Object.entries(overrideDefinitions).forEach(([key, overrideDefinition]) => {
      let mergedDefinition = mergedDefinitions[key] || {};

      const { from, ...rest } = overrideDefinition;

      // If fragalysis-jobs definitions contain from, expand it from the provided data
      if (!!from) {
        const items = jobLauncherData?.data?.[from] || {};
        if (rest.type === 'array') {
          mergedDefinition = { ...mergedDefinition, items };
        } else {
          mergedDefinition = { ...mergedDefinition, ...items };
        }
      }

      mergedDefinitions[key] = { ...mergedDefinition, ...rest };
    });

    return mergedDefinitions;
  };

  const inputs = JSON.parse(jobconfig.variables.inputs);
  const options = JSON.parse(jobconfig.variables.options);
  const outputs = JSON.parse(jobconfig.variables.outputs);

  // Prepare schema for FORM
  const schema = {
    type: options.type,
    required: [...(inputs.required || []), ...(options.required || []), ...(outputs.required || [])],
    properties: {
      ...getDefinition(inputs.properties || {}, jobconfig['fragalysis-jobs'].inputs || {}),
      ...getDefinition(options.properties || {}, jobconfig['fragalysis-jobs'].options || {}),
      ...getDefinition(outputs.properties || {}, jobconfig['fragalysis-jobs'].outputs || {})
    }
  };

  // Used to preserve data when clicking the submit button, without it the form resets on submit
  const [formData, setFormData] = useState({});

  const onSubmitForm = event => {
    setIsSubmitting(true);

    // Reset state of errors and Squonk URL
    setErrorMsg(null);
    setIsError(false);
    dispatch(setJobLauncherSquonkUrl(null));

    jobRequest({
      squonk_job_name: 'fragmenstein-combine',
      snapshot: currentSnapshotID,
      target: targetId,
      // squonk_project: dispatch(getSquonkProject()),
      squonk_project: 'project-e1ce441e-c4d1-4ad1-9057-1a11dbdccebe',
      squonk_job_spec: JSON.stringify({
        collection: 'fragmenstein',
        job: 'fragmenstein-combine',
        version: '1.0.0',
        variables: event.formData
      })
    })
      .then(resp => {
        setErrorMsg(null);
        setIsError(false);
        dispatch(
          setJobLauncherSquonkUrl(
            DJANGO_CONTEXT['squonk_ui_url'] + resp.data.squonk_url_ext.replace('data-manager-ui', '')
          )
        );
        dispatch(setRefreshJobsData(!refreshJobsData));
      })
      .catch(err => {
        console.log(`Job file transfer failed: ${err}`);
        setErrorMsg(err.response.data?.error ?? 'There was an error launching a job');
        setIsError(true);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const onClose = () => {
    // Reset form data on dialog close
    setFormData({});
    setErrorMsg(null);
    setIsError(false);
    setIsSubmitting(false);
    dispatch(setJobLauncherSquonkUrl(null));
    dispatch(setJobLauncherDialogOpen(false));
  };

  return (
    <Modal open={jobLauncherDialogOpen} onClose={onClose}>
      <div className={classes.jobLauncherPopup}>
        <div className={classes.topPopup}>
          <span>Job launcher</span>
          <button className={classes.popUpButton} onClick={onClose}>
            X
          </button>
        </div>
        <div className={classes.bodyPopup}>
          <JSONForm
            schema={schema}
            onSubmit={onSubmitForm}
            formData={formData}
            onChange={event => {
              setFormData(event.formData);
            }}
          >
            {jobLauncherSquonkUrl && !isError && (
              <Paper variant="elevation" rounded="true" className={classes.successMsg}>
                Job has been launched successfully.
              </Paper>
            )}
            {isError && (
              <Paper variant="elevation" rounded="true" className={classes.errorMsg}>
                {errorMsg}
              </Paper>
            )}
            <Button disabled={isSubmitting} type="submit" color="primary" size="large">
              Submit
            </Button>
            {jobLauncherSquonkUrl && (
              <Button onClick={() => window.open(jobLauncherSquonkUrl, '_blank')} color="secondary" size="large">
                Open in Squonk
              </Button>
            )}
          </JSONForm>
        </div>
      </div>
    </Modal>
  );
};

export default JobLauncherDialog;