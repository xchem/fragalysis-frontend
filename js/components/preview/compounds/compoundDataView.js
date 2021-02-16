/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo } from 'react';
import { Grid, Tooltip, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  container: {
    height: '100%',
    width: 'inherit',
    color: theme.palette.black
  },
  containerTooltip: {
    height: '100%',
    width: 'inherit',
    color: theme.palette.white
  },

  moleculeTitleLabel: {
    ...theme.typography.button,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
}));

export const CompoundDataView = memo(({ currentCompoundIds, isTooltip, index }) => {
  const classes = useStyles();

  return (
    currentCompoundIds &&
    currentCompoundIds.length > 0 && (
      <Grid item className={''}>
        {currentCompoundIds.map((data, i, array) => {
          return (
            <Grid
              key={i}
              container
              justify="flex-start"
              direction="row"
              className={isTooltip === true ? classes.containerTooltip : classes.container}
              wrap="nowrap"
            >
              <Grid item container className={''} justify="flex-start" direction="row">
                <Grid item xs={12}>
                  {isTooltip === true ? (
                    <div>{data}</div>
                  ) : (
                    <Tooltip title={data} placement="bottom-start">
                      <div className={classes.moleculeTitleLabel}>{data}</div>
                    </Tooltip>
                  )}
                </Grid>
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    )
  );
});
