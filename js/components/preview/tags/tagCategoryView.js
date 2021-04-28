import React, { memo } from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import TagView from './tagView';

const useStyles = makeStyles(theme => ({
  divContainer: {
    height: '100%',
    width: '100%',
    paddingTop: theme.spacing(1) / 2
  },
  divScrollable: {
    //height: '100%',
    //width: '100%',
    //overflow: 'auto'
  }
}));

const TagCategoryView = memo(({ name, tags, specialTags }) => {
  const classes = useStyles();
  const selectedTagList = useSelector(state => state.selectionReducers.selectedTagList);

  return (
    <div className={classes.divContainer}>
      <div className={classes.divScrollable}>
        <Grid container direction="column">
          {specialTags &&
            specialTags.map((tag, idx) => {
              let selected = selectedTagList.some(i => i.id === tag.id);
              return <TagView key={`tag-special-item-${idx}`} tag={tag} selected={selected}></TagView>;
            })}
          {tags &&
            tags.map((tag, idx) => {
              let selected = selectedTagList.some(i => i.id === tag.id);
              return <TagView key={`tag-item-${idx}`} tag={tag} selected={selected}></TagView>;
            })}
        </Grid>
      </div>
    </div>
  );
});

export default TagCategoryView;
