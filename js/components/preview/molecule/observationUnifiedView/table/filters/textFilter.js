import React, { memo, useState } from "react";
import { Checkbox, FormControl, FormControlLabel, Grid, makeStyles, Radio, RadioGroup, TextField } from "@material-ui/core"
import { FilterWrapper } from "./filterWrapper";
import { ORDER } from "../constants";

const useStyles = makeStyles(theme => ({
    row: {
        padding: 2
    }
}));

export const TextFilter = memo(({ name, onFilterChange, onSortingChange }) => {
    const classes = useStyles();

    const initFilterValue = {
        type: 'contains',
        condition: 'any',
        value: ''
    };

    const initSortingValue = {
        enabled: false,
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

    return <FilterWrapper
        title={`Sort / Filter (${name})`}
        handleReset={() => {
            setFilterValue(initFilterValue);
            setSortingValue(initSortingValue);
            onFilterChange(initFilterValue);
            onSortingChange(initSortingValue);
        }}
        isActive={filterValue.value !== '' || sortingValue.enabled}
    >
        {/** Options */}
        <Grid container direction="row">
            {/** First column */}
            <Grid container item xs={6} direction="column">
                <Grid item xs>
                    <FormControl>
                        <RadioGroup value={filterValue.type} onChange={e => handleFilterChange('type', e.target.value)}>
                            <FormControlLabel value="exact" control={<Radio />} label="Exact match" />
                            <FormControlLabel value="contains" control={<Radio />} label="Contains" />
                            <FormControlLabel value="starts" control={<Radio />} label="Starts with" />
                            <FormControlLabel value="ends" control={<Radio />} label="Ends with" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>
            {/** Second column */}
            <Grid container item xs={6} direction="column">
                <Grid item xs>
                    <FormControl>
                        <RadioGroup value={filterValue.condition} onChange={e => handleFilterChange('condition', e.target.value)}>
                            <FormControlLabel value="all" control={<Radio />} label="All" />
                            <FormControlLabel value="any" control={<Radio />} label="Any" />
                            <FormControlLabel value="none" control={<Radio />} label="None" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>
        </Grid>

        <Grid container direction="row">
            <Grid item xs><TextField multiline minRows={3} value={filterValue.value} onChange={e => handleFilterChange('value', e.target.value)} /></Grid>
        </Grid>

        {/** Sort */}
        <Grid container direction="row">
            <Grid item xs className="filter-header">Sort</Grid>
        </Grid>
        <Grid container direction="row">
            <Grid item xs><FormControlLabel control={<Checkbox checked={sortingValue.enabled} onChange={e => handleSortingChange('enabled', e.target.checked)} />} label="Enabled" /></Grid>
            <Grid item xs><FormControlLabel control={<Checkbox checked={sortingValue.order} onChange={e => handleSortingChange('order', e.target.checked)} />} label="Ascending" /></Grid>
        </Grid>
    </FilterWrapper>;
});
