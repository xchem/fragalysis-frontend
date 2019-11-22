import React, { forwardRef, memo, useEffect, useState } from 'react';
import { Paper as MaterialPaper, makeStyles, Grid, IconButton, Typography } from '@material-ui/core';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper
  },
  body: {
    padding: theme.spacing(1)
  },
  header: {
    color: theme.palette.white,
    backgroundColor: theme.palette.primary.main,
    height: theme.spacing(5),
    borderTopLeftRadius: theme.spacing(1) / 2,
    borderTopRightRadius: theme.spacing(1) / 2
  },
  headerTitle: {
    paddingLeft: theme.spacing(1)
  },
  headerGrid: {
    height: 'inherit'
  },
  hidden: {
    height: 0,
    display: 'none'
  }
}));

export const Panel = memo(
  forwardRef(
    (
      { hasHeader, title, headerActions, hasExpansion, defaultExpanded = false, onExpandChange, children, ...rest },
      ref
    ) => {
      const classes = useStyles();
      const [expanded, setExpanded] = useState(defaultExpanded);

      const handleTitleButtonClick = () => {
        setExpanded(!expanded);
      };

      useEffect(() => {
        if (onExpandChange) {
          onExpandChange(expanded);
        }
      }, [expanded, onExpandChange]);

      return (
        <MaterialPaper className={classes.root} {...rest} ref={ref}>
          {hasHeader && (
            <div className={classes.header}>
              <Grid
                container
                justify="space-between"
                direction="row"
                alignItems="center"
                className={classes.headerGrid}
              >
                <Grid item xs={hasExpansion || headerActions ? 6 : 12} className={classes.headerTitle}>
                  <Typography variant="h6" color="inherit">
                    {title}
                  </Typography>
                </Grid>
                {(headerActions || hasExpansion) && (
                  <Grid item container justify="flex-end" xs={6}>
                    {headerActions &&
                      headerActions.map((action, index) => (
                        <Grid item key={index}>
                          {action}
                        </Grid>
                      ))}
                    {hasExpansion && (
                      <IconButton onClick={handleTitleButtonClick} color="inherit">
                        {expanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    )}
                  </Grid>
                )}
              </Grid>
            </div>
          )}
          {hasExpansion && <div className={expanded === true ? classes.body : classes.hidden}>{children}</div>}
          {!hasExpansion && <div className={classes.body}>{children}</div>}
        </MaterialPaper>
      );
    }
  )
);
