import React, { memo } from 'react';
import { Grid, makeStyles, Chip, Tooltip } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { addSelectedTag, removeSelectedTag } from './redux/dispatchActions';

const useStyles = makeStyles(theme => ({
  tagItem: {
    paddingBottom: 6
  },
  chip: {
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  }
}));

const TagView = memo(({ tag, selected, allTags }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const tagColor = selected ? 'primary' : 'default';
  const color = selected ? tagColor : (tag.color && tag.color) || tagColor;
  const style = selected ? {} : { backgroundColor: color };

  const handleClick = () => {
    if (selected) {
      dispatch(removeSelectedTag(tag, allTags));
    } else {
      dispatch(addSelectedTag(tag, allTags));
    }
  };

  return (
    <Grid className={classes.tagItem}>
      <Tooltip title={tag.text}>
        <Chip
          size="small"
          className={classes.chip}
          label={tag.text}
          clickable
          color={tagColor}
          style={style}
          onClick={handleClick}
        />
      </Tooltip>
    </Grid>
  );
});

export default TagView;
