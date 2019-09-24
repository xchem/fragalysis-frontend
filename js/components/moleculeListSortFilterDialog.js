import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slider from '@material-ui/core/Slider';
import Radio from '@material-ui/core/Radio';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';

const useStyles = makeStyles({
  button: {
    fontSize: 10,
  },
  title: {
    fontSize: 22,
  },
  applyButton: {
    borderColor: '#009000',
    color: '#009000',
    '&:hover': {
      backgroundColor: '#E3EEDA',
      borderColor: '#003f00',
      color: '#003f00',
    }
  },
  numberOfHits: {
    flexGrow: 1,
  },
  gridItemHeader: {
    height: '32px',
    fontSize: '12px',
    lineHeight: 1,
    color: '#7B7B7B',
    fontWeight: 'bold',
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  property: {
    fontSize: '10px',
    color: '#000',
  },
  min: {
    fontSize: '10px',
    color: '#7B7B7B',
  },
  prio: {
    color: '#7B7B7B',
  },
  radioOrder: {
    //padding: 0
  },
  prioButton: {
    height: 15,
    padding: 0,
    borderRadius: 0,
    borderColor: 'white',
    minWidth: '100%',
    color: 'white',
    fontWeight: 'bolder',
    fontSize: 12,
    lineHeight: '10px',
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
    textAlign: 'center',
  }
});

const widthPrio = 50;
const widthOrder = 60;
const widthProperty = 200;
const widthMin = 30;
const widthSlider = 170;

const SortFilterItem = (props) => {
  const { property, min, max, onChange } = props;
  const { priority, order, minValue, maxValue } = props;
  let classes = useStyles();
  const [sliderValue, setSliderValue] = useState([minValue, maxValue]); // Internal state of slider
  const [sliderCommittedValue, setSliderCommittedValue] = useState([minValue, maxValue]); // Internal state of committed slider value

  let setting = {
    priority: priority,
    order: order,
    minValue: minValue,
    maxValue: maxValue,
  }

  const handleChangePrio = (inc) => () => {
    const maxPrio = 3;
    const minPrio = 0;
    if(setting.priority + inc >= minPrio && setting.priority + inc <= maxPrio ) {
      setting.priority = setting.priority + inc;
      onChange(setting);
    }
  }

  const handleChangeOrder = (e) => {
    const value = parseInt(e.target.value);
    if (value !== order) {
      setting.order = value
      onChange(setting);
    }
  }

  // We use internal state for slider for improved performance, so the uncommitted value is not passed to parent for processing
  const handleChangeSlider = (event, newValue) => {
    setSliderValue(newValue);
  };

  const handleCommitChangeSlider = (event, newValue) => {
    setting.minValue = newValue[0];
    setting.maxValue = newValue[1];
    setSliderCommittedValue(newValue);
    onChange(setting);
  };

  // In case of 'CLEAR' filter we need reset internal state
  if(sliderCommittedValue[0] !== minValue || sliderCommittedValue[1] !== maxValue) {
    setSliderValue([minValue, maxValue]);
    setSliderCommittedValue([minValue, maxValue]);
  }

  return (
    <Grid container item className={classes.gridItemHeader}>
      <Grid item container className={classes.centered} style={{width: widthPrio}}>
        <Grid item xs={6} className={classNames(classes.textCenter, classes.prio)}>{priority}</Grid>
        <Grid item container direction="column" xs={6}>
          <Grid item><Button variant="outlined" className={classNames(classes.prioButton, classes.prioButtonGreen)} onClick={handleChangePrio(1)}>+</Button></Grid>
          <Grid item><Button variant="outlined" className={classNames(classes.prioButton, classes.prioButtonRed)} onClick={handleChangePrio(-1)}>-</Button></Grid>
        </Grid>
      </Grid>
      <Grid item className={classes.centered} style={{width: widthOrder}}>
        <Radio
          classes={{root: classes.radioOrder}}
          style={{left: 4}}
          checked={order === 1}
          onChange={handleChangeOrder}
          value={1}
          name="radio-button-demo"
        />
        <Radio
          classes={{root: classes.radioOrder}}
          style={{right: 4}}
          checked={order === -1}
          onChange={handleChangeOrder}
          value={-1}
          name="radio-button-demo"
        />  
      </Grid>
      <Grid item className={classNames(classes.property, classes.centered)} style={{width: widthProperty}}>{property}</Grid>
      <Grid item className={classNames(classes.min, classes.centered)} style={{width: widthMin}}>{min}</Grid>
      <Grid item className={classes.centered} style={{width: widthSlider}}>
        <Slider
          value={sliderValue}
          onChange={handleChangeSlider}
          onChangeCommitted={handleCommitChangeSlider}
          valueLabelDisplay="auto"
          aria-labelledby="range-slider"
          max={max}
          min={min}
        />
      </Grid>
      <Grid item className={classNames(classes.min, classes.centered)} style={{width: widthMin}}>{max}</Grid>
    </Grid>
  )
}

SortFilterItem.propTypes = {
  priority: PropTypes.number,
  order: PropTypes.number,
  property: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
};

const MOL_ATTR = {
  MW: { key: 'MW', name: 'Molecular weight (MW)' },
  LOGP: { key: 'logP', name: 'logP' },
  TPSA: { key: 'TPSA', name: 'Topological polar surface area (TPSA)' },
  HA: { key: 'HA', name: 'Heavy atom count' },
  HACC: { key: 'Hacc', name: '# H-bond acceptors (Hacc)' },
  HDON: { key: 'Hdon', name: '# H-bond donors (Hdon)' },
  ROTS: { key: 'Rots', name: '# Rotatable bonds (Rots)' },
  RINGS: { key: 'Rings', name: '# rings (rings)' },
  VELEC: { key: 'Velec', name: '# valence electrons (velec)' },
  NCPD: { key: '#cpd', name: '# available follow-up cmpds. (#cpd)' },
}

export default function MoleculeListSortFilterDialog(props) {
  const { handleClose } = props;
  let classes = useStyles();

  const initialize = () => {
    let initObject = {};
    for (let attr of Object.values(MOL_ATTR)) {
      initObject[attr.key] = { priority: 0, order: 1, minValue: 20, maxValue: 220 }
    }
    return initObject;
  }

  const handleItemChange = (key) => (setting) => {
    let newFilter = Object.assign({}, filter);
    newFilter[key] = setting;
    setFilter(newFilter);
    setFilteredCount(Math.round(Math.random() * 100)); // Demo
  }

  const handleClear = () => {
    setFilter(initialize());
    setFilteredCount(0); // Demo
  }

  const [filter, setFilter] = useState(initialize());
  const [filteredCount, setFilteredCount] = useState(0);

  return (
    <Dialog open={true} onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle classes={{root: classes.title}} disableTypography id="form-dialog-title"><h4>Sort and filter</h4></DialogTitle>
      <DialogContent>
        <Grid container>
          <Grid container item className={classes.gridItemHeader}>
            <Grid item className={classes.centered} style={{width: widthPrio}}>priority</Grid>
            <Grid item className={classes.centered} style={{width: widthOrder}}><div style={{textAlign: 'center'}}>order<br/><span style={{fontSize: 'smaller'}}>(up/down)</span></div></Grid>
            <Grid item className={classes.centered} style={{width: widthProperty}}>property</Grid>
            <Grid item className={classes.centered} style={{width: widthMin}}>min</Grid>
            <Grid item className={classes.centered} style={{width: widthSlider}}></Grid>
            <Grid item className={classes.centered} style={{width: widthMin}}>max</Grid>
          </Grid>

          {
            Object.values(MOL_ATTR).map((attr) => 
              <SortFilterItem 
                key={attr.key}
                property={attr.name} 
                priority={filter[attr.key].priority}
                order={filter[attr.key].order}
                minValue={filter[attr.key].minValue}
                maxValue={filter[attr.key].maxValue}
                min={0} 
                max={250} 
                onChange={handleItemChange(attr.key)}/>
            )
          }
        </Grid>

      </DialogContent>
      <DialogActions>
        <div className={classes.numberOfHits}>
          # of hits matching selection: <b>{filteredCount}</b>
        </div>
        <Button classes={{root: classes.button}} onClick={handleClear} color="secondary" variant="outlined">
          Clear
        </Button>
        <Button classes={{root: classes.button}} className={classes.applyButton} onClick={handleClose} color="primary" variant="outlined">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}