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
  setListOfTargets,
  setListOfFilteredTargets,
  setListOfFilteredTargetsByDate,
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
import { compareCreatedAtDateDesc } from './sortTargets/sortTargets';
import moment from 'moment';
import { sortTargets } from './targetListSortFilterDialog';
import { MOCK_LIST_OF_TARGETS } from './MOCK';

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
const gridDateFromWidth = 85;
const gridDateFromInputWidth = 90;
const filterDataWidth = 200;

let filteredTargetList = [];
let searchNameString = '';
let searchTargetString = '';
let searchTargetAccessString = '';
let searchDescriptionString = '';
let searchAuthorityString = '';

let filteredTargetListByName = [];
let filteredTargetListByTarget = [];
let filteredTargetListByTargetAccessString = [];
let filteredTargetListByDescription = [];
let filteredTargetListByAuthority = [];
let filteredTargetListByCreatedFrom = [];
let filteredTargetListByCreatedTo = [];
let filteredTargetListDate = [];

const TargetListSortFilterItem = memo(props => {
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

  //let listOfAllTargetsDefaultWithOutSort = useSelector(state => state.targetReducers.listOfTargets);
  let listOfAllTargetsDefaultWithOutSort = MOCK_LIST_OF_TARGETS; // remove after real data
  let listOfAllTargetsDefault = [...listOfAllTargetsDefaultWithOutSort].sort(compareCreatedAtDateDesc);
  let filteredListOfTargets = useSelector(state => state.targetReducers.listOfFilteredTargets);

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

  let listOfAllTargets = [...listOfAllTargetsDefault].sort(compareCreatedAtDateDesc);

  useEffect(() => {
    if (filteredTargetList.length !== 0) {
      dispatch(setListOfTargets(filteredTargetList));
    }
    if (resetFilter === true) {
      setSearchString(' ');
    }
  }, [filteredTargetListByName, startDate, endDate, searchString, resetFilter]);

  useEffect(() => {
    if (isActiveFilter) {
      listOfAllTargetsDefault = sortTargets(listOfAllTargetsDefault, filters);
      dispatch(setListOfTargets(listOfAllTargetsDefault));
      if (filteredListOfTargets !== undefined) {
        filteredListOfTargets = sortTargets(filteredListOfTargets, filters);
        dispatch(setListOfFilteredTargets(filteredListOfTargets.sort(compareCreatedAtDateDesc)));
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
      filteredTargetListByName = [];
      filteredTargetListByTarget = [];
      filteredTargetListByTargetAccessString = [];
      filteredTargetListByDescription = [];
      filteredTargetListByAuthority = [];
      filteredTargetListByCreatedFrom = [];
      filteredTargetListByCreatedTo = [];
      filteredTargetListDate = [];
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
      return TargetListSortFilterItem;
    }
    /* signal to React not to nullify the event object */
    onChangeFilterStringDebounce(event.target.value);
  };

  const onChangeFilterStartDate = event => {
    const formattedDate = moment(event).format('MM/DD/YYYY');
    const formattedStartDate = event.toISOString();
    dispatch(setSearchDateFrom(formattedDate));
    setStartDate(event);

    if (filteredListOfTargets === undefined) {
      filteredTargetListByCreatedFrom = listOfAllTargets.filter(date => date.init_date > formattedStartDate);
    } else {
      filteredTargetListByCreatedFrom = filteredListOfTargets.filter(date => date.init_date > formattedStartDate);
    }
    if (filteredTargetListByCreatedTo.length > 0 && filteredTargetListByCreatedFrom.length > 0) {
      const filteredListOfTargetsByDate = filteredTargetListByCreatedFrom.filter(item1 =>
        filteredTargetListByCreatedTo.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargetsByDate(filteredListOfTargetsByDate));
    } else {
      filteredTargetListDate = filteredTargetListByCreatedFrom;
      dispatch(setListOfFilteredTargetsByDate(filteredTargetListDate));
    }
  };

  const onChangeFilterEndDate = event => {
    const formattedEndDate = new Date(event.getTime() - event.getTimezoneOffset() * 779900).toISOString();
    const formattedDate = moment(event).format('MM/DD/YYYY');
    dispatch(setSearchDateTo(formattedDate));
    setEndDate(event);
    if (filteredListOfTargets === undefined) {
      filteredTargetListByCreatedTo = listOfAllTargets.filter(date => date.init_date <= formattedEndDate + 1);
    } else {
      filteredTargetListByCreatedTo = filteredListOfTargets.filter(date => date.init_date <= formattedEndDate + 1);
    }
    if (filteredTargetListByCreatedTo.length > 0 && filteredTargetListByCreatedFrom.length > 0) {
      const filteredListOfTargetsByDate = filteredTargetListByCreatedFrom.filter(item1 =>
        filteredTargetListByCreatedTo.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargetsByDate(filteredListOfTargetsByDate));
    } else {
      filteredTargetListDate = filteredTargetListByCreatedTo;
      dispatch(setListOfFilteredTargets(filteredTargetListDate));
    }
  };

  const filterAllData = value => {
    if (searchNameString !== '' && searchTargetString !== '') {
      let filteredData1 = filteredTargetListByName.filter(item1 =>
        filteredTargetListByTarget.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchNameString !== '' && searchTargetAccessString !== '') {
      let filteredData1 = filteredTargetListByName.filter(item1 =>
        filteredTargetListByTargetAccessString.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchNameString !== '' && searchDescriptionString !== '') {
      let filteredData1 = filteredTargetListByName.filter(item1 =>
        filteredTargetListByDescription.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchNameString !== '' && searchAuthorityString !== '') {
      let filteredData1 = filteredTargetListByName.filter(item1 =>
        filteredTargetListByAuthority.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchTargetString !== '' && searchTargetAccessString !== '') {
      let filteredData1 = filteredTargetListByTarget.filter(item1 =>
        filteredTargetListByTargetAccessString.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchTargetString !== '' && searchDescriptionString !== '') {
      let filteredData1 = filteredTargetListByTarget.filter(item1 =>
        filteredTargetListByDescription.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchTargetString !== '' && searchAuthorityString !== '') {
      let filteredData1 = filteredTargetListByTarget.filter(item1 =>
        filteredTargetListByAuthority.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchTargetAccessString !== '' && searchDescriptionString !== '') {
      let filteredData1 = filteredTargetListByTargetAccessString.filter(item1 =>
        filteredTargetListByDescription.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchDescriptionString !== '' && searchAuthorityString !== '') {
      let filteredData1 = filteredTargetListByDescription.filter(item1 =>
        filteredTargetListByAuthority.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (
      searchNameString !== '' &&
      searchTargetString !== '' &&
      searchTargetAccessString !== '' &&
      (property === 'Name' || property === 'Target' || property === 'Target access string')
    ) {
      let filteredData1 = filteredTargetListByName.filter(
        item1 =>
          filteredTargetListByTarget.some(item2 => item2.id === item1.id) &&
          filteredTargetListByTargetAccessString.some(item3 => item3.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchNameString !== '' && searchTargetString !== '' && searchDescriptionString !== '') {
      let filteredData1 = filteredTargetListByName.filter(
        item1 =>
          filteredTargetListByTarget.some(item2 => item2.id === item1.id) &&
          filteredTargetListByDescription.some(item3 => item3.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchNameString !== '' && searchTargetString !== '' && searchAuthorityString !== '') {
      let filteredData1 = filteredTargetListByName.filter(
        item1 =>
          filteredTargetListByTarget.some(item2 => item2.id === item1.id) &&
          filteredTargetListByAuthority.some(item3 => item3.id === item1.id)
      );

      dispatch(setListOfFilteredTargets(filteredData1));
    }
    if (searchTargetString !== '' && searchTargetAccessString !== '' && searchDescriptionString !== '') {
      let filteredData1 = filteredTargetListByTarget.filter(
        item1 =>
          filteredTargetListByTargetAccessString.some(item2 => item2.id === item1.id) &&
          filteredTargetListByDescription.some(item3 => item3.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchTargetString !== '' && searchTargetAccessString !== '' && searchAuthorityString !== '') {
      let filteredData1 = filteredTargetListByTarget.filter(
        item1 =>
          filteredTargetListByTargetAccessString.some(item2 => item2.id === item1.id) &&
          filteredTargetListByAuthority.some(item3 => item3.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchTargetAccessString !== '' && searchDescriptionString !== '' && searchAuthorityString !== '') {
      let filteredData1 = filteredTargetListByTargetAccessString.filter(
        item1 =>
          filteredTargetListByDescription.some(item2 => item2.id === item1.id) &&
          filteredTargetListByAuthority.some(item3 => item3.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (
      searchNameString !== '' &&
      searchTargetString === '' &&
      searchDescriptionString === '' &&
      searchTargetAccessString === '' &&
      searchAuthorityString === ''
    ) {
      const filteredData1 = listOfAllTargets.filter(item =>
        item.title.toLowerCase().includes(searchNameString.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }
    if (
      searchTargetString !== '' &&
      searchNameString === '' &&
      searchDescriptionString === '' &&
      searchTargetAccessString === '' &&
      searchAuthorityString === ''
    ) {
      const filteredData1 = listOfAllTargets.filter(item =>
        item.target.title.toLowerCase().includes(searchTargetString.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }
    if (
      searchDescriptionString !== '' &&
      searchTargetString === '' &&
      searchTargetAccessString === '' &&
      searchNameString == '' &&
      searchAuthorityString === ''
    ) {
      const filteredData1 = listOfAllTargets.filter(item =>
        item.description.toLowerCase().includes(searchDescriptionString.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }
    if (
      searchTargetAccessString !== '' &&
      searchTargetString === '' &&
      searchDescriptionString === '' &&
      searchNameString === '' &&
      searchTargetAccessString === ''
    ) {
      const filteredData1 = listOfAllTargets.filter(item =>
        item.project.target_access_string.toLowerCase().includes(searchTargetAccessString.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }
    if (
      searchAuthorityString !== '' &&
      searchTargetString === '' &&
      searchDescriptionString === '' &&
      searchNameString === '' &&
      searchTargetAccessString === ''
    ) {
      const filteredData1 = listOfAllTargets.filter(item =>
        item.project?.authority.toLowerCase().includes(searchAuthorityString.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }
    if (
      searchNameString === '' &&
      searchTargetString === '' &&
      searchDescriptionString === '' &&
      searchTargetAccessString === '' &&
      searchAuthorityString === ''
    ) {
      const filteredData1 = sortTargets(listOfAllTargets, filters);
      dispatch(setListOfFilteredTargets(filteredData1));
      dispatch(setListOfTargets(filteredData1));
    }
  };

  const onChangeFilterStringDebounce = debounce(value => {
    if (property === 'Name') {
      searchNameString = value;
      if (filteredTargetListDate.length > 0) {
        filteredTargetListByName = listOfAllTargets.filter(item =>
          item.title.toLowerCase().includes(value.toLowerCase())
        );
      } else {
        filteredTargetListByName = listOfAllTargets.filter(item =>
          item.title.toLowerCase().includes(value.toLowerCase())
        );
      }
      dispatch(setListOfFilteredTargets(filteredTargetListByName));
      filterAllData(value);
    }

    if (property === 'Target') {
      searchTargetString = value;
      if (filteredTargetListDate.length > 0) {
        filteredTargetListByTarget = listOfAllTargets.filter(item =>
          item.target.title.toLowerCase().includes(value.toLowerCase())
        );
      } else {
        filteredTargetListByTarget = listOfAllTargets.filter(item =>
          item.target.title.toLowerCase().includes(value.toLowerCase())
        );
      }
      dispatch(setListOfFilteredTargets(filteredTargetListByTarget));
      filterAllData(value);
    }

    if (property === 'Target access string') {
      searchTargetAccessString = value;
      if (filteredTargetListDate.length > 0) {
        filteredTargetListByTargetAccessString = listOfAllTargets.filter(item =>
          item.project.target_access_string.toLowerCase().includes(value.toLowerCase())
        );
      } else {
        filteredTargetListByTargetAccessString = listOfAllTargets.filter(item =>
          item.project.target_access_string.toLowerCase().includes(value.toLowerCase())
        );
      }
      dispatch(setListOfFilteredTargets(filteredTargetListByTargetAccessString));
      filterAllData(value);
    }

    if (property === 'Description') {
      searchDescriptionString = value;
      if (filteredTargetListDate.length > 0) {
        filteredTargetListByDescription = listOfAllTargets.filter(item =>
          item.description.toLowerCase().includes(value.toLowerCase())
        );
      } else {
        filteredTargetListByDescription = listOfAllTargets.filter(item =>
          item.description.toLowerCase().includes(value.toLowerCase())
        );
      }
      dispatch(setListOfFilteredTargets(filteredTargetListByDescription));
      filterAllData(value);
    }

    if (property === 'Authority') {
      searchAuthorityString = value;
      if (filteredTargetListDate.length > 0) {
        filteredTargetListByAuthority = listOfAllTargets.filter(item =>
          item.project?.authority.toLowerCase().includes(value.toLowerCase())
        );
      } else {
        filteredTargetListByAuthority = listOfAllTargets.filter(item =>
          item.project?.authority.toLowerCase().includes(value.toLowerCase())
        );
      }
      dispatch(setListOfFilteredTargets(filteredTargetListByAuthority));
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
                      Last edit from
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
                      Last edit to
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
                      Last edit from
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
                      Last edit to
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

TargetListSortFilterItem.propTypes = {
  order: PropTypes.number.isRequired,
  property: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  isFloat: PropTypes.bool,
  disabled: PropTypes.bool,
  filter: PropTypes.bool,
  dateFilter: PropTypes.bool
};

export default TargetListSortFilterItem;
