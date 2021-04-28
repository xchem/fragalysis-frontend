import React, { memo } from 'react';
import { Grid, makeStyles, Chip } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { addSelectedTag, removeSelectedTag } from './redux/dispatchActions';

const useStyles = makeStyles(theme => ({
  tagItem: {
    paddingBottom: 5
  }
}));

const TagView = memo(({ tag, selected }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const tagColor = selected ? 'primary' : 'default';

  const handleClick = () => {
    if (selected) {
      dispatch(removeSelectedTag(tag));
    } else {
      dispatch(addSelectedTag(tag));
    }
  };

  return (
    <Grid item className={classes.tagItem}>
      <Chip label={tag.text} clickable color={tagColor} onClick={handleClick} />
    </Grid>
  );
});

export default TagView;
