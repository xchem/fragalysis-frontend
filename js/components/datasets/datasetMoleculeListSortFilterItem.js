import React, { memo, useState, useEffect } from 'react';
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
import { Checkbox, Tooltip } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { selectScoreProperty } from './redux/dispatchActions';
import { useEffectDebugger } from '../../utils/effects';

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

const widthCheckbox = 70;
const widthPrio = 100;
const widthOrder = 60;
const widthProperty = 212;
const widthMin = 30;
const widthSlider = 170;

export const DatasetMoleculeListSortFilter = memo(
  ({
    key,
    scoreName,
    scoreID,
    min,
    max,
    onChange,
    isFloat,
    isBoolean,
    isChecked,
    isString,
    onChangePrio,
    order,
    minValue,
    maxValue,
    datasetID,
    scoreDescription
  }) => {
    const dispatch = useDispatch();
    const filteredScorePropertiesOfDataset = useSelector(state => state.datasetsReducers.filteredScoreProperties);
    // Because Slider works only with Integers we convert Float to Int by multiplying with 100
    const MULT = 100;

    let normMin = isBoolean ? min : isFloat ? min * MULT : min;
    let normMax = isBoolean ? max : isFloat ? max * MULT : max;

    let normMinValue = isBoolean ? minValue : isFloat ? minValue * MULT : minValue;
    let normMaxValue = isBoolean ? maxValue : isFloat ? maxValue * MULT : maxValue;

    let classes = useStyles();
    //const [sliderValue, setSliderValue] = useState([0, 100]); //useState([normMinValue, normMaxValue]); // Internal state of slider
    const [sliderValue, setSliderValue] = useState([normMinValue, normMaxValue]); // Internal state of slider
    const [sliderCommittedValue, setSliderCommittedValue] = useState([normMinValue, normMaxValue]); // Internal state of committed slider value
    const [isCheckedBoolean, setIsCheckedBoolean] = useState(isChecked === true);
    let setting = {
      order,
      minValue,
      maxValue,
      isFloat,
      isBoolean,
      isChecked,
      isString
    };

    // console.log('DatasetMoleculeListSortFilter - update');

    // useEffectDebugger(
    //   () => {},
    //   [
    //     key,
    //     scoreName,
    //     scoreID,
    //     min,
    //     max,
    //     onChange,
    //     isFloat,
    //     isBoolean,
    //     isChecked,
    //     isString,
    //     onChangePrio,
    //     order,
    //     minValue,
    //     maxValue,
    //     datasetID,
    //     scoreDescription
    //   ],
    //   [
    //     'key',
    //     'scoreName',
    //     'scoreID',
    //     'min',
    //     'max',
    //     'onChange',
    //     'isFloat',
    //     'isBoolean',
    //     'isChecked',
    //     'isString',
    //     'onChangePrio',
    //     'order',
    //     'minValue',
    //     'maxValue',
    //     'datasetID',
    //     'scoreDescription'
    //   ],
    //   'DatasetMoleculeListSortFilter'
    // );

    useEffect(() => {
      console.log('useEffect');
      setSliderValue([normMinValue, normMaxValue]);
    }, [normMinValue, normMaxValue]);

    const handleCheckboxChange = e => {
      const isChecked = e.target.checked;

      setting.isChecked = isChecked;
      onChange(scoreName, setting);
      setIsCheckedBoolean(isChecked);
    };

    const handleChangeOrder = e => {
      const value = parseInt(e.target.value);
      if (value !== order) {
        setting.order = value;
        onChange(scoreName, setting);
      }
    };

    // We use internal state for slider for improved performance, so the uncommitted value is not passed to parent for processing
    const handleChangeSlider = (event, newValue) => {
      // console.log('handleChangeSlider');
      setSliderValue(newValue);
    };

    const handleCommitChangeSlider = (event, newValue) => {
      setting.minValue = isFloat ? newValue[0] / MULT : newValue[0];
      setting.maxValue = isFloat ? newValue[1] / MULT : newValue[1];
      if (newValue === 1) {
        setting.isChecked = false;
      } else if (newValue === 50) {
      } else if (newValue === 100) {
        setting.isChecked = true;
      }
      setSliderCommittedValue(newValue);
      onChange(scoreName, setting);
    };

    // // In case of 'CLEAR' filter we need reset internal state
    // if (sliderCommittedValue[0] !== normMinValue || sliderCommittedValue[1] !== normMaxValue) {
    //   setSliderValue([normMinValue, normMaxValue]);
    //   setSliderCommittedValue([normMinValue, normMaxValue]);
    // }

    return (
      <Grid container item className={classes.gridItemHeader}>
        <Grid item container className={classes.centered} style={{ width: widthCheckbox }}>
          <Grid item container justifyContent="center">
            <Grid item>
              <Checkbox
                color="primary"
                checked={
                  filteredScorePropertiesOfDataset &&
                  datasetID &&
                  !!filteredScorePropertiesOfDataset[datasetID].find(item => item.id === scoreID)
                }
                onChange={event =>
                  dispatch(selectScoreProperty({ isChecked: event.target.checked, datasetID, scoreName: scoreName }))
                }
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item container className={classes.centered} style={{ width: widthPrio }}>
          <Grid item container justifyContent="center">
            <Grid item>
              <Button
                variant="outlined"
                className={classNames(classes.prioButton, classes.prioButtonGreen)}
                onClick={() => {
                  onChangePrio(scoreName, -1);
                }}
              >
                <KeyboardArrowUp />
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                className={classNames(classes.prioButton, classes.prioButtonRed)}
                onClick={() => {
                  onChangePrio(scoreName, 1);
                }}
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
            checked={setting.order === 1}
            onChange={handleChangeOrder}
            value={1}
            name="radio-button-demo"
          />
          <Radio
            classes={{ root: classes.radioOrder }}
            style={{ right: 4 }}
            checked={setting.order === -1}
            onChange={handleChangeOrder}
            value={-1}
            name="radio-button-demo"
          />
          <Radio
            classes={{ root: classes.radioOrder }}
            style={{ right: 4 }}
            checked={setting.order === 0}
            onChange={handleChangeOrder}
            value={0}
            name="radio-button-demo"
          />
        </Grid>
        <Grid item className={classNames(classes.property, classes.centered)} style={{ width: widthProperty }}>
          <Tooltip title={scoreDescription}>
            <Chip size="small" className={classes.propertyChip} label={scoreName} />
          </Tooltip>
        </Grid>
        {isFloat !== null && (
          <>
            <Grid item className={classNames(classes.min, classes.centered)} style={{ width: widthMin }}>
              {Math.round(min)}
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
                valueLabelFormat={value => {
                  return isFloat ? value / MULT : value;
                }}
              />
            </Grid>
            <Grid item className={classNames(classes.min, classes.centered)} style={{ width: widthMin }}>
              {Math.round(max)}
            </Grid>
          </>
        )}
        {isBoolean && (
          <>
            <Grid item className={classNames(classes.min, classes.centered)} style={{ width: widthMin }}>
              {'False'}
            </Grid>
            <Grid item className={classNames(classes.centered, classes.slider)} style={{ width: widthSlider }}>
              <Slider
                value={sliderValue}
                onChange={handleChangeSlider}
                onChangeCommitted={handleCommitChangeSlider}
                valueLabelDisplay="auto"
                step={null}
                marks={[
                  { value: 1, label: '' },
                  { value: 50, label: 'Ignore' },
                  { value: 100, label: '' }
                ]}
                getAriaValueText={value => {
                  if (value === 0) {
                    return '';
                  } else if (value === 100) {
                    return '';
                  } else {
                    return 'Ignore';
                  }
                }}
                getAriaLabel={index => {
                  if (index === 0) {
                    return 'False';
                  } else if (index === 1) {
                    return 'Ignore';
                  } else {
                    return 'True';
                  }
                }}
                valueLabelFormat={value => {
                  if (value === 1) {
                    return 'False';
                  } else if (value === 50) {
                    return 'Ignore';
                  } else {
                    return 'True';
                  }
                }}
              />
            </Grid>
            <Grid item className={classNames(classes.min, classes.centered)} style={{ width: widthMin }}>
              {'True'}
            </Grid>
          </>
        )}
      </Grid>
    );
  }
);

DatasetMoleculeListSortFilter.propTypes = {
  order: PropTypes.number.isRequired,
  scoreName: PropTypes.string.isRequired,
  scoreID: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  isFloat: PropTypes.bool,
  disabledSlider: PropTypes.bool
};
