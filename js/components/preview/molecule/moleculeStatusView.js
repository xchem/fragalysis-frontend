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
    //  transform: 'rotate(-90deg)'
  },
  valueItem: {
    display: 'flex',
    alignItems: 'center'
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
  let label = '';
  switch (type) {
    case molStatusTypes.CONFIDENCE:
      label = 'conf.';
      // TODO: decide color based on provided data
      valueElement = <div className={classes.valueElement} style={{ backgroundColor: 'green' }} />;
      break;
    case molStatusTypes.QUALITY:
      label = 'qual.';
      // TODO: decide color based on provided data
      valueElement = (
        <Grid container alignItems="center" direction="column" justify="flex-start" style={{ color: 'orange' }}>
          <Grid item className={classes.qualCircle} style={{ backgroundColor: 'orange' }} />
          <Grid item className={classes.qualValue}>
            {3.6}
          </Grid>
        </Grid>
      );
      break;
    case molStatusTypes.STATUS:
      label = 'stat.';
      valueElement = <RefinementOutcome data={data} className={classes.valueElement} />;
      break;
    default:
      break;
  }

  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      justify="space-between"
      className={classes.container}
      //spacing={1}
    >
      <Grid item className={classes.labelItem}>
        {label}
      </Grid>
      <Grid item className={classes.valueItem}>
        {valueElement}
      </Grid>
    </Grid>
  );
});
