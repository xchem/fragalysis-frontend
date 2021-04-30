import React, { memo } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import TagCategoryView from './tagCategoryView';
import { CATEGORY_TYPE } from '../../../constants/constants';

const useStyles = makeStyles(theme => ({
  category: {
    display: 'flex'
  },
  categoryScrollable: {
    display: 'flex',
    overflow: 'auto'
  }
}));

const TagCategory = memo(({}) => {
  const classes = useStyles();

  const categoryList = useSelector(state => state.selectionReducers.categoryList);
  const tagList = useSelector(state => state.selectionReducers.tagList);
  const specialTagList = useSelector(state => state.selectionReducers.specialTagList);

  const siteCategory = categoryList.find(c => c.text === CATEGORY_TYPE.SITE);
  const seriesCategory = categoryList.find(c => c.text === CATEGORY_TYPE.SERIES);
  const forumCategory = categoryList.find(c => c.text === CATEGORY_TYPE.FORUM);

  const siteTags = tagList.filter(c => c.category === siteCategory?.id);
  const seriesTags = tagList.filter(c => c.category === seriesCategory?.id);
  const forumTags = tagList.filter(c => c.category === forumCategory?.id);
  const otherTags = tagList.filter(
    c => c.category !== siteCategory?.id && c.category !== seriesCategory?.id && c.category !== forumCategory?.id
  );

  return (
    <>
      <Grid className={classes.category}>
        <TagCategoryView name={CATEGORY_TYPE.SITE} />
        <TagCategoryView name={CATEGORY_TYPE.SERIES} />
        <TagCategoryView name={CATEGORY_TYPE.FORUM} />
        <TagCategoryView name={CATEGORY_TYPE.OTHER} />
      </Grid>

      <Grid className={classes.categoryScrollable}>
        <TagCategoryView tags={siteTags} specialTags={specialTagList} />
        <TagCategoryView tags={seriesTags} />
        <TagCategoryView tags={forumTags} />
        <TagCategoryView tags={otherTags} />
      </Grid>
    </>
  );
});

export default TagCategory;
