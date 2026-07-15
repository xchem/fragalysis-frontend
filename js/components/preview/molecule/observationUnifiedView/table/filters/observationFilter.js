import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Checkbox, FormControl, FormControlLabel, GridLegacy as Grid, Radio, RadioGroup, TextField } from '@mui/material';
import { makeStyles } from '../../../../../../ui/styles';
import { FilterWrapper } from './filterWrapper';
import {
  setActiveCoordinateFilterSide,
  setCoordinateFilterResults,
  setCoordinateRadius,
  setIsCoordinateFilterApplied,
  setShowDisplayedMolecules,
  setSphereCoordinate,
  setUnifiedFilterItem
} from '../../../../../../reducers/selection/actions';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { ORDER } from '../constants';
import { handleObservationFilterChange } from '../../../redux/dispatchActions';

const useStyles = makeStyles(theme => ({
  row: {
    padding: 2
  },
  controlTopAligned: {
    alignItems: 'flex-start',
    minWidth: 0
  },
  wrapLabel: {
    display: 'block',
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
    lineHeight: 1.3
  }
}));

export const ObservationFilter = memo(({ onFilterChange, onSortingChange, viewConfig = {} }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const side = viewConfig.kind === 'rhs' ? 'rhs' : 'lhs';
  const filterKey = viewConfig.getObservationFilterKey?.() ?? 'detail';

  const showDisplayedMolecules = useSelector(state =>
    viewConfig.getShowDisplayedMolecules?.(state) ?? state.selectionReducers.showDisplayedMolecules
  );
  const filterDetail = useSelector(state => state.selectionReducers.unifiedFilter?.[filterKey], shallowEqual);

  const initFilterValue = useMemo(
    () => ({
      alwaysShowDisplayedHits: showDisplayedMolecules,
      observationCode: false,
      compoundCode: false,
      compoundAliases: false,
      value: '',
      exactMatch: false,
      coordinateSearch: false
    }),
    [showDisplayedMolecules]
  );

  const initSortingValue = useMemo(
    () => ({
      enabled: 0, // 0: None, 1: Observation / pose shortcode, 2: Compound aliases, 3: Compound ID
      // false for descending, true for ascending
      order: ORDER.DESC
    }),
    []
  );

  const [filterValue, setFilterValue] = useState(initFilterValue);
  const [sortingValue, setSortingValue] = useState(initSortingValue);

  const initializedFilterKeyRef = useRef(null);

  const handleFilterChangeHandler = handleObservationFilterChange(setFilterValue, onFilterChange, filterKey);

  const coordinateFilterApplied = useSelector(state =>
    viewConfig.getIsCoordinateFilterApplied?.(state) ?? state.selectionReducers.isCoordinateFilterApplied
  );

  useEffect(() => {
    const nextFilterValue = filterDetail || initFilterValue;
    // The reducer clones every filter entry, so mirror only actual value changes.
    setFilterValue(currentFilterValue =>
      shallowEqual(currentFilterValue, nextFilterValue) ? currentFilterValue : nextFilterValue
    );

    if (initializedFilterKeyRef.current !== filterKey) {
      initializedFilterKeyRef.current = filterKey;
      if (!filterDetail) {
        dispatch(setUnifiedFilterItem(filterKey, initFilterValue));
      }
    }
  }, [dispatch, filterDetail, filterKey, initFilterValue]);

  const handleSortingChange = (property, value) => {
    const newSortingValue = {
      ...sortingValue,
      [property]: value
    };
    setSortingValue(newSortingValue);
    onSortingChange(newSortingValue);
  };

  const isFilterActive = useCallback(() => {
    return (
      ((filterValue.observationCode || filterValue.compoundCode || filterValue.compoundAliases) &&
        filterValue.value !== '') ||
      sortingValue.enabled ||
      coordinateFilterApplied
    );
  }, [filterValue, sortingValue, coordinateFilterApplied]);

  return (
    <FilterWrapper
      title="Advanced Search"
      onOpen={() => {
        dispatch(setActiveCoordinateFilterSide(side));
      }}
      handleReset={() => {
        setFilterValue(initFilterValue);
        setSortingValue(initSortingValue);
        onFilterChange(initFilterValue);
        onSortingChange(initSortingValue);
        dispatch(setUnifiedFilterItem(filterKey, initFilterValue));
        dispatch(setShowDisplayedMolecules(true, side));
        dispatch(setCoordinateFilterResults([], side));
        dispatch(setIsCoordinateFilterApplied(false, side));
        dispatch(setSphereCoordinate(null, side));
        dispatch(setCoordinateRadius('', side));
      }}
      isActive={isFilterActive()}
    >
      {/** Options */}
      <Grid container direction="row">
        <Grid item xs>
          <FormControlLabel
            control={
              <Checkbox
                checked={filterValue.alwaysShowDisplayedHits}
                onChange={e => {
                  dispatch(setShowDisplayedMolecules(e.target.checked, side));
                  dispatch(handleFilterChangeHandler(filterValue, 'alwaysShowDisplayedHits', e.target.checked));
                }}
              />
            }
            label="Always show displayed hits"
          />
        </Grid>
      </Grid>
      <Grid container direction="row">
        <Grid item xs>
          <FormControlLabel
            classes={{ root: classes.controlTopAligned }}
            control={
              <Checkbox
                checked={filterValue.coordinateSearch}
                onChange={e => {
                  dispatch(setActiveCoordinateFilterSide(side));
                  dispatch(setCoordinateFilterResults([], side));
                  dispatch(setIsCoordinateFilterApplied(false, side));
                  dispatch(setSphereCoordinate(null, side));
                  dispatch(setCoordinateRadius('', side));
                  dispatch(handleFilterChangeHandler(filterValue, 'coordinateSearch', e.target.checked));
                }}
              />
            }
            label={
              <>
                <span className={classes.wrapLabel}>Coordinate search </span>
                <span className={classes.wrapLabel}>(click on structure in 3D viewer and press</span>
                <span className={classes.wrapLabel}>Apply in radius dialog to search)</span>{' '}
              </>
            }
          />
        </Grid>
      </Grid>
      <Grid container direction="row">
        <Grid item xs className="filter-header">
          Keyword Search
        </Grid>
      </Grid>
      <Grid container direction="row">
        <Grid item xs>
          <FormControlLabel
            control={
              <Checkbox
                checked={filterValue.observationCode}
                onChange={e => dispatch(handleFilterChangeHandler(filterValue, 'observationCode', e.target.checked))}
              />
            }
            label="Observation code"
          />
        </Grid>
      </Grid>
      <Grid container direction="row">
        <Grid item xs>
          <FormControlLabel
            control={
              <Checkbox
                checked={filterValue.compoundCode}
                onChange={e => dispatch(handleFilterChangeHandler(filterValue, 'compoundCode', e.target.checked))}
              />
            }
            label="Compound code"
          />
        </Grid>
      </Grid>
      <Grid container direction="row">
        <Grid item xs>
          <FormControlLabel
            control={
              <Checkbox
                checked={filterValue.compoundAliases}
                onChange={e => dispatch(handleFilterChangeHandler(filterValue, 'compoundAliases', e.target.checked))}
              />
            }
            label="Compound aliases"
          />
        </Grid>
      </Grid>

      <Grid container direction="row">
        <Grid item xs>
          <TextField
            multiline
            minRows={3}
            value={filterValue.value}
            onChange={e => dispatch(handleFilterChangeHandler(filterValue, 'value', e.target.value))}
          />
        </Grid>
      </Grid>

      <Grid container direction="row">
        <Grid item xs>
          <FormControlLabel
            control={
              <Checkbox
                checked={filterValue.exactMatch}
                onChange={e => dispatch(handleFilterChangeHandler(filterValue, 'exactMatch', e.target.checked))}
              />
            }
            label="Exact matches only"
          />
        </Grid>
      </Grid>
      {/** Sort */}
      <Grid container direction="row">
        <Grid item xs className="filter-header">
          Sort
        </Grid>
      </Grid>
      <Grid container direction="row">
        {/** First column */}
        <Grid container item xs={6} direction="column">
          <Grid item xs>
            <FormControl>
              <RadioGroup
                value={sortingValue.enabled}
                onChange={e => handleSortingChange('enabled', Number(e.target.value))}
              >
                <FormControlLabel value={0} control={<Radio />} label="None" />
                <FormControlLabel value={1} control={<Radio />} label="Observation code" />
                <FormControlLabel value={2} control={<Radio />} label="Compound code" />
                {/* <FormControlLabel value={3} control={<Radio />} label="All compound aliases" /> */}
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
        {/** Second column */}
        <Grid container item xs={6} direction="column">
          <Grid item xs>
            <FormControlLabel
              control={
                <Checkbox checked={sortingValue.order} onChange={e => handleSortingChange('order', e.target.checked)} />
              }
              label="Ascending"
            />
          </Grid>
        </Grid>
      </Grid>
    </FilterWrapper>
  );
});
