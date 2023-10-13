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
  setSearchTarget,
  setSearchNumberOfChains,
  setSearchPrimaryChain,
  setSearchUniprot,
  setSearchRange,
  setSearchProteinName,
  setSearchGeneName,
  setSearchSpecies,
  setSearchDomain,
  setSearchECNumber,
  setSearchNHits,
  setSearchDateLastEditFrom,
  setSearchDateLastEditTo,
  setSearchDateFrom,
  setSearchDateTo,
  setSearchTargetAccessString,
  setSearchInitDateFrom,
  setSearchInitDateTo
} from './redux/actions';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { compareTargetAsc } from './sortTargets/sortTargets';
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
const widthOrder = 110;
const widthProperty = 150;
const gridDateFromWidth = 85;
const gridDateFromInputWidth = 90;
const filterDataWidth = 200;

let filteredTargetList = [];

let searchTargetString = '';
let searchNumberOfChainsString = '';
let searchPrimaryChainString = '';
let searchUniprotString = '';
let searchRangeString = '';
let searchProteinNameString = ''; // TODO implement parameters
let searchGeneNameString = '';
let searchSpeciesString = '';
let searchDomainString = '';
let searchECNumberString = '';
let searchNHitsString = '';
let searchDateLastEditFromString = '';
let searchDateLastEditToString = '';
let searchTargetAccessStringString = '';

let filteredTargetListByTarget = [];
let filteredTargetListByNumberOfChains = [];
let filteredTargetListByPrimaryChain = [];
let filteredTargetListByUniprot = [];
let filteredTargetListByRange = [];
let filteredTargetListByProteinName = [];
let filteredTargetListByGeneName = [];
let filteredTargetListBySpecies = [];
let filteredTargetListByDomain = [];
let filteredTargetListByInitDateFrom = [];
let filteredTargetListByInitDateTo = [];
let filteredProjectListInitDate = [];
let filteredTargetListByECNumber = [];
let filteredTargetListByNHits = [];
let filteredTargetListByTargetAccessString = [];

const TargetListSortFilterItem = memo(props => {
  const dispatch = useDispatch();
  const { property, onChange, color, onChangePrio, filter, dateFilter } = props;
  const { order } = props;

  let classes = useStyles();

  let setting = {
    order: order
  };
  const target_id_list = useSelector(state => state.apiReducers.target_id_list);
  const resetFilter = useSelector(state => state.selectionReducers.resetFilter);

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [searchString, setSearchString] = useState('');

  //let listOfAllTargetsDefaultWithOutSort = useSelector(state => state.targetReducers.listOfTargets);
  let listOfAllTargetsDefaultWithOutSort = target_id_list; // remove after real data
  let listOfAllTargetsDefault = [...listOfAllTargetsDefaultWithOutSort].sort(compareTargetAsc);
  let filteredListOfTargets = useSelector(state => state.targetReducers.listOfFilteredTargets);

  const searchTarget = useSelector(state => state.targetReducers.searchTarget);
  const searchNumberOfChains = useSelector(state => state.targetReducers.searchNumberOfChains);
  const searchPrimaryChain = useSelector(state => state.targetReducers.searchPrimaryChain);
  const searchUniprot = useSelector(state => state.targetReducers.searchUniprot);
  const searchRange = useSelector(state => state.targetReducers.searchRange);
  const searchProteinName = useSelector(state => state.targetReducers.searchProteinName);
  const searchGeneName = useSelector(state => state.targetReducers.searchGeneName);
  const searchSpecies = useSelector(state => state.targetReducers.searchSpecies);
  const searchDomain = useSelector(state => state.targetReducers.searchDomain);
  const searchECNumber = useSelector(state => state.targetReducers.searchECNumber);
  const searchNHits = useSelector(state => state.targetReducers.searchNHits);
  const searchDateLastEditFrom = useSelector(state => state.targetReducers.searchDateLastEditFrom);
  const searchDateLastEditTo = useSelector(state => state.targetReducers.searchDateLastEditTo);
  const searchTargetAccessString = useSelector(state => state.targetReducers.searchTargetAccessString);

  const listOfFilteredTargetsByDate = useSelector(state => state.targetReducers.listOfFilteredTargetsByDate);

  const filters = useSelector(state => state.selectionReducers.filter);
  const isActiveFilter = !!(filters || {}).active;
  const filterClean = useSelector(state => state.targetReducers.filterClean);

  let listOfAllTargets = [...listOfAllTargetsDefault].sort(compareTargetAsc);

  useEffect(() => {
    if (filteredTargetList.length !== 0) {
      dispatch(setListOfTargets(filteredTargetList));
    }
    if (resetFilter === true) {
      setSearchString(' ');
    }
  }, [startDate, endDate, searchString, resetFilter]);

  useEffect(() => {
    if (isActiveFilter) {
      listOfAllTargetsDefault = sortTargets(listOfAllTargetsDefault, filters);
      dispatch(setListOfTargets(listOfAllTargetsDefault));
      if (filteredListOfTargets !== undefined) {
        filteredListOfTargets = sortTargets(filteredListOfTargets, filters);
        dispatch(setListOfFilteredTargets(filteredListOfTargets.sort(compareTargetAsc)));
      }
    }
  }, [filter]);

  useEffect(() => {
    // remove filter data
    if (filterClean === true) {
      searchNumberOfChainsString = '';
      searchTargetString = '';
      searchPrimaryChainString = '';
      searchRangeString = '';
      searchUniprotString = '';
      searchProteinNameString = '';
      searchGeneNameString = '';
      searchSpeciesString = '';
      searchDomainString = '';
      searchECNumberString = '';
      searchNHitsString = '';
      searchDateLastEditFromString = '';
      searchDateLastEditToString = '';
      filteredTargetListByTarget = [];
      filteredTargetListByNumberOfChains = [];
      filteredTargetListByPrimaryChain = [];
      filteredTargetListByUniprot = [];
      filteredTargetListByRange = [];
      filteredTargetListByProteinName = [];
      filteredTargetListByGeneName = [];
      filteredTargetListByTargetAccessString = [];
      filteredTargetListByInitDateFrom = [];
      filteredTargetListByInitDateTo = [];
      filteredProjectListInitDate = [];
    }
  }, [filterClean]);

  const onChangeFilterString = (event, property) => {
    if (property === 'Target') {
      dispatch(setSearchTarget(event.target.value));
    } else if (property === 'Number of chains') {
      dispatch(setSearchNumberOfChains(event.target.value));
    } else if (property === 'Target access string') {
      dispatch(setSearchTargetAccessString(event.target.value));
    } else if (property === 'Primary chain') {
      dispatch(setSearchPrimaryChain(event.target.value));
    } else if (property === 'Uniprot') {
      dispatch(setSearchUniprot(event.target.value));
    } else if (property === 'Range') {
      dispatch(setSearchRange(event.target.value));
    } else if (property === 'Protein name') {
      dispatch(setSearchProteinName(event.target.value));
    } else if (property === 'Gene name') {
      dispatch(setSearchGeneName(event.target.value));
    } else if (property === 'Species') {
      dispatch(setSearchSpecies(event.target.value));
    } else if (property === 'Domain') {
      dispatch(setSearchDomain(event.target.value));
    } else if (property === 'EC number') {
      dispatch(setSearchECNumber(event.target.value));
    } else if (property === 'N hits') {
      dispatch(setSearchNHits(event.target.value));
    } else if (property === 'Date last edit from') {
      dispatch(setSearchDateLastEditFrom(event.target.value));
    } else if (property === 'Date last edit to') {
      dispatch(setSearchDateLastEditTo(event.target.value));
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
    const formattedDate = moment(event).format('YYYY-MM-DD');
    const formattedStartDate = event.toISOString();
    dispatch(setSearchInitDateFrom(formattedDate));
    setStartDate(event);

    if (filteredListOfTargets === undefined) {
      filteredTargetListByInitDateFrom = listOfAllTargets.filter(date => date.project.init_date > formattedStartDate);
    } else {
      filteredTargetListByInitDateFrom = filteredListOfTargets.filter(
        date => date.project.init_date > formattedStartDate
      );
    }
    if (filteredTargetListByInitDateTo.length > 0 && filteredTargetListByInitDateFrom.length > 0) {
      const filteredListOfTargetsByInitDate = filteredTargetListByInitDateFrom.filter(item1 =>
        filteredTargetListByInitDateTo.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargetsByDate(filteredListOfTargetsByInitDate));
    } else {
      filteredProjectListInitDate = filteredTargetListByInitDateFrom;
      dispatch(setListOfFilteredTargetsByDate(filteredProjectListInitDate));
    }
  };

  const onChangeFilterEndDate = event => {
    const formattedEndDate = new Date(event.getTime() - event.getTimezoneOffset() * 779900).toISOString();
    const formattedDate = moment(event).format('YYYY-MM-DD');
    dispatch(setSearchInitDateTo(formattedDate));
    setEndDate(event);
    if (filteredListOfTargets === undefined) {
      filteredTargetListByInitDateTo = listOfAllTargets.filter(date => date.project.init_date <= formattedEndDate + 1);
    } else {
      filteredTargetListByInitDateTo = filteredListOfTargets.filter(
        date => date.project.init_date <= formattedEndDate + 1
      );
    }
    if (filteredTargetListByInitDateTo.length > 0 && filteredTargetListByInitDateFrom.length > 0) {
      const filteredListOfTargetsByDate = filteredTargetListByInitDateFrom.filter(item1 =>
        filteredTargetListByInitDateTo.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargetsByDate(filteredListOfTargetsByDate));
    } else {
      filteredProjectListInitDate = filteredTargetListByInitDateTo;
      dispatch(setListOfFilteredTargets(filteredProjectListInitDate));
    }
  };

  const filterAllData = value => {
    if (searchTargetString !== '' && searchTargetAccessStringString !== '') {
      let filteredData1 = filteredTargetListByTarget.filter(item1 =>
        filteredTargetListByTargetAccessString.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchTargetString !== '' && searchRangeString !== '') {
      let filteredData1 = filteredTargetListByTarget.filter(item1 =>
        filteredTargetListByPrimaryChain.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchTargetString !== '' && searchUniprotString !== '') {
      let filteredData1 = filteredTargetListByTarget.filter(item1 =>
        filteredTargetListByUniprot.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchPrimaryChainString !== '' && searchRangeString !== '') {
      let filteredData1 = filteredTargetListByNumberOfChains.filter(item1 =>
        filteredTargetListByPrimaryChain.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchRangeString !== '' && searchUniprotString !== '') {
      let filteredData1 = filteredTargetListByPrimaryChain.filter(item1 =>
        filteredTargetListByUniprot.some(item2 => item2.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchTargetString !== '' && searchPrimaryChainString !== '' && searchRangeString !== '') {
      let filteredData1 = filteredTargetListByTarget.filter(
        item1 =>
          filteredTargetListByNumberOfChains.some(item2 => item2.id === item1.id) &&
          filteredTargetListByPrimaryChain.some(item3 => item3.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchTargetString !== '' && searchPrimaryChainString !== '' && searchUniprotString !== '') {
      let filteredData1 = filteredTargetListByTarget.filter(
        item1 =>
          filteredTargetListByNumberOfChains.some(item2 => item2.id === item1.id) &&
          filteredTargetListByUniprot.some(item3 => item3.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (searchPrimaryChainString !== '' && searchRangeString !== '' && searchUniprotString !== '') {
      let filteredData1 = filteredTargetListByNumberOfChains.filter(
        item1 =>
          filteredTargetListByPrimaryChain.some(item2 => item2.id === item1.id) &&
          filteredTargetListByUniprot.some(item3 => item3.id === item1.id)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }

    if (
      searchNumberOfChainsString !== '' &&
      searchTargetString === '' &&
      searchRangeString === '' &&
      searchPrimaryChainString === '' &&
      searchUniprotString === ''
    ) {
      const filteredData1 = listOfAllTargets.filter(item =>
        item.numberOfChains.toString().includes(searchNumberOfChainsString)
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }
    if (
      searchTargetString !== '' &&
      searchNumberOfChainsString === '' &&
      searchRangeString === '' &&
      searchPrimaryChainString === '' &&
      searchUniprotString === ''
    ) {
      const filteredData1 = listOfAllTargets.filter(item =>
        item.title.toLowerCase().includes(searchTargetString.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }
    if (
      searchRangeString !== '' &&
      searchTargetString === '' &&
      searchPrimaryChainString === '' &&
      searchNumberOfChainsString == '' &&
      searchUniprotString === ''
    ) {
      const filteredData1 = listOfAllTargets.filter(item => item.range.toString().includes(searchRangeString));
      dispatch(setListOfFilteredTargets(filteredData1));
    }
    if (
      searchPrimaryChainString !== '' &&
      searchTargetString === '' &&
      searchRangeString === '' &&
      searchNumberOfChainsString === '' &&
      searchPrimaryChainString === ''
    ) {
      const filteredData1 = listOfAllTargets.filter(item =>
        item.primaryChain.toLowerCase().includes(searchPrimaryChainString.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }
    if (
      searchUniprotString !== '' &&
      searchTargetString === '' &&
      searchRangeString === '' &&
      searchNumberOfChainsString === '' &&
      searchPrimaryChainString === ''
    ) {
      const filteredData1 = listOfAllTargets.filter(item =>
        item.uniprot.toLowerCase().includes(searchUniprotString.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredData1));
    }
    if (
      searchNumberOfChainsString === '' &&
      searchTargetString === '' &&
      searchRangeString === '' &&
      searchPrimaryChainString === '' &&
      searchUniprotString === ''
    ) {
      const filteredData1 = sortTargets(listOfAllTargets, filters);
      dispatch(setListOfFilteredTargets(filteredData1));
      dispatch(setListOfTargets(filteredData1));
    }
  };

  const onChangeFilterStringDebounce = debounce(value => {
    if (property === 'Target') {
      searchTargetString = value;
      filteredTargetListByTarget = listOfAllTargets.filter(item =>
        item.title.toLowerCase().includes(value.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredTargetListByTarget));
      filterAllData(value);
    }

    if (property === 'Target access string') {
      searchTargetAccessStringString = value;
      filteredTargetListByTargetAccessString = listOfAllTargets.filter(item =>
        item.project.target_access_string.toLowerCase().includes(value.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredTargetListByTargetAccessString));
      filterAllData(value);
    }

    if (property === 'Number of chains') {
      searchNumberOfChainsString = value;
      filteredTargetListByNumberOfChains = listOfAllTargets.filter(item =>
        item.numberOfChains.toString().includes(value)
      );
      dispatch(setListOfFilteredTargets(filteredTargetListByNumberOfChains));
      filterAllData(value);
    }

    if (property === 'Primary chain') {
      searchPrimaryChainString = value;
      filteredTargetListByPrimaryChain = listOfAllTargets.filter(item =>
        item.primaryChain.toLowerCase().includes(value.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredTargetListByPrimaryChain));
      filterAllData(value);
    }

    if (property === 'Uniprot') {
      searchUniprotString = value;
      filteredTargetListByUniprot = listOfAllTargets.filter(item =>
        item.uniprot.toLowerCase().includes(value.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredTargetListByUniprot));
      filterAllData(value);
    }
    if (property === 'Range') {
      searchRangeString = value;
      filteredTargetListByRange = listOfAllTargets.filter(item => item.range.toString().includes(value));
      dispatch(setListOfFilteredTargets(filteredTargetListByRange));
      filterAllData(value);
    }
    if (property === 'Protein name') {
      searchProteinNameString = value;
      filteredTargetListByProteinName = listOfAllTargets.filter(item =>
        item.proteinName.toLowerCase().includes(value.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredTargetListByProteinName));
      filterAllData(value);
    }
    if (property === 'Gene name') {
      searchGeneNameString = value;
      filteredTargetListByGeneName = listOfAllTargets.filter(item =>
        item.geneName.toLowerCase().includes(value.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredTargetListByGeneName));
      filterAllData(value);
    }
    if (property === 'Species') {
      searchSpeciesString = value;
      filteredTargetListBySpecies = listOfAllTargets.filter(item =>
        item.uniprot.toLowerCase().includes(value.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredTargetListBySpecies));
      filterAllData(value);
    }
    if (property === 'Domain') {
      searchDomainString = value;
      filteredTargetListByDomain = listOfAllTargets.filter(item =>
        item.domain.toLowerCase().includes(value.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredTargetListByDomain));
      filterAllData(value);
    }
    if (property === 'EC number') {
      searchECNumberString = value;
      filteredTargetListByECNumber = listOfAllTargets.filter(item =>
        item.ECNumber.toLowerCase().includes(value.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredTargetListByECNumber));
      filterAllData(value);
    }
    if (property === 'N hits') {
      searchNHitsString = value;
      filteredTargetListByNHits = listOfAllTargets.filter(item => item.NHits.toString().includes(value));
      dispatch(setListOfFilteredTargets(filteredTargetListByNHits));
      filterAllData(value);
    }
    if (property === 'Date last edit from') {
      searchDateLastEditFromString = value;
      filteredTargetListByDateLastEditFrom = listOfAllTargets.filter(item =>
        item.dateLastEditFrom.toLowerCase().includes(value.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredTargetListByDateLastEditFrom));
      filterAllData(value);
    }
    if (property === 'Date last edit to') {
      searchDateLastEditToString = value;
      filteredTargetListByDateLastEditTo = listOfAllTargets.filter(item =>
        item.dateLastEditTo.toLowerCase().includes(value.toLowerCase())
      );
      dispatch(setListOfFilteredTargets(filteredTargetListByDateLastEditTo));
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
          style={{ left: 2 }}
          checked={order === -1}
          onChange={handleChangeOrder}
          value={-1}
          name="radio-button-demo"
        />
        <Radio checked={order === 1} onChange={handleChangeOrder} value={1} name="radio-button-demo" />
        <Radio checked={order === 0} onChange={handleChangeOrder} value={0} name="radio-button-demo" />
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
                      Init date from
                    </Grid>
                    <Grid item style={{ width: gridDateFromInputWidth }}>
                      <DatePicker
                        className={classes.dateInputWidth}
                        selected={startDate}
                        onChange={event => onChangeFilterStartDate(event)}
                        placeholderText="YYYY-MM-DD"
                        value={searchDateLastEditFrom}
                      />
                    </Grid>

                    <Grid item style={{ width: gridDateFromWidth }} className={classNames(classes.dateFont)}>
                      Init date to
                    </Grid>
                    <Grid item style={{ width: gridDateFromInputWidth }}>
                      <DatePicker
                        style={{ borderRadius: '10', fontSize: '10px' }}
                        className={classes.dateInputWidth}
                        selected={endDate}
                        onChange={event => onChangeFilterEndDate(event)}
                        placeholderText="YYYY-MM-DD"
                        value={searchDateLastEditTo}
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
                      property === 'Target'
                        ? searchTarget
                        : property === 'Number of chains'
                        ? searchNumberOfChains
                        : property === 'Primary chain'
                        ? searchPrimaryChain
                        : property === 'Uniprot'
                        ? searchUniprot
                        : property === 'Range'
                        ? searchRange
                        : property === 'Protein name'
                        ? searchProteinName
                        : property === 'Gene name'
                        ? searchGeneName
                        : property === 'Species'
                        ? searchSpecies
                        : property === 'Domain'
                        ? searchDomain
                        : property === 'EC number'
                        ? searchECNumber
                        : property === 'N hits'
                        ? searchNHits
                        : property === 'Date last edit from'
                        ? searchDateLastEditFrom
                        : property === 'Date last edit to'
                        ? searchDateLastEditTo
                        : property === 'Target access string'
                        ? searchTargetAccessString
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
                      Init date from
                    </Grid>
                    <Grid item style={{ width: gridDateFromInputWidth }}>
                      <DatePicker
                        className={classes.dateInputWidth}
                        selected={startDate}
                        onChange={event => onChangeFilterStartDate(event)}
                        placeholderText="YYYY-MM-DD"
                        value={searchDateLastEditFrom}
                      />
                    </Grid>
                    <Grid item style={{ width: gridDateFromWidth }} className={classNames(classes.dateFont)}>
                      Init date to
                    </Grid>
                    <Grid item style={{ width: gridDateFromInputWidth }}>
                      <DatePicker
                        style={{ borderRadius: '10', fontSize: '10px' }}
                        className={classes.dateInputWidth}
                        selected={endDate}
                        onChange={event => onChangeFilterEndDate(event)}
                        placeholderText="YYYY-MM-DD"
                        value={searchDateLastEditTo}
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
                      property === 'Target'
                        ? searchTarget
                        : property === 'Number of chains'
                        ? searchNumberOfChains
                        : property === 'Primary chain'
                        ? searchPrimaryChain
                        : property === 'Uniprot'
                        ? searchUniprot
                        : property === 'Range'
                        ? searchRange
                        : property === 'Protein name'
                        ? searchProteinName
                        : property === 'Gene name'
                        ? searchGeneName
                        : property === 'Species'
                        ? searchSpecies
                        : property === 'Domain'
                        ? searchDomain
                        : property === 'EC number'
                        ? searchECNumber
                        : property === 'N hits'
                        ? searchNHits
                        : property === 'Date last edit from'
                        ? searchDateLastEditFrom
                        : property === 'Date last edit to'
                        ? searchDateLastEditTo
                        : property === 'Target access string'
                        ? searchTargetAccessString
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
