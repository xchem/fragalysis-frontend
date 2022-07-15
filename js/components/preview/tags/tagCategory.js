import React, { memo } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import TagCategoryView from './tagCategoryView';
import { CATEGORY_TYPE } from '../../../constants/constants';
import { compareTagsAsc } from './utils/tagUtils';

const useStyles = makeStyles(theme => ({
  category: {
    display: 'flex'
  }
}));

const TagCategory = memo(({ tagClickCallback, disabled = false }) => {
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
      <Grid className={classes.category}>
        <TagCategoryView name={CATEGORY_TYPE.SITE} disabled={disabled} />
        <TagCategoryView name={CATEGORY_TYPE.SERIES} disabled={disabled} />
        <TagCategoryView name={CATEGORY_TYPE.FORUM} disabled={disabled} />
        <TagCategoryView name={CATEGORY_TYPE.OTHER} disabled={disabled} />
      </Grid>

      <Grid>
        <TagCategoryView tags={siteTags} clickCallback={tagClickCallback} disabled={disabled} />
        <TagCategoryView tags={seriesTags} clickCallback={tagClickCallback} disabled={disabled} />
        <TagCategoryView tags={forumTags} clickCallback={tagClickCallback} disabled={disabled} />
        <TagCategoryView tags={otherTags} clickCallback={tagClickCallback} disabled={disabled} />
      </Grid>
    </>
  );
});

export default TagCategory;
