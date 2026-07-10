import React, { memo } from 'react';
import { GridLegacy as Grid } from '@mui/material';
import { makeStyles } from '../../../ui/styles';
import RefinementOutcome from './refinementOutcome';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%'
  },
  labelItem: {
    color: '#7B7B7B',
    fontSize: '10px',
    margin: theme.spacing(0.5)
  },
  valueItem: {
    marginLeft: theme.spacing(0.25),
    marginRight: theme.spacing(0.25)
  },
  valueElement: {
    width: '16px',
    height: '16px'
  },
  qualCircle: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  qualValue: {
    fontSize: '9px'
  },
  refinementOutcome: {
    paddingTop: theme.spacing(0.5),
    width: 16,
    height: 24
  }
}));

export const molStatusTypes = {
  CONFIDENCE: 'conf',
  QUALITY: 'qual',
  STATUS: 'stat'
};

export default memo(({ type, data }) => {
  const classes = useStyles();

  let valueElement = <div />;
  switch (type) {
    case molStatusTypes.CONFIDENCE:
      valueElement = <div className={classes.valueElement} style={{ backgroundColor: 'green' }} />;
      break;
    case molStatusTypes.QUALITY:
      valueElement = (
        <Grid container alignItems="center" direction="column" justifyContent="center" style={{ color: 'orange' }}>
          <Grid item className={classes.qualCircle} style={{ backgroundColor: 'orange' }} />
          <Grid item className={classes.qualValue}>
            {3.6}
          </Grid>
        </Grid>
      );
      break;
    case molStatusTypes.STATUS:
      valueElement = <RefinementOutcome data={data} className={classes.refinementOutcome} />;
      break;
    default:
      break;
  }

  return valueElement;
});
