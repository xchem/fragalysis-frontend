import React, { memo, useEffect, useState } from "react";
import { Checkbox, FormControl, FormControlLabel, Grid, makeStyles, MenuItem, Radio, RadioGroup, Select, TextField } from "@material-ui/core"
import { FilterWrapper } from "./filterWrapper";
import { ORDER } from "../constants";
import { useDispatch, useSelector } from "react-redux";
import { setUnifiedFilterItem } from "../../../../../../reducers/selection/actions";

const useStyles = makeStyles(theme => ({
    row: {
        padding: 2
    }
}));

export const NumericFilter = memo(({ name, onFilterChange, onSortingChange }) => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const unifiedFilter = useSelector(state => state.selectionReducers.unifiedFilter);

    const initFilterValue = {
        type: 'value',
        condition: 0,
        value: ''
    };

    const initSortingValue = {
        enabled: false,
        // false for descending, true for ascending
        order: ORDER.DESC
    };

    const [filterValue, setFilterValue] = useState(initFilterValue);
    const [sortingValue, setSortingValue] = useState(initSortingValue);

    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized) {
            if (unifiedFilter?.[name]) {
                setFilterValue(unifiedFilter[name]);
            } else {
                setFilterValue(initFilterValue);
            }
            setInitialized(true);
        }
    }, [unifiedFilter, name, initFilterValue, initialized]);
    // }, [unifiedFilter[name], initFilterValue, initialized]);

    const handleFilterChange = (property, value) => {
        const newFilterValue = {
            ...filterValue,
            [property]: value
        };
        setFilterValue(newFilterValue);
        onFilterChange(newFilterValue);
        dispatch(setUnifiedFilterItem(name, newFilterValue));
    };

    const handleSortingChange = (property, value) => {
        const newSortingValue = {
            ...sortingValue,
            [property]: value
        };
        setSortingValue(newSortingValue);
        onSortingChange(newSortingValue);
    };

    return <FilterWrapper
        title={`Sort / Filter (${name})`}
        handleReset={() => {
            setFilterValue(initFilterValue);
            setSortingValue(initSortingValue);
            onFilterChange(initFilterValue);
            onSortingChange(initSortingValue);
            dispatch(setUnifiedFilterItem(name, initFilterValue));
        }}
        isActive={filterValue.value !== '' || sortingValue.enabled}
    >
        {/** Options */}
        <Grid container direction="row">
            {/** First column */}
            <Grid container item xs={4} direction="column">
                <Grid item xs>
                    <FormControl>
                        <RadioGroup value={filterValue.type} onChange={e => handleFilterChange('type', e.target.value)}>
                            <FormControlLabel value="value" control={<Radio />} label="Value" />
                            <FormControlLabel value="null" control={<Radio />} label="Null" />
                            <FormControlLabel value="not_null" control={<Radio />} label="Not null" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>
            {/** Second column */}
            <Grid container item xs={4} direction="column">
                <Grid item xs>
                    <FormControl>
                        <Select value={filterValue.condition} onChange={e => handleFilterChange('condition', e.target.value)}>
                            <MenuItem value={0}>{"=="}</MenuItem>
                            <MenuItem value={1}>{"<="}</MenuItem>
                            <MenuItem value={2}>{">="}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            {/** Third column */}
            <Grid container item xs={4} direction="column">
                <Grid item xs><TextField value={filterValue.value} onChange={e => handleFilterChange('value', e.target.value)} /></Grid>
            </Grid>
        </Grid>
        {/** Sort */}
        <Grid container direction="row">
            <Grid item xs className="filter-header">Sort</Grid>
        </Grid>
        <Grid container direction="row">
            <Grid item xs><FormControlLabel control={<Checkbox checked={sortingValue.enabled} onChange={e => handleSortingChange('enabled', e.target.checked)} />} label="Enabled" /></Grid>
            <Grid item xs><FormControlLabel control={<Checkbox checked={sortingValue.order} onChange={e => handleSortingChange('order', e.target.checked)} />} label="Ascending" /></Grid>
        </Grid>
        {/** Color */}
        {/* <Grid container direction="row">
            <Grid item xs className="filter-header">Color</Grid>
        </Grid>
        <Grid container direction="row">
            <Grid item xs><FormControlLabel control={<Checkbox />} label="Enabled" /></Grid>
            <Grid item xs><FormControlLabel control={<Checkbox />} label="Min" /></Grid>
            <Grid item xs><FormControlLabel control={<Checkbox />} label="Mean" /></Grid>
            <Grid item xs><FormControlLabel control={<Checkbox />} label="Max" /></Grid>
        </Grid> */}
    </FilterWrapper>;
});
