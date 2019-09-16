import React from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import status_6 from '../img/status_6.svg';
import status_5 from '../img/status_5.svg';
import status_4 from '../img/status_4.svg';

const useStyles = makeStyles(() => ({
  labelItem: {
    color: '#7B7B7B',
    fontSize: '10px',
    transform: 'rotate(-90deg)',
  },
  valueItem: {
    width: '20px',
    height: '20px'
  },
}));

export const molStatusTypes = {
  CONFIDENCE: 'conf',
  QUALITY: 'qual',
  STATUS: 'stat',
}

export default (props) => {
  const classes = useStyles();
  const { value, type } = props;

  const createColoredSquare = (color) => {
    return <div className={classes.valueItem} style={{backgroundColor: color}} />
  }

  let valueElement = <div />;
  let label = '';
  switch (type) {
    case molStatusTypes.CONFIDENCE:
      label = 'conf.';
      // TODO: decide color based on provided value
      valueElement = createColoredSquare('green');
      break;
    case molStatusTypes.QUALITY:
        label = 'qual.';
        // TODO: decide color based on provided value
        valueElement = createColoredSquare('red');
      break;
    case molStatusTypes.STATUS:
        label = 'stat.';
        // TODO: update status image source according to value
        valueElement = <img src={value === 6 ? status_6 : value === 5 ? status_5 : status_4} />
      break;
    default:
      break;
  }

  return (
    <Grid container alignItems="center">
      <Grid item className={classes.labelItem}>
        {label}
      </Grid>
      <Grid item className={classes.valueItem}>
        {valueElement}
      </Grid>
    </Grid>
  )
}
