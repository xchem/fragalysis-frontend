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
import { MOCK_LIST_OF_TARGETS } from './MOCK';
import { getCombinedTargetList } from '../../reducers/api/selectors';

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

const TargetListSortFilterItem = memo(props => {
  const dispatch = useDispatch();
  const { property, onChange, color, onChangePrio, filter, dateFilter } = props;
  const { order } = props;

  let classes = useStyles();

  // const target_id_list = useSelector(state => state.apiReducers.target_id_list);
  const target_id_list = useSelector(state => getCombinedTargetList(state));
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
  const searchInitDateFrom = useSelector(state => state.targetReducers.searchInitDateFrom);
  const searchInitDateTo = useSelector(state => state.targetReducers.searchInitDateTo);

  const filters = useSelector(state => state.selectionReducers.filter);
  const filterClean = useSelector(state => state.targetReducers.filterClean);

  useEffect(() => {
    if (resetFilter === true) {
      setSearchString(' ');
    }
  }, [searchString, resetFilter]);

  return (
    <Grid container item className={classes.gridItemHeader}>
      {/* <Grid item container className={classes.centered} style={{ width: widthPrio }}>
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
      </Grid> */}
      <Grid item className={classes.centered} style={{ width: widthOrder }}>
        <Radio
          style={{ left: 2 }}
          checked={order === 1}
          onChange={event => onChange(property, 'order', parseInt(event.target.value))}
          value={1}
          name="radio-button-demo"
          id={'filter-sort-asc-' + property}
        />
        <Radio
          checked={order === -1}
          onChange={event => onChange(property, 'order', parseInt(event.target.value))}
          value={-1}
          name="radio-button-demo"
          id={'filter-sort-desc-' + property}
        />
        <Radio
          checked={order === 0}
          onChange={event => onChange(property, 'order', parseInt(event.target.value))}
          value={0}
          name="radio-button-demo"
          id={'filter-sort-none-' + property}
        />
      </Grid>
      <Grid item className={classNames(classes.property, classes.centered)} style={{ width: widthProperty }}>
        <Chip size="small" className={classes.propertyChip} label={filter[property].title} style={{ backgroundColor: color }} />
      </Grid>
      {resetFilter === false
        ? filter && (
          <>
            <Grid item className={classNames(classes.centered, classes.slider)} style={{ width: filterDataWidth }}>
              {dateFilter === true ? (
                <Grid item container className={classes.gridItemHeader}>
                  <Grid item style={{ width: gridDateFromWidth }} className={classNames(classes.dateFont)}>
                    from
                  </Grid>
                  <Grid item style={{ width: gridDateFromInputWidth }}>
                    <DatePicker
                      className={classes.dateInputWidth}
                      selected={startDate}
                      onChange={event => onChange(property, 'value', [moment(event).format('YYYY-MM-DD'), ''])}
                      placeholderText="YYYY-MM-DD"
                      value={filter[property].value[0]}
                      id={'date-picker-' + property + '-from'}
                    />
                  </Grid>

                  <Grid item style={{ width: gridDateFromWidth }} className={classNames(classes.dateFont)}>
                    to
                  </Grid>
                  <Grid item style={{ width: gridDateFromInputWidth }}>
                    <DatePicker
                      style={{ borderRadius: '10', fontSize: '10px' }}
                      className={classes.dateInputWidth}
                      selected={endDate}
                      onChange={event => onChange(property, 'value', ['', moment(event).format('YYYY-MM-DD')])}
                      placeholderText="YYYY-MM-DD"
                      value={filter[property].value[1]}
                      id={'date-picker-' + property + '-to'}
                    />
                  </Grid>
                </Grid>
              ) : (
                <TextField
                  id={'textFieldInput-' + property}
                  placeholder="Search"
                  onChange={event => onChange(property, 'value', event.target.value)}
                  key={property}
                  value={filter[property].value}
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
                    from
                  </Grid>
                  <Grid item style={{ width: gridDateFromInputWidth }}>
                    <DatePicker
                      className={classes.dateInputWidth}
                      selected={startDate}
                      onChange={event => onChange(property, 'value', [moment(event).format('YYYY-MM-DD'), ''])}
                      placeholderText="YYYY-MM-DD"
                      value={filter[property].value[0]}
                      id={'date-picker-' + property + '-from'}
                    />
                  </Grid>
                  <Grid item style={{ width: gridDateFromWidth }} className={classNames(classes.dateFont)}>
                    to
                  </Grid>
                  <Grid item style={{ width: gridDateFromInputWidth }}>
                    <DatePicker
                      style={{ borderRadius: '10', fontSize: '10px' }}
                      className={classes.dateInputWidth}
                      selected={endDate}
                      onChange={event => onChange(property, 'value', ['', moment(event).format('YYYY-MM-DD')])}
                      placeholderText="YYYY-MM-DD"
                      value={filter[property].value[1]}
                      id={'date-picker-' + property + '-to'}
                    />
                  </Grid>
                </Grid>
              ) : (
                <TextField
                  id={'textFieldInput-' + property}
                  placeholder="Search"
                  onChange={event => onChange(property, 'value', event.target.value)}
                  key={property}
                  value={filter[property].value}
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
  filter: PropTypes.object,
  dateFilter: PropTypes.bool
};

export default TargetListSortFilterItem;
