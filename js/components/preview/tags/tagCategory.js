import React, { memo } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import TagCategoryView from './tagCategoryListView';
import TagCategoryGridView from './tagCategoryGridView';
import { CATEGORY_TYPE } from '../../../constants/constants';
import { compareTagsAsc } from './utils/tagUtils';

const useStyles = makeStyles(theme => ({
  category: {
    display: '-webkit-box'
  }
}));

const TagCategory = memo(({ tagClickCallback, disabled = false }) => {
  const classes = useStyles();

  const categoryList = useSelector(state => state.apiReducers.categoryList);
  let tagList = useSelector(state => state.apiReducers.tagList);
  tagList = tagList.sort(compareTagsAsc);

  const assignTagView = useSelector(state => state.selectionReducers.assignTagView);

  const siteCategory = categoryList.find(c => c.category === CATEGORY_TYPE.SITE);
  const seriesCategory = categoryList.find(c => c.category === CATEGORY_TYPE.SERIES);
  const forumCategory = categoryList.find(c => c.category === CATEGORY_TYPE.FORUM);

  const siteTags = tagList.filter(c => c.category === siteCategory?.id);
  const seriesTags = tagList.filter(c => c.category === seriesCategory?.id);
  const forumTags = tagList.filter(c => c.category === forumCategory?.id);
  const otherTags = tagList.filter(
    c => c.category !== siteCategory?.id && c.category !== seriesCategory?.id && c.category !== forumCategory?.id
  );

  return (
    <>
      {assignTagView === true ? (
        <>
          <Grid>
            <TagCategoryView tags={siteTags} clickCallback={tagClickCallback} disabled={disabled} />
            <TagCategoryView tags={seriesTags} clickCallback={tagClickCallback} disabled={disabled} />
            <TagCategoryView tags={forumTags} clickCallback={tagClickCallback} disabled={disabled} />
            <TagCategoryView tags={otherTags} clickCallback={tagClickCallback} disabled={disabled} />
          </Grid>
        </>
      ) : (
        <>
          <Grid>
            <TagCategoryGridView tags={siteTags} clickCallback={tagClickCallback} disabled={disabled} />
          </Grid>
        </>
      )}
    </>
  );
});

export default TagCategory;
