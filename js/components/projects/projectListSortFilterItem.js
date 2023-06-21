import React, { memo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import Radio from '@material-ui/core/Radio';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import Chip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import { setListOfProjects } from './redux/actions';

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
const widthSlider = 120;
let filteredProjectList = [];

const moleculeListSortFilterItem = memo(props => {
  const dispatch = useDispatch();
  const { property, onChange, color, onChangePrio, filter, dateFilter } = props;
  const { order, minValue, maxValue } = props;

  let classes = useStyles();

  let setting = {
    order: order,
    minValue: minValue,
    maxValue: maxValue
  };

  const defaultListOfProjects = useSelector(state => state.projectReducers.listOfProjects).map(project => {
    return {
      id: project.id,
      name: project.title,
     //tags: JSON.parse(project.tags),
      target: project.target,
      createdAt: project.init_date,
      author: (project.author && project.author.email) || '-',
      authority: project.project !== undefined ? (project.project.authority !== undefined ? project.project.authority : '-') : project.authority,
      description: project.description,
      targetAccessString:  project.project !== undefined ? (project.project.target_access_string !== undefined ? project.project.target_access_string : '-') : project.targetAccessString,
    };
  });

  useEffect(() => {
    if (filteredProjectList.length !== 0) {
      dispatch(setListOfProjects(filteredProjectList))}
    
    },[filteredProjectList]);

  const onChangeFilterString = event => {
    /* signal to React not to nullify the event object */
    onChangeFilterStringDebounce(event.target.value);
  }



    const onChangeFilterStringDebounce = debounce((value) => {
    if (property === "Name") {
      if (filteredProjectList.length === 0  ) {
        filteredProjectList = defaultListOfProjects.filter(item => item.name.toLowerCase().includes(value.toLowerCase()));
        dispatch(setListOfProjects(filteredProjectList))
      }
      else {
        filteredProjectList = filteredProjectList.filter(item => item.name.title === undefined ? item.name.toLowerCase().includes(value.toLowerCase()) : item.name.title.toLowerCase().includes(value.toLowerCase()));
        dispatch(setListOfProjects(filteredProjectList))
      }
    }
    if(property ===  "Target") {
      if (filteredProjectList.length === 0  ) {
      filteredProjectList = defaultListOfProjects.filter(item => item.target.title.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfProjects(filteredProjectList))
    }
    else {
      filteredProjectList = filteredProjectList.filter(item => item.target.title.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfProjects(filteredProjectList))
    }
    }
    if(property ===  "Target access string") {
      if (filteredProjectList.length === 0  ) {
      filteredProjectList = defaultListOfProjects.filter(item => item.targetAccessString.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfProjects(filteredProjectList))
    }
    else {
      filteredProjectList = filteredProjectList.filter(item => item.targetAccessString.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfProjects(filteredProjectList))
    }
    }
    if(property ===  "Description") {
      if (filteredProjectList.length === 0  ) {
      filteredProjectList = defaultListOfProjects.filter(item => item.description.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfProjects(filteredProjectList))
    }
    else {
      filteredProjectList = filteredProjectList.filter(item => item.description.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfProjects(filteredProjectList))
    }
    }
    if(property ===  "Authority") {
      if (filteredProjectList.length === 0  ) {
      filteredProjectList = defaultListOfProjects.filter(item => item.authority.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfProjects(filteredProjectList))
    }
    else {
      filteredProjectList = filteredProjectList.filter(item => item.authority.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfProjects(filteredProjectList))
    }
    }
    if(property ===  "Tags") {
      if (filteredProjectList.length === 0  ) {
      filteredProjectList = defaultListOfProjects.filter(item => item.tags.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfProjects(filteredProjectList))
    }
    else {
      filteredProjectList = filteredProjectList.filter(item => item.tags.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfProjects(filteredProjectList))
    }
    }
  },1000);

  const handleChangeOrder = e => {
    const value = parseInt(e.target.value);
    if (value !== order) {
      setting.order = value;
      onChange(setting);
    }
  };

  return (
    <Grid container item className={classes.gridItemHeader}>
      <Grid item container className={classes.centered} style={{ width: widthPrio }}>
        <Grid item container justify="center">
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
          <Grid item className={classNames(classes.centered, classes.slider)} style={{ width: widthSlider }}>
            {dateFilter === true ? (
            <Slider     />
            ) :
            <TextField
            placeholder='Search'
            onChange={onChangeFilterString}
            key={property}
            ></TextField>
            } 
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
  filter: PropTypes.bool,
  dateFilter: PropTypes.bool
};

export default moleculeListSortFilterItem;
