import React, { memo, useRef } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { Panel } from '../../common/Surfaces/Panel';
import { Button } from '../../common/Inputs/Button';
import TagCategory from './tagCategory';
import { useDispatch } from 'react-redux';
import { clearTagSelection } from './redux/dispatchActions';

export const heightOfBody = '164px';

const useStyles = makeStyles(theme => ({
  containerExpanded: {
    height: heightOfBody,
    display: 'flex',
    flexDirection: 'column'
    //overflow: 'auto'
  },
  containerCollapsed: {
    height: 0
  },
  nglViewItem: {
    paddingLeft: theme.spacing(1) / 2
  },
  selectorItem: {
    height: '100%'
  }
}));

const TagSelector = memo(({ handleHeightChange }) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const ref = useRef(null);

  const handleClearButton = () => {
    dispatch(clearTagSelection());
  };

  return (
    <Panel
      ref={ref}
      hasHeader
      hasExpansion
      defaultExpanded
      title="Hit cluster selector"
      headerActions={[
        <Button
          onClick={() => handleClearButton()}
          disabled={false}
          color="inherit"
          variant="text"
          size="small"
          startIcon={<Delete />}
          data-id="clearTagSelectionButton"
        >
          Clear selection
        </Button>
      ]}
      onExpandChange={expand => {
        if (ref.current && handleHeightChange instanceof Function) {
          handleHeightChange(ref.current.offsetHeight);
        }
      }}
    >
      <Grid className={classes.containerExpanded}>
        <TagCategory />
      </Grid>
    </Panel>
  );
});

export default TagSelector;
