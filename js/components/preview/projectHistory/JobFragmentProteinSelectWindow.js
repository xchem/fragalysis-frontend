import React, { useState } from 'react';
import { Modal, Paper } from '@material-ui/core';
import { Button } from '../../common/Inputs/Button';
import { makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setJobFragmentProteinSelectWindowAnchorEl } from '../../projects/redux/actions';
import { MuiForm as JSONForm } from '@rjsf/material-ui';
import jobconfig from '../../../../jobconfigs/fragalysis-job-spec.json';
import { jobRequest } from '../../projects/redux/dispatchActions';
import { setJobLauncherSquonkUrl, setRefreshJobsData } from '../../projects/redux/actions';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { getSquonkProject } from '../redux/dispatchActions';

const useStyles = makeStyles(theme => ({
  jobLauncherPopup: {
    width: '750px',
    borderRadius: '5px',
    border: '1px solid #000',
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '20%',
    left: '30%'
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

const JobFragmentProteinSelectWindow = () => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const jobFragmentProteinSelectWindowAnchorEl = useSelector(
    state => state.projectReducers.jobFragmentProteinSelectWindowAnchorEl
  );

  const [isSubmitted, setIsSubmittet] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const jobLauncherSquonkUrl = useSelector(state => state.projectReducers.jobLauncherSquonkUrl);

  const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);
  const targetId = useSelector(state => state.apiReducers.target_on);

  // Get data from previous window
  const jobLauncherData = useSelector(state => state.projectReducers.jobLauncherData);

  const refreshJobsData = useSelector(state => state.projectReducers.refreshJobsData);

  // Remove tags from title
  const target_on_name = useSelector(state => state.apiReducers.target_on_name);
  const getMoleculeTitle = title => {
    let newTitle = title.replace(new RegExp(`${target_on_name}-`, 'i'), '');
    newTitle = newTitle.replace(new RegExp(':.*$', 'i'), '');

    return newTitle;
  };

  // Prepare options for multiselect field
  const getMoleculesShortNames = () => {
    if (jobLauncherData !== null && jobLauncherData.chosenCompounds !== null)
      return jobLauncherData.chosenCompounds.map(compound => getMoleculeTitle(compound));
    else return null;
  };
  const getMoleculesEnums = () => {
    if (jobLauncherData !== null && jobLauncherData.chosenCompounds !== null) return jobLauncherData.chosenCompounds;
    else return [''];
  };

  const compoundsOptions = {
    type: 'string',
    enum: getMoleculesEnums(),
    enumNames: getMoleculesShortNames()
  };

  const selects = {
    fragments: {
      title: 'Fragment molecules',
      type: 'array',
      uniqueItems: true,
      items: {
        ...compoundsOptions
      }
    },
    protein: { title: 'PDB file for protein', ...compoundsOptions }
  };

  const getSelects = () => {
    if (jobLauncherData !== null && jobLauncherData.job !== null && jobLauncherData.job.slug === 'fragmenstein-combine')
      return selects;
    else return {};
  };

  const options = JSON.parse(jobconfig.variables.options);
  const outputs = JSON.parse(jobconfig.variables.outputs);
  // Prepare schema for FORM
  const schema = {
    type: options.type,
    required: [...options.required],
    properties: { ...getSelects(), ...options.properties, ...outputs.properties }
  };

  const getFragmentTemplate = fragment => {
    // return `/fragalysis-files/${target_on_name}/${fragment}.mol`;
    return `fragalysis-files/${target_on_name}/${fragment}.mol`;
  };

  const getProteinTemplate = protein => {
    // return `/fragalysis-files/${target_on_name}/${protein}-apo_desolv.pdb`;
    return `fragalysis-files/${target_on_name}/${protein}_apo-desolv.pdb`;
  };

  const onSubmitForm = event => {
    let formData = event.formData;
    // map fragments to template
    if (formData.fragments !== null) {
      formData.fragments = formData.fragments.map(fragment => getFragmentTemplate(fragment));
    }

    // map proteins to template
    if (formData.protein !== null) {
      formData.protein = getProteinTemplate(formData.protein);
    }

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
        variables: formData
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
      });

    setIsSubmittet(true);
  };

  return (
    <Modal open={!!jobFragmentProteinSelectWindowAnchorEl} hideBackdrop>
      <div className={classes.jobLauncherPopup}>
        <div className={classes.topPopup}>
          <span>Job launcher</span>
          <button
            className={classes.popUpButton}
            onClick={() => {
              setErrorMsg(null);
              setIsError(false);
              setIsSubmittet(false);
              dispatch(setJobLauncherSquonkUrl(null));
              dispatch(setJobFragmentProteinSelectWindowAnchorEl(null));
            }}
          >
            X
          </button>
        </div>
        <div className={classes.bodyPopup}>
          <JSONForm schema={schema} onSubmit={onSubmitForm} onChange={event => {}}>
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
            <Button disabled={isSubmitted} type="submit" color="primary" size="large">
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

export default JobFragmentProteinSelectWindow;
