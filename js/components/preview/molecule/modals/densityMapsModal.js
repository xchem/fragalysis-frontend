import React, { memo, useLayoutEffect, useState } from 'react';
import Modal from '../../../common/Modal';
import { useDispatch } from 'react-redux';
import { Grid, makeStyles, Checkbox, Typography, FormControlLabel } from '@material-ui/core';
import { Button } from '../../../common/Inputs/Button';

const useStyles = makeStyles(theme => ({
  body: {
    width: '100%',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1)
  },
  margin: {
    marginTop: theme.spacing(1)
  },
  checkbox: {
    margin: theme.spacing(0)
  }
}));

export const DensityMapsModal = memo(({ openDialog, setOpenDialog, data, setDensity, isQualityOn }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [valueSigmaa, setValueSigmaa] = useState(false);
  const [valueDiff, setValueDiff] = useState(false);
  const [valueEvent, setValueEvent] = useState(false);
  const [valueAtomQuality, setValueAtomQuality] = useState(isQualityOn);
  const proteinData = data.proteinData;

  // In case quality gets turned on from elsewhere
  useLayoutEffect(() => {
    setValueAtomQuality(isQualityOn);
  }, [isQualityOn]);

  const toggleRenderSigmaaMap = () => {
    proteinData.render_sigmaa = !proteinData.render_sigmaa;
    setValueSigmaa(!valueSigmaa);
  };

  const toggleRenderDiffMap = () => {
    proteinData.render_diff = !proteinData.render_diff;
    setValueDiff(!valueDiff);
  };

  const toggleRenderEventMap = () => {
    proteinData.render_event = !proteinData.render_event;
    setValueEvent(!valueEvent);
  };

  const toggleRenderAtomQuality = () => {
    const nextValue = !valueAtomQuality;
    proteinData.render_quality = nextValue;
    setValueAtomQuality(nextValue);
  };

  const handleCloseModal = () => {
    dispatch(setOpenDialog(false));
  };

  const handleSaveButton = () => {
    dispatch(setOpenDialog(false));
    setDensity();
  };

  return (
    <Modal open={openDialog}>
      <>
        <Typography variant="h4">Density rendering maps selection</Typography>
        <Typography variant="subtitle1" gutterBottom className={classes.margin}>
          {data.protein_code}
        </Typography>
        <Grid container direction="column" className={classes.body}>
          <Grid item>
            {proteinData && proteinData.event_info && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={valueEvent}
                    name="event"
                    color="primary"
                    onChange={() => {
                      toggleRenderEventMap();
                    }}
                  />
                }
                label="Render map event"
                labelPlacement="end"
                className={classes.checkbox}
              />
            )}
          </Grid>
          <Grid item>
            {proteinData && proteinData.sigmaa_info && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={valueSigmaa}
                    name="sigma"
                    color="primary"
                    onChange={() => {
                      toggleRenderSigmaaMap();
                    }}
                  />
                }
                label="Render map sigmaa"
                labelPlacement="end"
                className={classes.checkbox}
              />
            )}
          </Grid>
          <Grid item>
            {proteinData && proteinData.diff_info && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={valueDiff}
                    name="diff"
                    color="primary"
                    onChange={() => {
                      toggleRenderDiffMap();
                    }}
                  />
                }
                label="Render map diff"
                labelPlacement="end"
                className={classes.checkbox}
              />
            )}
          </Grid>
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  checked={valueAtomQuality}
                  name="diff"
                  color="primary"
                  onChange={() => {
                    toggleRenderAtomQuality();
                  }}
                />
              }
              label="Render atom quality"
              labelPlacement="end"
              className={classes.checkbox}
            />
          </Grid>
        </Grid>
        <Grid container justifyContent="flex-end" direction="row">
          <Grid item>
            <Button color="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
          </Grid>
          <Grid item>
            <Button color="primary" onClick={handleSaveButton}>
              Save
            </Button>
          </Grid>
        </Grid>
      </>
    </Modal>
  );
});
