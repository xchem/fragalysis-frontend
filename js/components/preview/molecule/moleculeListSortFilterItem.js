import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import Radio from '@material-ui/core/Radio';
import Grid from '@material-ui/core/Grid';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

const useStyles = makeStyles(theme => ({
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  property: {
    fontSize: '10px',
    color: '#000'
  },
  min: {
    fontSize: '10px',
    color: '#7B7B7B'
  },
  prio: {
    color: '#7B7B7B'
  },
  radioOrder: {
    //padding: 0
  },
  prioButton: {
    height: 24,
    width: 24,
    padding: 0,
    borderRadius: 0,
    borderColor: 'white',
    minWidth: '100%',
    color: 'white',
    fontWeight: 'bolder',
    fontSize: 12,
    lineHeight: '10px'
  },
  prioButtonGreen: {
    backgroundColor: '#00D100',
    '&:hover': {
      backgroundColor: '#007500'
    }
  },
  prioButtonRed: {
    backgroundColor: '#DC143C',
    '&:hover': {
      backgroundColor: '#B21031'
    }
  },
  textCenter: {
    textAlign: 'center'
  },
  slider: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  propertyChip: {
    fontWeight: 'bolder'
  }
}));

const widthPrio = 50;
const widthOrder = 60;
const widthProperty = 212;
const widthMin = 30;
const widthSlider = 170;

const moleculeListSortFilterItem = memo(props => {
  const { property, min, max, onChange, isFloat, color, disabled, onChangePrio, filter } = props;
  const { order, minValue, maxValue } = props;
  // Because Slider works only with Integers we convert Float to Int by multiplying with 100
  const MULT = 100;

  let normMin = isFloat ? min * MULT : min;
  let normMax = isFloat ? max * MULT : max;

  let normMinValue = isFloat ? minValue * MULT : minValue;
  let normMaxValue = isFloat ? maxValue * MULT : maxValue;

  let classes = useStyles();
  const [sliderValue, setSliderValue] = useState([normMinValue, normMaxValue]); // Internal state of slider
  const [sliderCommittedValue, setSliderCommittedValue] = useState([normMinValue, normMaxValue]); // Internal state of committed slider value

  let setting = {
    order: order,
    minValue: minValue,
    maxValue: maxValue
  };

  const handleChangeOrder = e => {
    const value = parseInt(e.target.value);
    if (value !== order) {
      setting.order = value;
      onChange(setting);
    }
  };

  // We use internal state for slider for improved performance, so the uncommitted value is not passed to parent for processing
  const handleChangeSlider = (event, newValue) => {
    setSliderValue(newValue);
  };

  const handleCommitChangeSlider = (event, newValue) => {
    setting.minValue = isFloat ? newValue[0] / MULT : newValue[0];
    setting.maxValue = isFloat ? newValue[1] / MULT : newValue[1];
    setSliderCommittedValue(newValue);
    onChange(setting);
  };

  // In case of 'CLEAR' filter we need reset internal state
  if (sliderCommittedValue[0] !== normMinValue || sliderCommittedValue[1] !== normMaxValue) {
    setSliderValue([normMinValue, normMaxValue]);
    setSliderCommittedValue([normMinValue, normMaxValue]);
  }

  if (property === 'Molecular weight (MW)') {
    console.log(
      `item: ${property}, min: ${min}, normMin: ${normMin}, max: ${max}, normMax: ${normMax}, sliderValue: ${sliderValue}`
    );
  }

  return (
    <Grid container item className={classes.gridItemHeader}>
      <Grid item container className={classes.centered} style={{ width: widthPrio }}>
        <Grid item container justifyContent="center">
          <Grid item>
            <Button
              variant="outlined"
              className={classNames(classes.prioButton, classes.prioButtonGreen)}
              onClick={onChangePrio(-1)}
            >
              <KeyboardArrowUp />
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              className={classNames(classes.prioButton, classes.prioButtonRed)}
              onClick={onChangePrio(1)}
            >
              <KeyboardArrowDown />
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item className={classes.centered} style={{ width: widthOrder }}>
        <Radio
          classes={{ root: classes.radioOrder }}
          style={{ left: 4 }}
          checked={order === 1}
          onChange={handleChangeOrder}
          value={1}
          name="radio-button-demo"
        />
        <Radio
          classes={{ root: classes.radioOrder }}
          style={{ right: 4 }}
          checked={order === -1}
          onChange={handleChangeOrder}
          value={-1}
          name="radio-button-demo"
        />
      </Grid>
      <Grid item className={classNames(classes.property, classes.centered)} style={{ width: widthProperty }}>
        <Chip size="small" className={classes.propertyChip} label={property} style={{ backgroundColor: color }} />
      </Grid>
      {filter && (
        <>
          <Grid item className={classNames(classes.min, classes.centered)} style={{ width: widthMin }}>
            {min}
          </Grid>
          <Grid item className={classNames(classes.centered, classes.slider)} style={{ width: widthSlider }}>
            <Slider
              value={sliderValue}
              onChange={handleChangeSlider}
              onChangeCommitted={handleCommitChangeSlider}
              valueLabelDisplay="auto"
              aria-labelledby="range-slider"
              max={normMax}
              min={normMin}
              marks={isFloat !== true ? true : undefined}
              valueLabelFormat={value => {
                return isFloat ? value / MULT : value;
              }}
              disabled={disabled}
            />
          </Grid>
          <Grid item className={classNames(classes.min, classes.centered)} style={{ width: widthMin }}>
            {max}
          </Grid>
        </>
      )}
    </Grid>
  );
});

moleculeListSortFilterItem.propTypes = {
  order: PropTypes.number.isRequired,
  property: PropTypes.string.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  isFloat: PropTypes.bool,
  disabled: PropTypes.bool,
  filter: PropTypes.bool
};

export default moleculeListSortFilterItem;
