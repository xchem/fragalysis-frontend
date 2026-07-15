import React, { memo, useCallback, useState } from "react";
import { Checkbox, FormControl, FormControlLabel, GridLegacy as Grid, MenuItem, Radio, RadioGroup, Select, TextField } from '@mui/material';
import { makeStyles } from '../../../../../../ui/styles';
import { FilterWrapper } from "./filterWrapper";
import { ORDER } from "../constants";
import { useDispatch, useSelector } from "react-redux";
import { setUnifiedFilterItem } from "../../../../../../reducers/selection/actions";

const useStyles = makeStyles(theme => ({
    row: {
        padding: 2
    }
}));

const INITIAL_FILTER_VALUE = {
    mainStatus: { good: false, mediocre: false, bad: false, none: false },
    peerReview: {
        good: { checked: false, option: 0, value: '' },
        mediocre: { checked: false, option: 0, value: '' },
        bad: { checked: false, option: 0, value: '' },
        none: { checked: false, option: 0, value: '' },
        onlyMyReviews: { checked: false }
    }
};

const INITIAL_SORTING_VALUE = {
    enabled: false,
    order: ORDER.DESC
};

export const PeerReviewFilter = memo(({ onFilterChange, onSortingChange }) => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const savedFilter = useSelector(state => state.selectionReducers.unifiedFilter?.peerReview);

    const [filterValue, setFilterValue] = useState(() => savedFilter || INITIAL_FILTER_VALUE);
    const [sortingValue, setSortingValue] = useState(INITIAL_SORTING_VALUE);

    const setValueForMainStatus = (property, value) => {
        return {
            ...filterValue.mainStatus,
            [property]: value
        };
    };

    const setValueForPeerReview = (property, type, value) => {
        return {
            ...filterValue.peerReview,
            [property]: {
                ...filterValue.peerReview[property],
                [type]: value
            }
        };
    };

    const handleFilterChange = (property, value) => {
        const newFilterValue = {
            ...filterValue,
            [property]: value
        };
        setFilterValue(newFilterValue);
        onFilterChange(newFilterValue);
        dispatch(setUnifiedFilterItem('peerReview', newFilterValue));
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
        return Object.values(filterValue.mainStatus).some(status => status)
            || Object.values(filterValue.peerReview).some(pr => pr.checked && pr.value !== '')
            || sortingValue.enabled;
    }, [filterValue, sortingValue]);

    return <FilterWrapper
        title="Sort / Filter (Peer Review)"
        handleReset={() => {
            setFilterValue(INITIAL_FILTER_VALUE);
            setSortingValue(INITIAL_SORTING_VALUE);
            onFilterChange(INITIAL_FILTER_VALUE);
            onSortingChange(INITIAL_SORTING_VALUE);
            dispatch(setUnifiedFilterItem('peerReview', INITIAL_FILTER_VALUE));
        }}
        isActive={isFilterActive()}
    >
        {/** Statuses */}
        <Grid container direction="row">
            {/** First column with main statuses */}
            <Grid container item xs={4} direction="column">
                <Grid item xs className="filter-header">Main status</Grid>
                <Grid item xs><FormControlLabel control={<Checkbox checked={filterValue.mainStatus.good} onChange={e => handleFilterChange('mainStatus', setValueForMainStatus('good', e.target.checked))} />} label="Good" /></Grid>
                <Grid item xs><FormControlLabel control={<Checkbox checked={filterValue.mainStatus.mediocre} onChange={e => handleFilterChange('mainStatus', setValueForMainStatus('mediocre', e.target.checked))} />} label="Mediocre" /></Grid>
                <Grid item xs><FormControlLabel control={<Checkbox checked={filterValue.mainStatus.bad} onChange={e => handleFilterChange('mainStatus', setValueForMainStatus('bad', e.target.checked))} />} label="Bad" /></Grid>
                <Grid item xs><FormControlLabel control={<Checkbox checked={filterValue.mainStatus.none} onChange={e => handleFilterChange('mainStatus', setValueForMainStatus('none', e.target.checked))} />} label="None" /></Grid>
                <Grid item xs></Grid>
            </Grid>
            {/** Second column with peer reviews */}
            <Grid container item xs={4} direction="column">
                <Grid item xs className="filter-header">Peer review</Grid>
                <Grid item xs><FormControlLabel control={<Checkbox checked={filterValue.peerReview.good.checked} onChange={e => handleFilterChange('peerReview', setValueForPeerReview('good', 'checked', e.target.checked))} />} label="Good" /></Grid>
                <Grid item xs><FormControlLabel control={<Checkbox checked={filterValue.peerReview.mediocre.checked} onChange={e => handleFilterChange('peerReview', setValueForPeerReview('mediocre', 'checked', e.target.checked))} />} label="Mediocre" /></Grid>
                <Grid item xs><FormControlLabel control={<Checkbox checked={filterValue.peerReview.bad.checked} onChange={e => handleFilterChange('peerReview', setValueForPeerReview('bad', 'checked', e.target.checked))} />} label="Bad" /></Grid>
                <Grid item xs><FormControlLabel control={<Checkbox checked={filterValue.peerReview.none.checked} onChange={e => handleFilterChange('peerReview', setValueForPeerReview('none', 'checked', e.target.checked))} />} label="None" /></Grid>
                <Grid item xs><FormControlLabel control={<Checkbox checked={filterValue.peerReview.onlyMyReviews.checked} onChange={e => handleFilterChange('peerReview', setValueForPeerReview('onlyMyReviews', 'checked', e.target.checked))} />} label="Only my reviews" /></Grid>
            </Grid>
            {/** Third column with options */}
            <Grid container item xs={2} direction="column">
                <Grid item xs></Grid>
                <Grid item xs>
                    <FormControl>
                        <Select value={filterValue.peerReview.good.option} onChange={e => handleFilterChange('peerReview', setValueForPeerReview('good', 'option', e.target.value))}>
                            <MenuItem value={0}>{"=="}</MenuItem>
                            <MenuItem value={1}>{"<="}</MenuItem>
                            <MenuItem value={2}>{">="}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs>
                    <FormControl>
                        <Select value={filterValue.peerReview.mediocre.option} onChange={e => handleFilterChange('peerReview', setValueForPeerReview('mediocre', 'option', e.target.value))}>
                            <MenuItem value={0}>{"=="}</MenuItem>
                            <MenuItem value={1}>{"<="}</MenuItem>
                            <MenuItem value={2}>{">="}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs>
                    <FormControl>
                        <Select value={filterValue.peerReview.bad.option} onChange={e => handleFilterChange('peerReview', setValueForPeerReview('bad', 'option', e.target.value))}>
                            <MenuItem value={0}>{"=="}</MenuItem>
                            <MenuItem value={1}>{"<="}</MenuItem>
                            <MenuItem value={2}>{">="}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs>
                    <FormControl>
                        <Select value={filterValue.peerReview.none.option} onChange={e => handleFilterChange('peerReview', setValueForPeerReview('none', 'option', e.target.value))}>
                            <MenuItem value={0}>{"=="}</MenuItem>
                            <MenuItem value={1}>{"<="}</MenuItem>
                            <MenuItem value={2}>{">="}</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs></Grid>
            </Grid>
            {/** Fourth column with values */}
            <Grid container item xs={2} direction="column">
                <Grid item xs></Grid>
                <Grid item xs>
                    <FormControl><TextField value={filterValue.peerReview.good.value} onChange={e => handleFilterChange('peerReview', setValueForPeerReview('good', 'value', e.target.value))} /></FormControl>
                </Grid>
                <Grid item xs>
                    <FormControl><TextField value={filterValue.peerReview.mediocre.value} onChange={e => handleFilterChange('peerReview', setValueForPeerReview('mediocre', 'value', e.target.value))} /></FormControl>
                </Grid>
                <Grid item xs>
                    <FormControl><TextField value={filterValue.peerReview.bad.value} onChange={e => handleFilterChange('peerReview', setValueForPeerReview('bad', 'value', e.target.value))} /></FormControl>
                </Grid>
                <Grid item xs>
                    <FormControl><TextField value={filterValue.peerReview.none.value} onChange={e => handleFilterChange('peerReview', setValueForPeerReview('none', 'value', e.target.value))} /></FormControl>
                </Grid>
                <Grid item xs></Grid>
            </Grid>
        </Grid>
        {/** Sort */}
        <Grid container direction="row">
            <Grid item xs className="filter-header">Sort</Grid>
        </Grid>
        <Grid container direction="row">
            {/** First column */}
            <Grid container item xs={4} direction="column">
                <Grid item xs>
                    <FormControl>
                        <RadioGroup value={sortingValue.enabled} onChange={e => handleSortingChange('enabled', e.target.value)}>
                            <FormControlLabel value={false} control={<Radio />} label="None" />
                            <FormControlLabel value="mainStatus" control={<Radio />} label="Main status" />
                            <FormControlLabel value="peerReview" control={<Radio />} label="Peer review" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>
            {/** Second column */}
            <Grid container item xs={4} direction="column">
                <Grid item xs><FormControlLabel control={<Checkbox checked={sortingValue.order} onChange={e => handleSortingChange('order', e.target.checked)} />} label="Ascending" /></Grid>
            </Grid>
        </Grid>
    </FilterWrapper>;
});
