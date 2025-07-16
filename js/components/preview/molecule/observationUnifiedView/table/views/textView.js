import { Grid, makeStyles, Tooltip } from "@material-ui/core";
import React, { memo, useMemo } from "react";

const useStyles = makeStyles(theme => ({
    dataCell: {
        textAlign: 'center',
        // overflow: 'hidden',
        // whiteSpace: 'nowrap',
        // textOverflow: 'ellipsis',
        padding: 3
    }
}));

export const TextView = memo(({ column, data }) => {

    const classes = useStyles();

    const activityData = useMemo(() => {
        return data?.activityData?.find(activity => activity.property_name === column.name);
    }, [column, data.activityData]);

    return <Grid container direction="row" justifyContent="center" alignItems="center" wrap="nowrap">
        <Tooltip title={activityData?.raw_value ?? ''} placement="top">
            <Grid item xs className={classes.dataCell}>
                {activityData?.raw_value}
            </Grid>
        </Tooltip>
    </Grid>;
});