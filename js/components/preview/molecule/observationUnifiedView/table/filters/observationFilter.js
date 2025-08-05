import React, { memo, useCallback, useState } from "react";
import { Checkbox, FormControl, FormControlLabel, Grid, makeStyles, Radio, RadioGroup, TextField } from "@material-ui/core"
import { FilterWrapper } from "./filterWrapper";
import { setShowDisplayedMolecules } from "../../../../../../reducers/selection/actions";
import { useDispatch, useSelector } from "react-redux";
import { ORDER } from "../constants";

const useStyles = makeStyles(theme => ({
    row: {
        padding: 2
    }
}));

export const ObservationFilter = memo(({ onFilterChange, onSortingChange }) => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const showDisplayedMolecules = useSelector(state => state.selectionReducers.showDisplayedMolecules);

    const initFilterValue = {
        alwaysShowDisplayedHits: showDisplayedMolecules,
        observationCode: false,
        compoundCode: false,
        compoundAliases: false,
        value: '',
        exactMatch: false
    };

    const initSortingValue = {
        enabled: 0, // 0: None, 1: Observation / pose shortcode, 2: Compound aliases, 3: Compound ID
        // false for descending, true for ascending
        order: ORDER.DESC
    };

    const [filterValue, setFilterValue] = useState(initFilterValue);
    const [sortingValue, setSortingValue] = useState(initSortingValue);

    const handleFilterChange = (property, value) => {
        const newFilterValue = {
            ...filterValue,
            [property]: value
        };
        setFilterValue(newFilterValue);
        onFilterChange(newFilterValue);
    };

    const handleSortingChange = (property, value) => {
        const newSortingValue = {
            ...sortingValue,
            [property]: value
        };
        setSortingValue(newSortingValue);
        onSortingChange(newSortingValue);
    };

    const isFilterActive = useCallback(() => {
        return ((filterValue.observationCode || filterValue.compoundCode || filterValue.compoundAliases)
            && filterValue.value !== '')
            || sortingValue.enabled;
    }, [filterValue, sortingValue]);

    return <FilterWrapper
        title="Advanced Search"
        handleReset={() => {
            setFilterValue(initFilterValue);
            setSortingValue(initSortingValue);
            onFilterChange(initFilterValue);
            onSortingChange(initSortingValue);
        }}
        isActive={isFilterActive()}
    >
        {/** Options */}
        <Grid container direction="row">
            <Grid item xs><FormControlLabel control={<Checkbox checked={filterValue.alwaysShowDisplayedHits} onChange={e => { dispatch(setShowDisplayedMolecules(e.target.checked)); handleFilterChange('alwaysShowDisplayedHits', e.target.checked) }} />} label="Always show displayed hits" /></Grid>
        </Grid>
        <Grid container direction="row">
            <Grid item xs className="filter-header">Keyword Search</Grid>
        </Grid>
        <Grid container direction="row">
            <Grid item xs><FormControlLabel control={<Checkbox checked={filterValue.observationCode} onChange={e => handleFilterChange('observationCode', e.target.checked)} />} label="Observation code" /></Grid>
        </Grid>
        <Grid container direction="row">
            <Grid item xs><FormControlLabel control={<Checkbox checked={filterValue.compoundCode} onChange={e => handleFilterChange('compoundCode', e.target.checked)} />} label="Compound code" /></Grid>
        </Grid>
        <Grid container direction="row">
            <Grid item xs><FormControlLabel control={<Checkbox checked={filterValue.compoundAliases} onChange={e => handleFilterChange('compoundAliases', e.target.checked)} />} label="Compound aliases" /></Grid>
        </Grid>

        <Grid container direction="row">
            <Grid item xs><TextField multiline minRows={3} value={filterValue.value} onChange={e => handleFilterChange('value', e.target.value)} /></Grid>
        </Grid>

        <Grid container direction="row">
            <Grid item xs><FormControlLabel control={<Checkbox checked={filterValue.exactMatch} onChange={e => handleFilterChange('exactMatch', e.target.checked)} />} label="Exact matches only" /></Grid>
        </Grid>
        {/** Sort */}
        <Grid container direction="row">
            <Grid item xs className="filter-header">Sort</Grid>
        </Grid>
        <Grid container direction="row">
            {/** First column */}
            <Grid container item xs={6} direction="column">
                <Grid item xs>
                    <FormControl>
                        <RadioGroup value={sortingValue.enabled} onChange={e => handleSortingChange('enabled', Number(e.target.value))}>
                            <FormControlLabel value={0} control={<Radio />} label="None" />
                            <FormControlLabel value={1} control={<Radio />} label="Observation code" />
                            <FormControlLabel value={2} control={<Radio />} label="Compound code" />
                            <FormControlLabel value={3} control={<Radio />} label="All compound aliases" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>
            {/** Second column */}
            <Grid container item xs={6} direction="column">
                <Grid item xs><FormControlLabel control={<Checkbox checked={sortingValue.order} onChange={e => handleSortingChange('order', e.target.checked)} />} label="Ascending" /></Grid>
            </Grid>
        </Grid>
    </FilterWrapper>;
});
