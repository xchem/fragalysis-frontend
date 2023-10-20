import React, { memo } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import RefinementOutcome from './refinementOutcome';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%'
  },
  labelItem: {
    color: '#7B7B7B',
    fontSize: '10px',
    margin: theme.spacing(1) / 2
  },
  valueItem: {
    marginLeft: theme.spacing(1) / 4,
    marginRight: theme.spacing(1) / 4
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
    paddingTop: theme.spacing(1) / 2,
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
      // TODO: decide color based on provided data
      valueElement = <div className={classes.valueElement} style={{ backgroundColor: 'green' }} />;
      break;
    case molStatusTypes.QUALITY:
      // TODO: decide color based on provided data
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
