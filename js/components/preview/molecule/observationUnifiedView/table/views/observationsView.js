import { Button, GridLegacy as Grid } from '@mui/material';
import { makeStyles } from '../../../../../../ui/styles';
import classNames from 'classnames';
import React, { memo } from 'react';
import {
  setObservationDialogAction,
  setObservationsForLHSCmp,
  setOpenObservationsDialog,
  setPoseIdForObservationsDialog
} from '../../../../../../reducers/selection/actions';
import { useDispatch, useSelector } from 'react-redux';
import RichTooltip from '../../../../../tooltip/RichTooltip';

const useStyles = makeStyles(theme => ({
  contColButtonMenu: {
    height: '100%',
    // width: '100%',
    minWidth: 20,
    width: 22,
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
    paddingBottom: 0,
    paddingTop: 0,
    fontWeight: 'bold',
    fontSize: 14,
    borderRadius: 0,
    borderColor: theme.palette.background.divider,
    // backgroundColor: 'orange',
    '&:hover': {
      // backgroundColor: 'orange'
      // color: theme.palette.primary.contrastText
    },
    '&:disabled': {
      borderRadius: 0,
      borderColor: 'darkorange'
    }
  },
  contColButtonMenuSelected: {
    backgroundColor: 'darkorange',
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: 'darkorange'
      // color: theme.palette.black
    }
  }
}));

export const ObservationsView = memo(({ data, observations, isAnyObservationOn, handleRef }) => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const isObservationDialogOpen = useSelector(state => state.selectionReducers.isObservationDialogOpen);
  const poseIdForObservationsDialog = useSelector(state => state.selectionReducers.poseIdForObservationsDialog);

  return (
    <Grid container direction="column" justifyContent="center" alignItems="stretch" wrap="nowrap">
      <Grid item xs>
        <RichTooltip path="showObservations">
          <Button
            id="open-observation-button"
            variant="outlined"
            className={classNames(classes.contColButtonMenu, {
              [classes.contColButtonMenuSelected]: isAnyObservationOn && observations.length > 1
            })}
            style={{
              backgroundColor: `color-mix(in lch, lightgrey, orange ${(observations.length > 10
                ? 10
                : observations.length) * 10}%)`
            }}
            onClick={() => {
              // setLoadingInspiration(true);

              // do not close modal on pose change
              if (!isObservationDialogOpen || poseIdForObservationsDialog !== data.id) {
                dispatch(setObservationsForLHSCmp(observations));
              }
              if (
                poseIdForObservationsDialog !== data.id ||
                poseIdForObservationsDialog === 0 ||
                (poseIdForObservationsDialog === data.id && !isObservationDialogOpen)
              ) {
                dispatch(setOpenObservationsDialog(true));
                dispatch(setObservationDialogAction(data.id, observations, true, 0, []));
              } else {
                dispatch(setOpenObservationsDialog(false));
                dispatch(setObservationDialogAction(0, [], false, data.id, observations));
              }
              dispatch(setPoseIdForObservationsDialog(data.id));

              handleRef();
              // setLoadingInspiration(false);
            }}
            disabled={observations.length <= 0}
          >
            {observations?.length}
          </Button>
        </RichTooltip>
      </Grid>
    </Grid>
  );
});
