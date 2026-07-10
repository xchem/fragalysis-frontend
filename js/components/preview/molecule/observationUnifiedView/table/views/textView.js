import { GridLegacy as Grid } from '@mui/material';
import { makeStyles } from '../../../../../../ui/styles';
import React, { memo, useMemo } from 'react';
import RichTooltip from '../../../../../tooltip/RichTooltip';

const useStyles = makeStyles(theme => ({
  dataCell: {
    textAlign: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    padding: 3
  }
}));

export const TextView = memo(({ column, data }) => {
  const classes = useStyles();

  const activityData = useMemo(() => {
    return data?.activityData?.find(activity => activity.property_name === column.name);
  }, [column, data.activityData]);

  return (
    <Grid container direction="row" justifyContent="center" alignItems="center" wrap="nowrap">
      <RichTooltip path="textValue" values={{ value: activityData?.raw_value ?? '' }}>
        <Grid item xs className={classes.dataCell}>
          {activityData?.raw_value}
        </Grid>
      </RichTooltip>
    </Grid>
  );
});
