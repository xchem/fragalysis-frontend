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

export const NumericView = memo(({ column, data }) => {

    const classes = useStyles();

    const activityDataSet = useMemo(() => {
        return data?.activityData?.filter(activity => activity.property_name === column.name).map(activity => activity.raw_value) || [];
    }, [column, data.activityData]);

    const activityCellData = useMemo(() => {
        console.log('activityDataSet', activityDataSet);
        return activityDataSet.length > 0 ?
            activityDataSet.length > 1 ?
                `${(activityDataSet.reduce((acc, curr) => acc + curr, 0) / activityDataSet.length).toFixed(2)} (n=${activityDataSet.length})`
                : activityDataSet[0]
            : '';
    }, [activityDataSet]);

    const activityTitleData = useMemo(() => {
        return activityDataSet.length > 0 ?
            activityDataSet.length > 1 ?
                activityDataSet.join(', ')
                : activityDataSet[0]
            : '';
    }, [activityDataSet]);

    return <Grid container direction="row" justifyContent="center" alignItems="center" wrap="nowrap">
        <Tooltip title={activityTitleData} placement="top">
            <Grid item xs className={classes.dataCell}>
                {activityCellData}
            </Grid>
        </Tooltip>
    </Grid>;
});