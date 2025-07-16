import React, { memo } from "react";
import { Checkbox, FormControl, FormControlLabel, Grid, makeStyles, Radio, RadioGroup, TextField } from "@material-ui/core"
import { FilterWrapper } from "./filterWrapper";
// import { Editor } from "ketcher-react";

const useStyles = makeStyles(theme => ({
    row: {
        padding: 2
    }
}));

export const MoleculeFilter = memo(({ onFilterChange, onSortingChange }) => {
    const classes = useStyles();

    return <FilterWrapper title="Sort / Filter (Molecule)">
        {/** Options */}
        <Grid container direction="row">
            {/** First column */}
            <Grid container item xs={6} direction="column">
                <Grid item xs>
                    <FormControl>
                        <RadioGroup value="similarity">
                            <FormControlLabel value="substructure" control={<Radio />} label="Substructure match" />
                            <FormControlLabel value="exact" control={<Radio />} label="Exact match" />
                            <FormControlLabel value="similarity" control={<Radio />} label="Similarity >=" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>
            {/** Second column */}
            <Grid container item xs={6} direction="column">
                <Grid item xs></Grid>
                <Grid item xs></Grid>
                <Grid item xs><TextField /></Grid>
            </Grid>
        </Grid>

        <Grid container direction="row">
            {/* <Grid item xs><Editor
                // ...rest of the properties
                disableMacromoleculesEditor
            /></Grid> */}
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
                        <RadioGroup value="none">
                            <FormControlLabel value="none" control={<Radio />} label="None" />
                            <FormControlLabel value="similarity" control={<Radio />} label="Similarity" />
                            <FormControlLabel value="atoms" control={<Radio />} label="Heavy atoms" />
                        </RadioGroup>
                    </FormControl>
                </Grid>
            </Grid>
            {/** Second column */}
            <Grid container item xs={6} direction="column">
                <Grid item xs><FormControlLabel control={<Checkbox />} label="Ascending" /></Grid>
            </Grid>
        </Grid>
    </FilterWrapper>;
});
