import React, { memo } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { Tabs, Tab as TabMUI, makeStyles } from '@material-ui/core';

/**
 * Header with tabs -their container
 */
export const TabsHeader = withStyles(theme => ({
  root: {},
  indicator: {
    backgroundColor: theme.palette.primary.contrastText
  },
  scrollButtons: {
    width: 27,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  }
}))(props => <Tabs {...props} />);

/**
 * Tab button inside header container
 */
export const Tab = withStyles(theme => ({
  root: {
    minWidth: 86,
    //   maxWidth: 86,
    maxHeight: 40,
    textTransform: 'none',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      opacity: 1,
      backgroundColor: theme.palette.primary.main
    },
    '&$selected': {
      color: theme.palette.primary.contrastText
    },
    '&:focus': {
      color: theme.palette.primary.contrastText
    },
    '&:first-of-type': {
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4
    },
    '&:last-of-type': {
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4
    }
  },
  selected: {}
}))(props => <TabMUI {...props} width={86} />);

/**
 * Get props for Tab of given index
 */
export const a11yTabProps = index => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`
  };
};

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%'
  }
}));

/**
 * Tab panel - body of tab
 */
export const TabPanel = memo(props => {
  const classes = useStyles();

  const { children, value, index, ...other } = props;

  return (
    <Typography
      className={classes.root}
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Typography>
  );
});

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};
