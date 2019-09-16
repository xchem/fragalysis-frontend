import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import status_6 from '../img/status_6.svg';
import status_5 from '../img/status_5.svg';
import status_4 from '../img/status_4.svg';

const useStyles = makeStyles(() => ({
  container: {
    height: '100%'
  },
  labelItem: {
    color: '#7B7B7B',
    fontSize: '10px',
    transform: 'rotate(-90deg)',
  },
  valueItem: {
    display: 'flex',
    alignItems: 'center'
  },
  valueElement: {
    width: '18px',
    height: '18px'
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
  STATUS: 'stat',
}

export default (props) => {
  const classes = useStyles();
  const { value, type } = props;

  let valueElement = <div />;
  let label = '';
  switch (type) {
    case molStatusTypes.CONFIDENCE:
      label = 'conf.';
      // TODO: decide color based on provided value
      valueElement = <div className={classes.valueElement} style={{backgroundColor: 'green'}} />
      break;
    case molStatusTypes.QUALITY:
        label = 'qual.';
        // TODO: decide color based on provided value
        valueElement = <Grid container alignItems="center" direction="column" style={{color: 'orange'}}>
          <Grid item className={classes.qualCircle} style={{backgroundColor: 'orange'}} />
          <Grid item className={classes.qualValue}>
            {value}
          </Grid>
        </Grid>
      break;
    case molStatusTypes.STATUS:
        label = 'stat.';
        // TODO: update status image source according to value
        valueElement = <img src={value === 6 ? status_6 : value === 5 ? status_5 : status_4} className={classes.valueElement} />
      break;
    default:
      break;
  }

  return (
    <Grid container alignItems="center" justify="space-around" className={classes.container}>
      <Grid item className={classes.labelItem}>
        {label}
      </Grid>
      <Grid item className={classes.valueItem}>
        {valueElement}
      </Grid>
    </Grid>
  )
}
