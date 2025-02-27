import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  ClickAwayListener,
  IconButton,
  MenuItem,
  Tooltip,
  Typography,
  Paper,
  Modal,
  FormHelperText
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Button } from '../../common/Inputs/Button';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import HelpIcon from '@material-ui/icons/Help';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import {
  setJobConfigurationDialogOpen,
  setJobLauncherDialogOpen,
  setJobLauncherData,
  refreshJobsData,
  setJobList
} from '../../projects/redux/actions';
import {
  getJobConfigurationsFromServer,
  getSnapshotAttributesByID,
  jobFileTransfer
} from '../../projects/redux/dispatchActions';
import { areArraysSame } from '../../../utils/array';
import { setDisableRedirect, setDontShowShareSnapshot } from '../../snapshot/redux/actions';
import { changeSnapshot, createNewSnapshot } from '../../snapshot/redux/dispatchActions';
import { NglContext } from '../../nglView/nglProvider';
import moment from 'moment';
import { SnapshotType } from '../../projects/redux/constants';
import { DJANGO_CONTEXT } from '../../../utils/djangoContext';
import { VIEWS } from '../../../constants/constants';
import { getSquonkProject } from '../redux/dispatchActions';
import { extractRelativePath } from './utils';
import { base_data_url } from '../../routes/constants';

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

  sideBody: {
    width: '50%',
    padding: '5px'
  },

  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'start'
  },

  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%'
  },

  marginTop5: {
    marginTop: '5px'
  },

  fontWeightBold: {
    fontWeight: 'bold'
  },

  marginLeft10: {
    marginLeft: '10px'
  },

  width70: {
    width: '70%'
  },

  width30: {
    width: '30%'
  },

  width60: {
    width: '60%'
  },

  floatLeft: {
    float: 'left'
  },

  floatRight: {
    float: 'right'
  },

  radioPlusDropdown: {
    width: '30%',
    marginTop: '20px'
  },

  typographyH: {
    marginTop: '10px',
    fontWeight: 'bold'
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

const JobConfigurationDialog = ({ snapshots }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLaunchButtonDisabled, setIsLaunchButtonDisabled] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };
  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const jobConfigurationDialogOpen = useSelector(state => state.projectReducers.jobConfigurationDialogOpen);

  const allMolecules = useSelector(state => state.apiReducers.all_mol_lists);
  const allDatasets = useSelector(state => state.datasetsReducers.moleculeLists);
  const selectedDatasetCompounds = useSelector(state => state.datasetsReducers.compoundsToBuyDatasetMap);
  const datasetVisibleDatasetCompoundsList = useSelector(state => state.datasetsReducers.ligandLists);

  const currentSessionProject = useSelector(state => state.projectReducers.currentProject);
  const currentProject = useSelector(state => state.targetReducers.currentProject);
  // if (!currentProject) {
  //   setErrorMsg('No project selected, please navigate to landing page and select a target.');
  // }
  const currentSnapshotID = useSelector(state => state.projectReducers.currentSnapshot.id);
  const currentSnapshot = snapshots?.[currentSnapshotID];
  const targetId = useSelector(state => state.apiReducers.target_on);

  const { nglViewList, getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

  // get ids of selected/visible inputs
  const currentSnapshotSelectedCompoundsIDs = useSelector(state => state.selectionReducers.moleculesToEdit);
  const currentSnapshotVisibleCompoundsIDs = useSelector(state => state.selectionReducers.fragmentDisplayList);

  const getMoleculeTitle = title => {
    return title.replace(new RegExp(':.*$', 'i'), '');
  };

  const jobList = useSelector(state => state.projectReducers.jobList);

  useEffect(() => {
    dispatch(getJobConfigurationsFromServer()).then(jobs => {
      dispatch(setJobList(jobs));
    });
  }, []);

  // if (currentProject && !currentProject.user_can_use_squonk) {
  //   setErrorMsg(
  //     `You do not have permission to use the Squonk job launcher for ${currentProject?.target_access_string}`
  //   );
  // }

  const createSnapshot = async () => {
    // Prepare snapshot data
    const title = moment().format('-- YYYY-MM-DD -- HH:mm:ss');
    const description = `snapshot generated by ${DJANGO_CONTEXT['username']}`;
    const type = SnapshotType.MANUAL;
    const author = DJANGO_CONTEXT['pk'] || null;
    const parent = currentSnapshot.id;
    const session_project = currentSessionProject.projectID;

    // Prevents redirect and displaying of share snapshot dialog
    dispatch(setDisableRedirect(true));
    dispatch(setDontShowShareSnapshot(true));

    return dispatch(
      createNewSnapshot({
        title,
        description,
        type,
        author,
        parent,
        session_project,
        nglViewList,
        stage,
        overwriteSnapshot: false,
        createDiscourse: true
      })
    )
      .then(snapshotId => {
        return dispatch(getSnapshotAttributesByID(snapshotId));
      })
      .then(snapshot => {
        dispatch(refreshJobsData());
        return snapshot;
      });
  };

  const validate = values => {
    const errors = {};

    if (values.job === '') {
      errors.job = 'Required';
    }

    return errors;
  };

  const onSubmitForm = async ({ job, inputs, snapshot }) => {
    try {
      setIsLaunchButtonDisabled(true);
      let chosenLHSCompounds = null;
      // TODO: chosenRHSCompounds
      let chosenRHSCompounds = null;
      // Used for attaching a job to the specified snapshot
      let chosenSnapshot = null;
      if (inputs === 'snapshot') {
        chosenSnapshot = snapshot;
        if (!snapshot.additional_info) {
          chosenSnapshot = await createSnapshot();
          dispatch(changeSnapshot(currentSessionProject.projectID, chosenSnapshot.id, stage, true));
          const currentSnapshotSelectedCompounds = allMolecules
            .filter(molecule => currentSnapshotSelectedCompoundsIDs.includes(molecule.id))
            .map(molecule => molecule /*.code*/);

          const currentSnapshotSelectedDatasetsCompounds = [];
          Object.keys(selectedDatasetCompounds).map(datasetName => {
            const selectedCompoundIds = selectedDatasetCompounds[datasetName];
            const datasetCompounds = allDatasets[datasetName];
            const selectedCompoundsNames = datasetCompounds
              .filter(cmp => selectedCompoundIds.includes(cmp.id))
              .map(cmp => cmp.name);
            currentSnapshotSelectedDatasetsCompounds.push(...selectedCompoundsNames);
          });
          chosenLHSCompounds = currentSnapshotSelectedCompounds;
          chosenRHSCompounds = currentSnapshotSelectedDatasetsCompounds;
        } else {
          chosenLHSCompounds = allMolecules.filter(m =>
            snapshot.additional_info.currentSnapshotSelectedCompounds.includes(m.code)
          );
        }
        const savedSelection = [];
        Object.keys(chosenSnapshot.additional_info.currentSnapshotSelectedDatasetsCompounds).map(datasetName => {
          const selectedCompoundNames =
            chosenSnapshot.additional_info.currentSnapshotSelectedDatasetsCompounds[datasetName];
          savedSelection.push(...selectedCompoundNames);
        });
        chosenRHSCompounds = savedSelection;
      } else if (inputs === 'selected-inputs') {
        const currentSnapshotSelectedCompounds = allMolecules
          .filter(molecule => currentSnapshotSelectedCompoundsIDs.includes(molecule.id))
          .map(molecule => molecule /*.code*/);

        const currentSnapshotSelectedDatasetsCompounds = [];
        Object.keys(selectedDatasetCompounds).map(datasetName => {
          const selectedCompoundIds = selectedDatasetCompounds[datasetName];
          const datasetCompounds = allDatasets[datasetName];
          const selectedCompoundsNames = datasetCompounds
            .filter(cmp => selectedCompoundIds.includes(cmp.id))
            .map(cmp => cmp.name);
          currentSnapshotSelectedDatasetsCompounds.push(...selectedCompoundsNames);
        });

        const savedSelection = [];
        if (currentSnapshot.additional_info) {
          Object.keys(currentSnapshot.additional_info.currentSnapshotSelectedDatasetsCompounds).map(datasetName => {
            const selectedCompoundNames =
              currentSnapshot.additional_info.currentSnapshotSelectedDatasetsCompounds[datasetName];
            savedSelection.push(...selectedCompoundNames);
          });
        }

        console.log('onSubmitForm checkpoint');

        const currentSnapshotSavedSelectedLHSObs = allMolecules.filter(m =>
          currentSnapshot.additional_info.currentSnapshotSelectedCompounds.includes(m.code)
        );
        // In case the selection is different from the one saved with the snapshot, create a new snapshot with the current selection
        if (
          !currentSnapshot.additional_info ||
          !areArraysSame(currentSnapshotSavedSelectedLHSObs, currentSnapshotSelectedCompounds)
          // || !areArraysSame(savedSelection, currentSnapshotSelectedDatasetsCompounds)
        ) {
          chosenSnapshot = await createSnapshot();
          dispatch(changeSnapshot(currentSessionProject.projectID, chosenSnapshot.id, stage, true));
          chosenLHSCompounds = currentSnapshotSelectedCompounds;
          chosenRHSCompounds = currentSnapshotSelectedDatasetsCompounds;
        } else {
          chosenSnapshot = currentSnapshot;
          chosenLHSCompounds = currentSnapshotSelectedCompounds; //allMolecules.filter(
          //   m => m.code === currentSnapshot.additional_info.currentSnapshotSelectedCompounds
          // );
          chosenRHSCompounds = savedSelection;
        }
      } else if (inputs === 'visible-inputs') {
        const currentSnapshotVisibleCompounds = allMolecules
          .filter(molecule => currentSnapshotVisibleCompoundsIDs.includes(molecule.id))
          .map(molecule => molecule /*.code*/);

        const currentSnapshotVisibleDatasetCompounds = [];
        Object.keys(datasetVisibleDatasetCompoundsList).map(datasetName => {
          const visibleCompoundIds = datasetVisibleDatasetCompoundsList[datasetName];
          const datasetCompounds = allDatasets[datasetName];
          const visibleCompoundsNames = datasetCompounds
            .filter(cmp => visibleCompoundIds.includes(cmp.id))
            .map(cmp => cmp.name);
          currentSnapshotVisibleDatasetCompounds.push(...visibleCompoundsNames);
        });

        const savedVisibleCompounds = [];
        if (currentSnapshot.additional_info) {
          Object.keys(currentSnapshot.additional_info?.currentSnapshotVisibleDatasetsCompounds).map(datasetName => {
            const visibleCompoundsNames =
              currentSnapshot.additional_info.currentSnapshotVisibleDatasetsCompounds[datasetName];
            savedVisibleCompounds.push(...visibleCompoundsNames);
          });
        }

        console.log('onSubmitForm checkpoint');

        // In case the visible mols are different from the ones saved with the snapshot, create a new snapshot with the current visible mols
        const currentSnapshotSavedSelectedLHSObs = allMolecules.filter(m =>
          currentSnapshot.additional_info.currentSnapshotVisibleCompounds.includes(m.code)
        );
        if (
          !currentSnapshot.additional_info ||
          !areArraysSame(currentSnapshotSavedSelectedLHSObs, currentSnapshotVisibleCompounds) ||
          !areArraysSame(savedVisibleCompounds, currentSnapshotVisibleDatasetCompounds)
        ) {
          chosenSnapshot = await createSnapshot();
          dispatch(changeSnapshot(currentSessionProject.projectID, chosenSnapshot.id, stage, true));
          chosenLHSCompounds = currentSnapshotVisibleCompounds;
          chosenRHSCompounds = currentSnapshotVisibleDatasetCompounds;
        } else {
          chosenSnapshot = currentSnapshot;
          chosenLHSCompounds = currentSnapshotVisibleCompounds; //allMolecules.filter(
          //   m => m.code === currentSnapshot.additional_info.currentSnapshotSelectedCompounds
          // );
          chosenRHSCompounds = savedVisibleCompounds;
        }
      }

      //reconstruct lhs molecules
      // const chosenLHSCompoundsFull = chosenLHSCompounds.map(molecule => {
      //   return allMolecules.find(mol => mol.code === molecule);
      // });
      // Remove the unnecessary part from protein_code
      // chosenLHSCompounds = chosenLHSCompounds.map(molecule => getMoleculeTitle(molecule));

      if (chosenLHSCompounds.length > 0) {
        // Close the actual pop up window
        // dispatch(setJobConfigurationDialogOpen(false));

        const getFilteredJob = job => {
          return jobList && jobList.find(jobFiltered => job === jobFiltered.id);
        };

        const repsonse = await jobFileTransfer({
          snapshot: chosenSnapshot.id,
          access: currentProject.id,
          session_project: currentSessionProject.projectID,
          target: targetId,
          squonk_project: dispatch(getSquonkProject()),
          proteins: chosenLHSCompounds.map(m => extractRelativePath(m.apo_desolv_file, base_data_url)).join(),
          compounds: chosenLHSCompounds.map(m => extractRelativePath(m.ligand_mol, base_data_url)).join()
        });

        let transfer_root = null;
        let transfer_target = null;
        if (repsonse.data.transfer_root && repsonse.data.transfer_target) {
          transfer_root = repsonse.data.transfer_root;
          transfer_target = repsonse.data.transfer_target;
        }

        // Set options for second window
        dispatch(
          setJobLauncherData({
            job: getFilteredJob(job),
            snapshot: chosenSnapshot,
            // transfer_root: transfer_root,
            // transfer_target: transfer_target,
            inputs_dir: `${transfer_root}`,
            // Prepares data for expanding, see comments in JobFragmentProteinSelectWindow
            data: {
              // lhs: chosenLHSCompounds.map(compound => getMoleculeEnumName(compound))
              lhs: chosenLHSCompounds
            }
          })
        );

        setErrorMsg(null);
        setIsError(false);
        dispatch(setJobConfigurationDialogOpen(false));
        dispatch(setJobLauncherDialogOpen(true));
      } else {
        setErrorMsg("There's no selected inputs to run the job.");
        setIsError(true);
      }
      setIsLaunchButtonDisabled(false);
    } catch (err) {
      setIsLaunchButtonDisabled(false);
      console.error(err);
      setErrorMsg(err.response.data);
      setIsError(true);
    }
  };

  const onClose = () => {
    setErrorMsg(null);
    setIsError(false);
    dispatch(setJobConfigurationDialogOpen(false));
  };

  return (
    <Modal open={jobConfigurationDialogOpen} onClose={onClose}>
      <div className={classes.jobLauncherPopup}>
        <div className={classes.topPopup}>
          <span>Job configuration [EXPERIMENTAL]</span>
          <button className={classes.popUpButton} onClick={onClose}>
            X
          </button>
        </div>
        <div className={classes.bodyPopup}>
          <Formik
            initialValues={{ inputs: 'snapshot', snapshot: '', job: '' }}
            onSubmit={onSubmitForm}
            validate={validate}
          >
            {({ values, errors }) => (
              <Form className={classes.flexRow}>
                <div className={classes.sideBody}>
                  <Field
                    component={TextField}
                    type="text"
                    name="job"
                    select
                    variant="standard"
                    margin="none"
                    label="Fragment network merges"
                    InputLabelProps={{ shrink: true }}
                    className={classes.width70}
                    disabled={false}
                  >
                    {jobList &&
                      Object.values(jobList).map(item => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.slug}
                        </MenuItem>
                      ))}
                  </Field>
                  <ClickAwayListener onClickAway={handleTooltipClose}>
                    <Tooltip
                      PopperProps={{
                        disablePortal: true
                      }}
                      onClose={handleTooltipClose}
                      open={open}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      title="Morbi ac enim quis magna lobortis pulvinar non id enim."
                    >
                      <IconButton aria-label="Help" size="medium" color="default" onClick={handleTooltipOpen}>
                        <HelpIcon />
                      </IconButton>
                    </Tooltip>
                  </ClickAwayListener>
                  <Typography className={classes.typographyH}>Description</Typography>
                  <Typography align="justify" className={classes.marginTop5}>
                    {jobList &&
                      jobList.filter(jobType => jobType['id'] === values.job).map(jobType => jobType['description'])}
                  </Typography>
                </div>
                <div className={classes.sideBody}>
                  <Typography className={classes.fontWeightBold}>Inputs:</Typography>
                  <Box className={classes.flexColumn}>
                    <div className={classes.flexRow}>
                      <div className={classes.radioPlusDropdown}>
                        <Field type="radio" name="inputs" value="snapshot" />
                        Snapshot
                      </div>

                      <Field
                        component={TextField}
                        type="text"
                        name="snapshot"
                        select
                        variant="standard"
                        margin="none"
                        InputLabelProps={{ shrink: true }}
                        className={(classes.marginLeft10, classes.width60)}
                        label="Choose the snapshot"
                        disabled={values.inputs !== 'snapshot'}
                        // validate={value => {
                        //   if (values.inputs === 'snapshot' && !value.additional_info) {
                        //     return `Snapshot ${value.title} is not compatible with job functionality. You can try to select the snapshot directly and choose the option 'selected molecules'`;
                        //   }
                        //   // TODO: what to do if snapshot has nothing selected?
                        // }}
                      >
                        {Object.values(snapshots).map(item => (
                          <MenuItem key={item.id} value={item}>
                            {item.title}
                          </MenuItem>
                        ))}
                      </Field>
                    </div>
                    <div>
                      <Field
                        type="radio"
                        name="inputs"
                        value="selected-inputs"
                        // validate={() => {
                        //   if (values.inputs === 'selected-inputs' && !currentSnapshot?.additional_info) {
                        //     return "It can't be determined if the selection was changed from the saved selection in current snapshot. If you want to be sure please save current selection as a new snapshot and continue.";
                        //   }
                        // }}
                      />
                      Selected inputs
                      {errors.inputs && <FormHelperText error={true}>{errors.inputs}</FormHelperText>}
                    </div>
                    <div>
                      <Field type="radio" name="inputs" value="visible-inputs" />
                      Visible inputs
                    </div>
                  </Box>
                  {isError && (
                    <Paper variant="elevation" rounded="true" className={classes.errorMsg}>
                      {errorMsg?.message ?? errorMsg}
                    </Paper>
                  )}
                  <Button color="primary" size="large" type="submit" disabled={isLaunchButtonDisabled}>
                    Launch
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </Modal>
  );
};

export default JobConfigurationDialog;
