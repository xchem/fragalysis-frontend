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

    const getDataValue = (activity, dataType) => {
        // we can't use {type}_value as they are not always present (at current state of backend)
        // also note that there is int_value and not integer_value
        let valueToReturn = activity['raw_value'];
        if (dataType === 'integer') {
            valueToReturn = valueToReturn !== null ? parseInt(valueToReturn, 10) : null;
        } else if (dataType === 'float') {
            valueToReturn = valueToReturn !== null ? parseFloat(valueToReturn).toFixed(2) : null;
        }
        return valueToReturn;
    };

    const activityDataSet = useMemo(() => {
        return data?.activityData?.filter(activity => activity.property_name === column.name).map(activity => getDataValue(activity, column.data_type)) || [];
    }, [column, data.activityData]);

    const activityCellData = useMemo(() => {
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