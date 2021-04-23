import React, { memo, useState } from 'react';
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

export const DensityMapsModal = memo(({ openDialog, setOpenDialog, data, setDensity }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const [valueSigmaa, setValueSigmaa] = useState(false);
  const [valueDiff, setValueDiff] = useState(false);
  const proteinData = data.proteinData;

  const toggleRenderSigmaaMap = () => {
    let render = (proteinData.render_sigmaa && proteinData.render_sigmaa) || false;
    proteinData.render_sigmaa = !render;
    setValueSigmaa(!valueSigmaa);
  };

  const toggleRenderDiffMap = () => {
    let render = (proteinData.render_diff && proteinData.render_diff) || false;
    proteinData.render_diff = !render;
    setValueDiff(!valueDiff);
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
              label="Render map sigma"
              labelPlacement="end"
              className={classes.checkbox}
            />
          </Grid>
          <Grid item>
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
          </Grid>
        </Grid>
        <Grid container justify="flex-end" direction="row">
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
