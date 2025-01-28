import React, { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid, makeStyles, Checkbox, Typography, FormControlLabel } from '@material-ui/core';
import { Button, Modal } from '../../common';
import { setSearchSettings } from '../../../reducers/selection/actions';

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

export const SearchSettingsDialog = memo(({ openDialog, setOpenDialog }) => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const searchSettings = useSelector(state => state.selectionReducers.searchSettings);

  const [shortcode, setShortcode] = useState(searchSettings.searchBy.shortcode);
  const [aliases, setAliases] = useState(searchSettings.searchBy.aliases);
  const [compoundId, setCompoundId] = useState(searchSettings.searchBy.compoundId);

  const handleCloseModal = () => {
    setOpenDialog(false);
  };

  const handleSaveButton = () => {
    dispatch(setSearchSettings({ searchBy: { shortcode, aliases, compoundId } }));
    setOpenDialog(false);
  };

  return (
    <Modal open={openDialog}>
      <>
        <Typography variant="h4">Search settings</Typography>
        <Typography variant="subtitle1" gutterBottom className={classes.margin}>
          Search by:
        </Typography>
        <Grid container direction="column" className={classes.body}>
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  checked={shortcode}
                  name="event"
                  color="primary"
                  onChange={() => {
                    setShortcode(prev => !prev);
                  }}
                />
              }
              label="Observation shortcode"
              labelPlacement="end"
              className={classes.checkbox}
            />
          </Grid>
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  checked={aliases}
                  name="sigma"
                  color="primary"
                  onChange={() => {
                    setAliases(prev => !prev);
                  }}
                />
              }
              label="Compound aliases"
              labelPlacement="end"
              className={classes.checkbox}
            />
          </Grid>
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  checked={compoundId}
                  name="diff"
                  color="primary"
                  onChange={() => {
                    setCompoundId(prev => !prev);
                  }}
                />
              }
              label="Compound ID"
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
