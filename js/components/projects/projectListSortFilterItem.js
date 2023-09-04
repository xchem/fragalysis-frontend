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
import {
  setListOfProjects,
  setListOfFilteredProjects,
  setListOfFilteredProjectsByDate,
  setSearchName,
  setSearchTarget,
  setSearchTargetAccessString,
  setSearchAuthority,
  setSearchDescription,
  setSearchDateFrom,
  setSearchDateTo
} from './redux/actions';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { compareCreatedAtDateDesc } from './sortProjects/sortProjects';
import moment from 'moment';
import { sortProjects } from './projectListSortFilterDialog';

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
  dateInputWidth: {
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
let searchNameString = '';
let searchTargetString = '';
let searchTargetAccessString = '';
let searchDescriptionString = '';
let searchAuthorityString = '';

let filteredProjectListByName = [];
let filteredProjectListByTarget = [];
let filteredProjectListByTargetAccessString = [];
let filteredProjectListByDescription = [];
let filteredProjectListByAuthority = [];
let filteredProjectListByCreatedFrom = [];
let filteredProjectListByCreatedTo = [];
let filteredProjectListDate = [];

const ProjectListSortFilterItem = memo(props => {
  const dispatch = useDispatch();
  const { property, onChange, color, onChangePrio, filter, dateFilter } = props;
  const { order } = props;

  let classes = useStyles();

  let setting = {
    order: order
  };

  const resetFilter = useSelector(state => state.selectionReducers.resetFilter);

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [searchString, setSearchString] = useState('');

  let listOfAllProjectsDefaultWithOutSort = useSelector(state => state.projectReducers.listOfProjects);
  let listOfAllProjectsDefault = [...listOfAllProjectsDefaultWithOutSort].sort(compareCreatedAtDateDesc);
  let filteredListOfProjects = useSelector(state => state.projectReducers.listOfFilteredProjects);

  const searchName = useSelector(state => state.projectReducers.searchName);
  const searchTarget = useSelector(state => state.projectReducers.searchTarget);
  const searchDescription = useSelector(state => state.projectReducers.searchDescription);
  const searchTargetAccessStringValue = useSelector(state => state.projectReducers.searchTargetAccessString);
  const searchAuthority = useSelector(state => state.projectReducers.searchAuthority);
  const searchDateFrom = useSelector(state => state.projectReducers.searchDateFrom);
  const searchDateTo = useSelector(state => state.projectReducers.searchDateTo);

  const filters = useSelector(state => state.selectionReducers.filter);

  const isActiveFilter = !!(filters || {}).active;
  const filterClean = useSelector(state => state.projectReducers.filterClean);

  let listOfAllProjects = [...listOfAllProjectsDefault].sort(compareCreatedAtDateDesc);

  useEffect(() => {
    if (filteredProjectList.length !== 0) {
      dispatch(setListOfProjects(filteredProjectList));
    }
    if (resetFilter === true) {
      setSearchString(' ');
    }
  }, [filteredProjectListByName, startDate, endDate, searchString, resetFilter]);

  useEffect(() => {
    if (isActiveFilter) {
      listOfAllProjectsDefault = sortProjects(listOfAllProjectsDefault, filters);
      dispatch(setListOfProjects(listOfAllProjectsDefault));
      if (filteredListOfProjects !== undefined) {
        filteredListOfProjects = sortProjects(filteredListOfProjects, filters);
        dispatch(setListOfFilteredProjects(filteredListOfProjects.sort(compareCreatedAtDateDesc)));
      }
    }
  }, [filter]);

  useEffect(() => {
    // remove filter data
    if (filterClean === true) {
      searchNameString = '';
      searchTargetString = '';
      searchTargetAccessString = '';
      searchDescriptionString = '';
      searchAuthorityString = '';
      filteredProjectListByName = [];
      filteredProjectListByTarget = [];
      filteredProjectListByTargetAccessString = [];
      filteredProjectListByDescription = [];
      filteredProjectListByAuthority = [];
      filteredProjectListByCreatedFrom = [];
      filteredProjectListByCreatedTo = [];
      filteredProjectListDate = [];
    }
  }, [filterClean]);

  const onChangeFilterString = (event, property) => {
    if (property === 'Name') {
      dispatch(setSearchName(event.target.value));
    } else if (property === 'Target') {
      dispatch(setSearchTarget(event.target.value));
    } else if (property === 'Target access string') {
      dispatch(setSearchTargetAccessString(event.target.value));
    } else if (property === 'Description') {
      dispatch(setSearchDescription(event.target.value));
    } else if (property === 'Authority') {
      dispatch(setSearchAuthority(event.target.value));
    }

    if (resetFilter === false) {
      setSearchString(event.target.value);
    } else if (resetFilter === true) {
      return ProjectListSortFilterItem;
    }
    /* signal to React not to nullify the event object */
    onChangeFilterStringDebounce(event.target.value);
  };

  const onChangeFilterStartDate = event => {
    const formattedDate = moment(event).format('MM/DD/YYYY');
    const formattedStartDate = event.toISOString();
    dispatch(setSearchDateFrom(formattedDate));
    setStartDate(event);

    if (filteredListOfProjects === undefined) {
      filteredProjectListByCreatedFrom = listOfAllProjects.filter(date => date.init_date > formattedStartDate);
    } else {
      filteredProjectListByCreatedFrom = filteredListOfProjects.filter(date => date.init_date > formattedStartDate);
    }
    if (filteredProjectListByCreatedTo.length > 0 && filteredProjectListByCreatedFrom.length > 0) {
      const filteredListOfProjectsByDate = filteredProjectListByCreatedFrom.filter(item1 =>
        filteredProjectListByCreatedTo.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredProjectsByDate(filteredListOfProjectsByDate));
    } else {
      filteredProjectListDate = filteredProjectListByCreatedFrom;
      dispatch(setListOfFilteredProjectsByDate(filteredProjectListDate));
    }
  };

  const onChangeFilterEndDate = event => {
    const formattedEndDate = new Date(event.getTime() - event.getTimezoneOffset() * 779900).toISOString();
    const formattedDate = moment(event).format('MM/DD/YYYY');
    dispatch(setSearchDateTo(formattedDate));
    setEndDate(event);
    if (filteredListOfProjects === undefined) {
      filteredProjectListByCreatedTo = listOfAllProjects.filter(date => date.init_date <= formattedEndDate + 1);
    } else {
      filteredProjectListByCreatedTo = filteredListOfProjects.filter(date => date.init_date <= formattedEndDate + 1);
    }
    if (filteredProjectListByCreatedTo.length > 0 && filteredProjectListByCreatedFrom.length > 0) {
      const filteredListOfProjectsByDate = filteredProjectListByCreatedFrom.filter(item1 =>
        filteredProjectListByCreatedTo.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredProjectsByDate(filteredListOfProjectsByDate));
    } else {
      filteredProjectListDate = filteredProjectListByCreatedTo;
      dispatch(setListOfFilteredProjects(filteredProjectListDate));
    }
  };

  const filterAllData = value => {
    if (searchNameString !== '' && searchTargetString !== '') {
      let filteredData1 = filteredProjectListByName.filter(item1 =>
        filteredProjectListByTarget.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }

    if (searchNameString !== '' && searchTargetAccessString !== '') {
      let filteredData1 = filteredProjectListByName.filter(item1 =>
        filteredProjectListByTargetAccessString.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }

    if (searchNameString !== '' && searchDescriptionString !== '') {
      let filteredData1 = filteredProjectListByName.filter(item1 =>
        filteredProjectListByDescription.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }

    if (searchNameString !== '' && searchAuthorityString !== '') {
      let filteredData1 = filteredProjectListByName.filter(item1 =>
        filteredProjectListByAuthority.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }

    if (searchTargetString !== '' && searchTargetAccessString !== '') {
      let filteredData1 = filteredProjectListByTarget.filter(item1 =>
        filteredProjectListByTargetAccessString.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }

    if (searchTargetString !== '' && searchDescriptionString !== '') {
      let filteredData1 = filteredProjectListByTarget.filter(item1 =>
        filteredProjectListByDescription.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }

    if (searchTargetString !== '' && searchAuthorityString !== '') {
      let filteredData1 = filteredProjectListByTarget.filter(item1 =>
        filteredProjectListByAuthority.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }

    if (searchTargetAccessString !== '' && searchDescriptionString !== '') {
      let filteredData1 = filteredProjectListByTargetAccessString.filter(item1 =>
        filteredProjectListByDescription.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }

    if (searchDescriptionString !== '' && searchAuthorityString !== '') {
      let filteredData1 = filteredProjectListByDescription.filter(item1 =>
        filteredProjectListByAuthority.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }

    if (
      searchNameString !== '' &&
      searchTargetString !== '' &&
      searchTargetAccessString !== '' &&
      (property === 'Name' || property === 'Target' || property === 'Target access string')
    ) {
      let filteredData1 = filteredProjectListByName.filter(
        item1 =>
          filteredProjectListByTarget.some(item2 => item2.id === item1.id) &&
          filteredProjectListByTargetAccessString.some(item3 => item3.id === item1.id)
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }

    if (searchNameString !== '' && searchTargetString !== '' && searchDescriptionString !== '') {
      let filteredData1 = filteredProjectListByName.filter(
        item1 =>
          filteredProjectListByTarget.some(item2 => item2.id === item1.id) &&
          filteredProjectListByDescription.some(item3 => item3.id === item1.id)
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }

    if (searchNameString !== '' && searchTargetString !== '' && searchAuthorityString !== '') {
      let filteredData1 = filteredProjectListByName.filter(
        item1 =>
          filteredProjectListByTarget.some(item2 => item2.id === item1.id) &&
          filteredProjectListByAuthority.some(item3 => item3.id === item1.id)
      );

      dispatch(setListOfFilteredProjects(filteredData1));
    }
    if (searchTargetString !== '' && searchTargetAccessString !== '' && searchDescriptionString !== '') {
      let filteredData1 = filteredProjectListByTarget.filter(
        item1 =>
          filteredProjectListByTargetAccessString.some(item2 => item2.id === item1.id) &&
          filteredProjectListByDescription.some(item3 => item3.id === item1.id)
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }

    if (searchTargetString !== '' && searchTargetAccessString !== '' && searchAuthorityString !== '') {
      let filteredData1 = filteredProjectListByTarget.filter(
        item1 =>
          filteredProjectListByTargetAccessString.some(item2 => item2.id === item1.id) &&
          filteredProjectListByAuthority.some(item3 => item3.id === item1.id)
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }

    if (searchTargetAccessString !== '' && searchDescriptionString !== '' && searchAuthorityString !== '') {
      let filteredData1 = filteredProjectListByTargetAccessString.filter(
        item1 =>
          filteredProjectListByDescription.some(item2 => item2.id === item1.id) &&
          filteredProjectListByAuthority.some(item3 => item3.id === item1.id)
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }

    if (
      searchNameString !== '' &&
      searchTargetString === '' &&
      searchDescriptionString === '' &&
      searchTargetAccessString === '' &&
      searchAuthorityString === ''
    ) {
      const filteredData1 = listOfAllProjects.filter(item =>
        item.title.toLowerCase().includes(searchNameString.toLowerCase())
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }
    if (
      searchTargetString !== '' &&
      searchNameString === '' &&
      searchDescriptionString === '' &&
      searchTargetAccessString === '' &&
      searchAuthorityString === ''
    ) {
      const filteredData1 = listOfAllProjects.filter(item =>
        item.target.title.toLowerCase().includes(searchTargetString.toLowerCase())
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }
    if (
      searchDescriptionString !== '' &&
      searchTargetString === '' &&
      searchTargetAccessString === '' &&
      searchNameString == '' &&
      searchAuthorityString === ''
    ) {
      const filteredData1 = listOfAllProjects.filter(item =>
        item.description.toLowerCase().includes(searchDescriptionString.toLowerCase())
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }
    if (
      searchTargetAccessString !== '' &&
      searchTargetString === '' &&
      searchDescriptionString === '' &&
      searchNameString === '' &&
      searchTargetAccessString === ''
    ) {
      const filteredData1 = listOfAllProjects.filter(item =>
        item.project.target_access_string.toLowerCase().includes(searchTargetAccessString.toLowerCase())
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }
    if (
      searchAuthorityString !== '' &&
      searchTargetString === '' &&
      searchDescriptionString === '' &&
      searchNameString === '' &&
      searchTargetAccessString === ''
    ) {
      const filteredData1 = listOfAllProjects.filter(item =>
        item.project?.authority.toLowerCase().includes(searchAuthorityString.toLowerCase())
      );
      dispatch(setListOfFilteredProjects(filteredData1));
    }
    if (
      searchNameString === '' &&
      searchTargetString === '' &&
      searchDescriptionString === '' &&
      searchTargetAccessString === '' &&
      searchAuthorityString === ''
    ) {
      const filteredData1 = sortProjects(listOfAllProjects, filters);
      dispatch(setListOfFilteredProjects(filteredData1));
      dispatch(setListOfProjects(filteredData1));
    }
  };

  const onChangeFilterStringDebounce = debounce(value => {
    if (property === 'Name') {
      searchNameString = value;
      if (filteredProjectListDate.length > 0) {
        filteredProjectListByName = listOfAllProjects.filter(item =>
          item.title.toLowerCase().includes(value.toLowerCase())
        );
      } else {
        filteredProjectListByName = listOfAllProjects.filter(item =>
          item.title.toLowerCase().includes(value.toLowerCase())
        );
      }
      dispatch(setListOfFilteredProjects(filteredProjectListByName));
      filterAllData(value);
    }

    if (property === 'Target') {
      searchTargetString = value;
      if (filteredProjectListDate.length > 0) {
        filteredProjectListByTarget = listOfAllProjects.filter(item =>
          item.target.title.toLowerCase().includes(value.toLowerCase())
        );
      } else {
        filteredProjectListByTarget = listOfAllProjects.filter(item =>
          item.target.title.toLowerCase().includes(value.toLowerCase())
        );
      }
      dispatch(setListOfFilteredProjects(filteredProjectListByTarget));
      filterAllData(value);
    }

    if (property === 'Target access string') {
      searchTargetAccessString = value;
      if (filteredProjectListDate.length > 0) {
        filteredProjectListByTargetAccessString = listOfAllProjects.filter(item =>
          item.project.target_access_string.toLowerCase().includes(value.toLowerCase())
        );
      } else {
        filteredProjectListByTargetAccessString = listOfAllProjects.filter(item =>
          item.project.target_access_string.toLowerCase().includes(value.toLowerCase())
        );
      }
      dispatch(setListOfFilteredProjects(filteredProjectListByTargetAccessString));
      filterAllData(value);
    }

    if (property === 'Description') {
      searchDescriptionString = value;
      if (filteredProjectListDate.length > 0) {
        filteredProjectListByDescription = listOfAllProjects.filter(item =>
          item.description.toLowerCase().includes(value.toLowerCase())
        );
      } else {
        filteredProjectListByDescription = listOfAllProjects.filter(item =>
          item.description.toLowerCase().includes(value.toLowerCase())
        );
      }
      dispatch(setListOfFilteredProjects(filteredProjectListByDescription));
      filterAllData(value);
    }

    if (property === 'Authority') {
      searchAuthorityString = value;
      if (filteredProjectListDate.length > 0) {
        filteredProjectListByAuthority = listOfAllProjects.filter(item =>
          item.project?.authority.toLowerCase().includes(value.toLowerCase())
        );
      } else {
        filteredProjectListByAuthority = listOfAllProjects.filter(item =>
          item.project?.authority.toLowerCase().includes(value.toLowerCase())
        );
      }
      dispatch(setListOfFilteredProjects(filteredProjectListByAuthority));
      filterAllData(value);
    }
  }, 1000);

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
      {resetFilter === false
        ? filter && (
            <>
              <Grid item className={classNames(classes.centered, classes.slider)} style={{ width: filterDataWidth }}>
                {dateFilter === true ? (
                  <Grid item container className={classes.gridItemHeader}>
                    <Grid item style={{ width: gridDateFromWidth }} className={classNames(classes.dateFont)}>
                      Created from
                    </Grid>
                    <Grid item style={{ width: gridDateFromInputWidth }}>
                      <DatePicker
                        className={classes.dateInputWidth}
                        selected={startDate}
                        onChange={event => onChangeFilterStartDate(event)}
                        placeholderText="MM/DD/YYYY"
                        value={searchDateFrom}
                      />
                    </Grid>

                    <Grid item style={{ width: gridDateFromWidth }} className={classNames(classes.dateFont)}>
                      Created to
                    </Grid>
                    <Grid item style={{ width: gridDateFromInputWidth }}>
                      <DatePicker
                        style={{ borderRadius: '10', fontSize: '10px' }}
                        className={classes.dateInputWidth}
                        selected={endDate}
                        onChange={event => onChangeFilterEndDate(event)}
                        placeholderText="MM/DD/YYYY"
                        value={searchDateTo}
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <TextField
                    id="textFieldInput"
                    placeholder="Search"
                    onChange={event => onChangeFilterString(event)}
                    key={property}
                    value={
                      property === 'Name'
                        ? searchName
                        : property === 'Target'
                        ? searchTarget
                        : property === 'Description'
                        ? searchDescription
                        : property === 'Target access string'
                        ? searchTargetAccessStringValue
                        : property === 'Authority'
                        ? searchAuthority
                        : ''
                    }
                  ></TextField>
                )}
              </Grid>
            </>
          )
        : filter && (
            <>
              <Grid item className={classNames(classes.centered, classes.slider)} style={{ width: filterDataWidth }}>
                {dateFilter === true ? (
                  <Grid item container className={classes.gridItemHeader}>
                    <Grid item style={{ width: gridDateFromWidth }} className={classNames(classes.dateFont)}>
                      Created from
                    </Grid>
                    <Grid item style={{ width: gridDateFromInputWidth }}>
                      <DatePicker
                        className={classes.dateInputWidth}
                        selected={startDate}
                        onChange={event => onChangeFilterStartDate(event)}
                        placeholderText="MM/DD/YYYY"
                        value={searchDateFrom}
                      />
                    </Grid>
                    <Grid item style={{ width: gridDateFromWidth }} className={classNames(classes.dateFont)}>
                      Created to
                    </Grid>
                    <Grid item style={{ width: gridDateFromInputWidth }}>
                      <DatePicker
                        style={{ borderRadius: '10', fontSize: '10px' }}
                        className={classes.dateInputWidth}
                        selected={endDate}
                        onChange={event => onChangeFilterEndDate(event)}
                        placeholderText="MM/DD/YYYY"
                        value={searchDateTo}
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <TextField
                    id="textFieldInput"
                    placeholder="Search"
                    onChange={event => onChangeFilterString(event, property)}
                    key={property}
                    value={
                      property === 'Name'
                        ? searchName
                        : property === 'Target'
                        ? searchTarget
                        : property === 'Description'
                        ? searchDescription
                        : property === 'Target access string'
                        ? searchTargetAccessStringValue
                        : property === 'Authority'
                        ? searchAuthority
                        : ''
                    }
                  ></TextField>
                )}
              </Grid>
            </>
          )}
    </Grid>
  );
});

ProjectListSortFilterItem.propTypes = {
  order: PropTypes.number.isRequired,
  property: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  isFloat: PropTypes.bool,
  disabled: PropTypes.bool,
  filter: PropTypes.bool,
  dateFilter: PropTypes.bool
};

export default ProjectListSortFilterItem;
