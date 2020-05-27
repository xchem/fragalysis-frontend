import React, { forwardRef, memo, useEffect, useState } from 'react';
import {
  Paper as MaterialPaper,
  makeStyles,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
  Tooltip
} from '@material-ui/core';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ExpandLess from '@material-ui/icons/ExpandLess';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper
  },
  body: {
    padding: theme.spacing(1)
  },
  bodyOverflowHeader: {
    padding: theme.spacing(1),
    // 100% - header
    height: `calc( 100% - ${theme.spacing(5)}px )`,
    overflowY: 'auto'
  },
  bodyOverflow: {
    padding: theme.spacing(1),
    height: `100%`,
    overflowY: 'auto'
  },
  header: {
    color: theme.palette.white,
    backgroundColor: theme.palette.primary.main,
    height: theme.spacing(5),
    borderTopLeftRadius: theme.spacing(1) / 2,
    borderTopRightRadius: theme.spacing(1) / 2
  },
  headerSecondary: {
    color: theme.palette.white,
    backgroundColor: theme.palette.secondary.main,
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
  },
  loading: {
    paddingTop: theme.spacing(2)
  }
}));

export const Panel = memo(
  forwardRef(
    (
      {
        hasHeader,
        secondaryBackground,
        title,
        withTooltip,
        headerActions,
        hasExpansion,
        defaultExpanded = false,
        onExpandChange,
        children,
        bodyOverflow,
        isLoading,
        ...rest
      },
      ref
    ) => {
      const classes = useStyles();
      const [expanded, setExpanded] = useState(defaultExpanded);

      let bodyClass = classes.body;
      if (bodyOverflow) {
        if (hasHeader) {
          bodyClass = classes.bodyOverflowHeader;
        } else {
          bodyClass = classes.bodyOverflow;
        }
      }

      const handleTitleButtonClick = () => {
        setExpanded(!expanded);
      };

      useEffect(() => {
        if (onExpandChange) {
          onExpandChange(expanded);
        }
      }, [expanded, onExpandChange]);

      return (
        <MaterialPaper className={classes.root} ref={ref} {...rest}>
          {hasHeader && (
            <div className={secondaryBackground ? classes.headerSecondary : classes.header}>
              <Grid
                container
                justify="space-between"
                direction="row"
                alignItems="center"
                className={classes.headerGrid}
              >
                {title && (
                  <Grid
                    item
                    xs={hasExpansion || headerActions ? (headerActions && headerActions.length > 2 ? 4 : 6) : 12}
                    className={classes.headerTitle}
                  >
                    {withTooltip ? (
                      <Tooltip title={title}>
                        <Typography variant="h6" color="inherit" noWrap>
                          {title}
                        </Typography>
                      </Tooltip>
                    ) : (
                      <Typography variant="h6" color="inherit" noWrap>
                        {title}
                      </Typography>
                    )}
                  </Grid>
                )}
                {(headerActions || hasExpansion) && (
                  <Grid
                    item
                    container
                    direction="row"
                    justify="flex-end"
                    xs={title ? (headerActions && headerActions.length > 2 ? 8 : 6) : 12}
                  >
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
          {isLoading && (
            <Grid container alignItems="center" justify="center" className={classes.loading}>
              <Grid item>
                <CircularProgress />
              </Grid>
            </Grid>
          )}
          {hasExpansion && <div className={expanded === true ? bodyClass : classes.hidden}>{children}</div>}
          {!hasExpansion && <div className={bodyClass}>{children}</div>}
        </MaterialPaper>
      );
    }
  )
);
