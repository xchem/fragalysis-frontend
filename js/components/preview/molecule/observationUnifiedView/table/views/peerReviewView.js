/**
 * Row in Hit navigator
 */

import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import { Grid, makeStyles } from '@material-ui/core';

import { appendToMolListToEdit, removeFromMolListToEdit } from '../../../../../../reducers/selection/actions';
import MoleculeSelectCheckbox from '../../../moleculeView/moleculeSelectCheckbox';
import { QualityStatusWrapper } from '../../../moleculeView/qualityStatus/QualityStatusWrapper';

const useStyles = makeStyles(theme => ({
  site: {
    width: theme.spacing(3),
    textAlign: 'center',
    backgroundColor: theme.palette.background.default,
    border: `solid 1px`,
    borderColor: theme.palette.background.divider,
    paddingBottom: theme.spacing(1) / 4
  },
  checkbox: {
    padding: 0
  },
  rank: {
    fontStyle: 'italic',
    fontSize: 7
  }
}));

export const PeerReviewView = memo(({ data, index, selected, observations, mainObservation }) => {
  const currentID = (data && data.id) || undefined;
  const classes = useStyles();
  const dispatch = useDispatch();

  return (
    <Grid container justifyContent="space-between" direction="column" className={classes.site}>
      <Grid xs item>
        <MoleculeSelectCheckbox
          id={'peer-review-molecule-selector-checkbox-' + index}
          moleculeID={currentID}
          checked={selected}
          className={classes.checkbox}
          size="small"
          color="primary"
          onChange={e => {
            const result = e.target.checked;
            if (result) {
              if (observations?.length > 0) {
                const mainObs = mainObservation;
                mainObs && dispatch(appendToMolListToEdit(mainObs.id));
              }
              // dispatch(appendToObsCmpListToEdit(currentID));
            } else {
              observations?.forEach(obs => {
                dispatch(removeFromMolListToEdit(obs.id));
              });
              // dispatch(removeFromObsCmpListToEdit(currentID));
            }
          }}
        />
      </Grid>
      <Grid xs item className={classes.rank} container justifyContent="center">
        <QualityStatusWrapper data={data} />
      </Grid>
      <Grid xs item className={classes.rank}>
        {index + 1}.
      </Grid>
    </Grid>
  );
});
