import React, { memo } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import TagCategoryView from './tagCategoryView';
import { CATEGORY_TYPE } from '../../../constants/constants';
import { compareTagsAsc } from './utils/tagUtils';

const useStyles = makeStyles(theme => ({
  category: {
    display: 'flex'
  },
  categoryScrollable: {
    display: 'flex',
    overflow: 'auto'
  }
}));

const TagCategory = memo(({ headerPadding = 0, tagClickCallback }) => {
  const classes = useStyles();

  const categoryList = useSelector(state => state.selectionReducers.categoryList);
  let tagList = useSelector(state => state.selectionReducers.tagList);
  tagList = tagList.sort(compareTagsAsc);

  const siteCategory = categoryList.find(c => c.category === CATEGORY_TYPE.SITE);
  const seriesCategory = categoryList.find(c => c.category === CATEGORY_TYPE.SERIES);
  const forumCategory = categoryList.find(c => c.category === CATEGORY_TYPE.FORUM);

  const siteTags = tagList.filter(c => c.category_id === siteCategory?.id);
  const seriesTags = tagList.filter(c => c.category_id === seriesCategory?.id);
  const forumTags = tagList.filter(c => c.category_id === forumCategory?.id);
  const otherTags = tagList.filter(
    c =>
      c.category_id !== siteCategory?.id && c.category_id !== seriesCategory?.id && c.category_id !== forumCategory?.id
  );

  return (
    <>
      <Grid className={classes.category} style={{ paddingRight: headerPadding + 'px' }}>
        <TagCategoryView name={CATEGORY_TYPE.SITE} />
        <TagCategoryView name={CATEGORY_TYPE.SERIES} />
        <TagCategoryView name={CATEGORY_TYPE.FORUM} />
        <TagCategoryView name={CATEGORY_TYPE.OTHER} />
      </Grid>

      <Grid className={classes.categoryScrollable}>
        <TagCategoryView tags={siteTags} clickCallback={tagClickCallback} />
        <TagCategoryView tags={seriesTags} clickCallback={tagClickCallback} />
        <TagCategoryView tags={forumTags} clickCallback={tagClickCallback} />
        <TagCategoryView tags={otherTags} clickCallback={tagClickCallback} />
      </Grid>
    </>
  );
});

export default TagCategory;
