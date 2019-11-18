import React, { forwardRef, memo, useEffect, useState } from 'react';
import { Paper as MaterialPaper, makeStyles, Grid, IconButton } from '@material-ui/core';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.grey
  },
  body: {
    padding: theme.spacing(1)
  },
  header: {
    backgroundColor: '#f1f1f1',
    height: theme.spacing(5)
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
                <Grid item xs={5}>
                  <div className={classes.headerTitle}>{title}</div>
                </Grid>
                <Grid item container justify="flex-end" xs={7}>
                  {headerActions &&
                    headerActions.map((action, index) => (
                      <Grid item key={index}>
                        {action}
                      </Grid>
                    ))}
                  {hasExpansion && (
                    <IconButton onClick={handleTitleButtonClick}>
                      {expanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  )}
                </Grid>
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
