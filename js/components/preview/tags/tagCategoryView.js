import React, { memo } from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { useSelector } from 'react-redux';
import TagView from './tagView';

const useStyles = makeStyles(theme => ({
  divContainer: {
    flexDirection: 'column',
    display: 'flex',
    height: '100%',
    width: '100%',
    paddingTop: theme.spacing(1) / 2
  },
  categoryItem: {
    paddingRight: theme.spacing(1),
    textAlign: 'center'
  }
}));

const TagCategoryView = memo(({ name, tags, specialTags }) => {
  const classes = useStyles();
  const selectedTagList = useSelector(state => state.selectionReducers.selectedTagList);

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
            {specialTags &&
              specialTags.map((tag, idx) => {
                let selected = selectedTagList.some(i => i.id === tag.id);
                return (
                  <TagView
                    key={`tag-special-item-${idx}`}
                    tag={tag}
                    isSpecialTag={true}
                    selected={selected}
                    allTags={tags}
                  ></TagView>
                );
              })}
            {tags &&
              tags.map((tag, idx) => {
                let selected = selectedTagList.some(i => i.id === tag.id);
                return <TagView key={`tag-item-${idx}`} tag={tag} selected={selected}></TagView>;
              })}
          </Grid>
        )}
      </Grid>
    </>
  );
});

export default TagCategoryView;
