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
import { setListOfProjects, setListOfFilteredProjects } from './redux/actions';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  },
  dateInputWidth:
  {
    width: '93px'
  },
  dateFont: {
    height: '25px',
    fontSize: '12px',
    color: '#7B7B7B',
    fontWeight: 'bold',
    verticalAlign: 'center',
    paddingTop: '5px'
  }
}));

const widthPrio = 50;
const widthOrder = 60;
const widthProperty = 170;
const gridDateFromWidth = 75;
const gridDateFromInputWidth = 90;
const filterDataWidth = 185;

let filteredProjectList = [];
let searchNameString = "";
let searchTargetString = "";
let searchTargetAccessString = "";
let searchDescriptionString = "";
let searchAuthorityString = "";

let filteredProjectListByName = [];
let filteredProjectListByTarget = [];
let filteredProjectListByTargetAccessString = [];
let filteredProjectListByDescription = [];
let filteredProjectListByAuthority = [];
let filteredProjectListByCreatedFrom = [];
let filteredProjectListByCreatedTo = [];
let filteredProjectListDate = [];

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

  const resetFilter = useSelector(state => state.selectionReducers.resetFilter);

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [searchString, setSearchString] = useState("");

  let defaultListOfProjects = useSelector(state => state.projectReducers.listOfProjects);

  useEffect(() => {
    if (filteredProjectList.length !== 0) {
      dispatch(setListOfProjects(filteredProjectList))}
      if (resetFilter === true) {
        setSearchString(" ");
      }
     
    },[filteredProjectListByName, startDate, endDate, searchString, resetFilter, searchNameString]);

   const onChangeFilterString = event => {
    if (resetFilter === false) {
    setSearchString(event.target.value) }
    else  if (resetFilter === true) {
      return moleculeListSortFilterItem;
      setSearchString(" ");
    }
    /* signal to React not to nullify the event object */
    onChangeFilterStringDebounce(event.target.value);
  }

  const onChangeFilterStartDate = event => {
    setStartDate(event);
    const formattedStartDate =  event.toISOString();
    filteredProjectListByCreatedFrom = defaultListOfProjects.filter(date => (date.init_date > formattedStartDate));

    if (filteredProjectListByCreatedTo.length > 0 && filteredProjectListByCreatedFrom.length > 0 ) {
      filteredProjectListDate = filteredProjectListByCreatedTo.filter(item1 =>
        filteredProjectListByCreatedFrom.some(item2 => item2.id === item1.id))
        dispatch(setListOfFilteredProjects(filteredProjectListDate));
    }
    else {
      filteredProjectListDate = filteredProjectListByCreatedFrom;
      dispatch(setListOfFilteredProjects(filteredProjectListByCreatedFrom));
    }
  }
 
  const onChangeFilterEndDate = event => {
    setEndDate(event);
    const formattedEndDate =  new Date(event.getTime() - event.getTimezoneOffset() * 779900).toISOString();
    filteredProjectListByCreatedTo = defaultListOfProjects.filter(date => (date.init_date <= formattedEndDate +1));
    if (filteredProjectListByCreatedTo.length > 0 && filteredProjectListByCreatedFrom.length > 0 ) {
      filteredProjectListDate = filteredProjectListByCreatedTo.filter(item1 =>
        filteredProjectListByCreatedFrom.some(item2 => item2.id === item1.id))
        dispatch(setListOfFilteredProjects(filteredProjectListDate));
    }
    else {
      filteredProjectListDate = filteredProjectListByCreatedTo;
      dispatch(setListOfFilteredProjects(filteredProjectListByCreatedTo));
    }
  }

const filterAllData = (value) => {
  if (searchNameString !== "" && searchTargetString !== "" && (property === "Name" || property === "Target")) {
    let filteredData1 = filteredProjectListByName.filter(item1 =>
      filteredProjectListByTarget.some(item2 => item2.id === item1.id)
    );
     dispatch(setListOfFilteredProjects(filteredData1))}

  if (searchNameString !== "" && searchTargetAccessString !== "" && (property === "Name" || property === "Target access string")) {
    let filteredData1 = filteredProjectListByName.filter(item1 =>
      filteredProjectListByTargetAccessString.some(item2 => item2.id === item1.id)
    );
      dispatch(setListOfFilteredProjects(filteredData1))}

  if (searchNameString !== "" && searchDescriptionString !== "" && (property === "Name" || property === "Description")) {
    let filteredData1 = filteredProjectListByName.filter(item1 =>
      filteredProjectListByDescription.some(item2 => item2.id === item1.id)
    );
      dispatch(setListOfFilteredProjects(filteredData1))}

 if (searchNameString !== "" && searchAuthorityString !== "" && (property === "Name" || property === "Authority")) {
    let filteredData1 = filteredProjectListByName.filter(item1 =>
      filteredProjectListByAuthority.some(item2 => item2.id === item1.id)
    );
      dispatch(setListOfFilteredProjects(filteredData1))}   
  
  if (searchTargetString !== "" && searchTargetAccessString !== "" && (property === "Target" || property === "Target access string")) {
    let filteredData1 = filteredProjectListByTarget.filter(item1 =>
      filteredProjectListByTargetAccessString.some(item2 => item2.id === item1.id)
    );
      dispatch(setListOfFilteredProjects(filteredData1))}   

  if (searchTargetString !== "" && searchDescriptionString !== "" && (property === "Target" || property === "Description")) {
    let filteredData1 = filteredProjectListByTarget.filter(item1 =>
      filteredProjectListByDescription.some(item2 => item2.id === item1.id)
    );
      dispatch(setListOfFilteredProjects(filteredData1))}         
 
  if (searchTargetString !== "" && searchAuthorityString !== "" && (property === "Target" || property === "Authority")) {
    let filteredData1 = filteredProjectListByTarget.filter(item1 =>
      filteredProjectListByAuthority.some(item2 => item2.id === item1.id)
    );
      dispatch(setListOfFilteredProjects(filteredData1))}         
     
  if (searchTargetAccessString !== "" && searchDescriptionString !== "" && (property === "Target access string" || property === "Description")) {
    let filteredData1 = filteredProjectListByTargetAccessString.filter(item1 =>
      filteredProjectListByDescription.some(item2 => item2.id === item1.id)
    );
      dispatch(setListOfFilteredProjects(filteredData1))}         
         
  if (searchDescriptionString !== "" && searchAuthorityString !== "" && (property === "Description" || property === "Authority")) {
    let filteredData1 = filteredProjectListByDescription.filter(item1 =>
       filteredProjectListByAuthority.some(item2 => item2.id === item1.id)
    );
      dispatch(setListOfFilteredProjects(filteredData1))}         

  if (searchNameString !== "" && searchTargetString !== "" && searchTargetAccessString !== "" && (property === "Name" || property === "Target" || property === "Target access string")) {
    let filteredData1 = filteredProjectListByName.filter(item1 =>
        filteredProjectListByTarget.some(item2 => item2.id === item1.id) &&
        filteredProjectListByTargetAccessString.some(item3=> item3.id === item1.id)
    );
      dispatch(setListOfFilteredProjects(filteredData1))}   

  if (searchNameString !== "" && searchTargetString !== "" && searchDescriptionString !== "" && (property === "Name" || property === "Target" || property === "Description")) {
    let filteredData1 = filteredProjectListByName.filter(item1 =>
        filteredProjectListByTarget.some(item2 => item2.id === item1.id) &&
        filteredProjectListByDescription.some(item3=> item3.id === item1.id)
    );
      dispatch(setListOfFilteredProjects(filteredData1))}        

  if (searchNameString !== "" && searchTargetString !== "" && searchAuthorityString !== "" && (property === "Name" || property === "Target" || property === "Authority")) {
    let filteredData1 = filteredProjectListByName.filter(item1 =>
        filteredProjectListByTarget.some(item2 => item2.id === item1.id) &&
        filteredProjectListByAuthority.some(item3=> item3.id === item1.id)
    );

      dispatch(setListOfFilteredProjects(filteredData1))}   
  if (searchTargetString !== "" && searchTargetAccessString !== "" && searchDescriptionString !== "" && (property === "Target access string" || property === "Target" || property === "Description")) {
    let filteredData1 = filteredProjectListByTarget.filter(item1 =>
        filteredProjectListByTargetAccessString.some(item2 => item2.id === item1.id) &&
        filteredProjectListByDescription.some(item3=> item3.id === item1.id)
    );
      dispatch(setListOfFilteredProjects(filteredData1))}     
      
   if (searchTargetString !== "" && searchTargetAccessString !== "" && searchAuthorityString !== "" && (property === "Target" || property === "Target access string" || property === "Authority")) {
    let filteredData1 = filteredProjectListByTarget.filter(item1 =>
        filteredProjectListByTargetAccessString.some(item2 => item2.id === item1.id) &&
        filteredProjectListByAuthority.some(item3=> item3.id === item1.id)
    );
      dispatch(setListOfFilteredProjects(filteredData1))}    
    
  if (searchTargetAccessString !== "" && searchDescriptionString !== "" && searchAuthorityString !== "" && (property === "Target access string" || property === "Description" || property === "Authority")) {
    let filteredData1 = filteredProjectListByTargetAccessString.filter(item1 =>
        filteredProjectListByDescription.some(item2 => item2.id === item1.id) &&
         filteredProjectListByAuthority.some(item3=> item3.id === item1.id)
    );
      dispatch(setListOfFilteredProjects(filteredData1))}    
        

  if (searchNameString !== "" && property === "Name" && searchTargetString === "" &&  searchDescriptionString === "") {
    const filteredData1 = defaultListOfProjects.filter(item => item.title.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfFilteredProjects(filteredData1))
  }
  if (searchTargetString !== "" && property === "Target" && searchNameString === "" &&  searchDescriptionString === "") {
    const filteredData1 = defaultListOfProjects.filter(item => item.target.title.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfFilteredProjects(filteredData1))
  }
  if (searchDescriptionString !== "" && property ===  "Description" && searchTargetString === "" &&  searchTargetAccessString === "") {
    const filteredData1 = defaultListOfProjects.filter(item => item.description.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfFilteredProjects(filteredData1))
  }
  if (searchTargetAccessString !== "" && property ===  "Target access string" && searchTargetString === "" &&  searchDescriptionString === "") {
    const filteredData1 = defaultListOfProjects.filter(item => item.project.target_access_string.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfFilteredProjects(filteredData1))
  }
  if (searchAuthorityString !== "" && property ===  "Authority" && searchTargetString === "" &&  searchDescriptionString === "") {
    const filteredData1 = defaultListOfProjects.filter(item => item.project.authority.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfFilteredProjects(filteredData1))
  }
  if (searchNameString === "" && searchTargetString === "" && searchDescriptionString === "" && searchTargetAccessString === "" && searchAuthorityString === "") {
    const filteredData1 = defaultListOfProjects.filter(item => item.project.authority.toLowerCase().includes(value.toLowerCase()));
      dispatch(setListOfFilteredProjects(filteredData1))
  } 
}


  const onChangeFilterStringDebounce = debounce((value) => {
   if (property === "Name") {
       searchNameString = value;
      if (filteredProjectListDate.length > 0) { 
          defaultListOfProjects = filteredProjectListDate;
          filteredProjectListByName = defaultListOfProjects.filter(item => item.title.toLowerCase().includes(value.toLowerCase()));}
        else {
          filteredProjectListByName = defaultListOfProjects.filter(item => item.title.toLowerCase().includes(value.toLowerCase()));
        }
        console.log("filteredProjectListByName")
      filterAllData(value);
    }

    if (property === "Target") {
      searchTargetString = value;
      if (filteredProjectListDate.length > 0) { 
        defaultListOfProjects = filteredProjectListDate;
        filteredProjectListByTarget = defaultListOfProjects.filter(item => item.target.title.toLowerCase().includes(value.toLowerCase()));}
       else {
        filteredProjectListByTarget = defaultListOfProjects.filter(item => item.target.title.toLowerCase().includes(value.toLowerCase()));
       }
      filterAllData(value);
    }
        
    if(property ===  "Target access string") {
      searchTargetAccessString = value;
      if (filteredProjectListDate.length > 0) { 
        defaultListOfProjects = filteredProjectListDate;
        filteredProjectListByTargetAccessString = defaultListOfProjects.filter(item => item.project.target_access_string.toLowerCase().includes(value.toLowerCase()));}
       else {
        filteredProjectListByTargetAccessString = defaultListOfProjects.filter(item => item.project.target_access_string.toLowerCase().includes(value.toLowerCase()));
       }
      filterAllData(value);
    }

    if(property ===  "Description") {
      searchDescriptionString = value;
      if (filteredProjectListDate.length > 0) { 
        defaultListOfProjects = filteredProjectListDate;
        filteredProjectListByDescription = defaultListOfProjects.filter(item => item.description.toLowerCase().includes(value.toLowerCase()));}
       else {
        filteredProjectListByDescription = defaultListOfProjects.filter(item => item.description.toLowerCase().includes(value.toLowerCase()));
       }
      filterAllData(value);
    }

    if(property ===  "Authority") {
      searchAuthorityString = value;
      if (filteredProjectListDate.length > 0) { 
        defaultListOfProjects = filteredProjectListDate;
        filteredProjectListByAuthority = defaultListOfProjects.filter(item => item.project.authority.toLowerCase().includes(value.toLowerCase()));}
       else {
      filteredProjectListByAuthority = defaultListOfProjects.filter(item => item.project.authority.toLowerCase().includes(value.toLowerCase()));
       }
      filterAllData(value);
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
          style={{ left: 4 }}
          checked={order === 1}
          onChange={handleChangeOrder}
          value={1}
          name="radio-button-demo"
        />
        <Radio
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
      { resetFilter === false ? 
      filter && (

        <>
          <Grid item className={classNames(classes.centered, classes.slider)} style={{ width: filterDataWidth }}>
            {dateFilter === true ? (
              <Grid item container className={classes.gridItemHeader}>
              
                  <Grid item style={{ width:gridDateFromWidth}} className={classNames(classes.dateFont)}>
                    Created from 
                  </Grid>
                  <Grid item style={{ width:gridDateFromInputWidth}}>
                    <DatePicker 
                    className={ classes.dateInputWidth } 
                    selected={startDate} 
                    onChange={(event) => onChangeFilterStartDate(event)} 
                    placeholderText='MM/DD/YYYY'
                    />
                  </Grid>
                
                  
                  <Grid item style={{ width:gridDateFromWidth}} className={classNames(classes.dateFont)}>
                    Created to
                  </Grid>
                  <Grid item style={{ width:gridDateFromInputWidth}}>
                    <DatePicker  style={{borderRadius:'10', fontSize: '10px'}} 
                    className={ classes.dateInputWidth } 
                    selected={endDate} 
                    onChange={(event) => onChangeFilterEndDate(event)}
                    placeholderText='MM/DD/YYYY'
                    />
                  </Grid>
                </Grid>
            ) :
            <TextField
            id="textFieldInput"
            placeholder='Search'
            onChange={(event) => onChangeFilterString(event)}
            key={property}
            ></TextField>
            } 
          </Grid>
        </>
      )
    :  filter && (
      <>
        <Grid item className={classNames(classes.centered, classes.slider)} style={{ width: filterDataWidth }}>
          {dateFilter === true ? (
            <Grid item container className={classes.gridItemHeader}>
            
                <Grid item style={{ width:gridDateFromWidth}} className={classNames(classes.dateFont)}>
                  Created from 
                </Grid>
                <Grid item style={{ width:gridDateFromInputWidth}}>
                  <DatePicker 
                  className={ classes.dateInputWidth } 
                  selected={startDate} 
                  onChange={(event) => onChangeFilterStartDate(event)} 
                  placeholderText='MM/DD/YYYY'
                  />
                </Grid>
                <Grid item style={{ width:gridDateFromWidth}} className={classNames(classes.dateFont)}>
                  Created to
                </Grid>
                <Grid item style={{ width:gridDateFromInputWidth}}>
                  <DatePicker  style={{borderRadius:'10', fontSize: '10px'}} 
                  className={ classes.dateInputWidth } 
                  selected={endDate} 
                  onChange={(event) => onChangeFilterEndDate(event)}
                  placeholderText='MM/DD/YYYY'
                  />
                </Grid>
              </Grid>
          ) :
          <TextField
          id="textFieldInput"
          placeholder='Search'
          onChange={(event) => onChangeFilterString(event)}
          key={property}
          ></TextField>
          } 
        </Grid>
      </>
    )
    }
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
