import React, { memo } from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import TagView from './tagView';
import { removeSelectedTag, addSelectedTag } from './redux/dispatchActions';

const useStyles = makeStyles(theme => ({
  divContainer: {
    flexDirection: 'column',
    display: 'flex',
    height: '100%',
    width: '100%',
    paddingTop: theme.spacing(1) / 2,
    textAlign: 'left'
  },
  categoryItem: {
    paddingRight: theme.spacing(1),
    textAlign: 'center'
  }
}));

const TagCategoryView = memo(({ name, tags, specialTags }) => {
  const classes = useStyles();
  const selectedTagList = useSelector(state => state.selectionReducers.selectedTagList);
  const dispatch = useDispatch();

  const handleTagClick = (selected, tag, allTags) => {
    if (selected) {
      dispatch(removeSelectedTag(tag));
    } else {
      dispatch(addSelectedTag(tag));
    }
  };
  return (
    <>
      <Grid item className={classes.categoryItem} xs={3}>
        {name && (
          <Typography variant="h6" noWrap>
            {name}
          </Typography>
        )}

        {(tags || specialTags) && (
          <Grid className={classes.divContainer}>
            {tags &&
              tags.map((tag, idx) => {
                let selected = selectedTagList.some(i => i.id === tag.id);
                return (
                  <TagView key={`tag-item-${idx}`} tag={tag} selected={selected} handleClick={handleTagClick}></TagView>
                );
              })}
          </Grid>
        )}
      </Grid>
    </>
  );
});

export default TagCategoryView;
