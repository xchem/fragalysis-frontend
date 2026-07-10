import React, { memo } from 'react';
import { GridLegacy as Grid } from '@mui/material';
import { useSelector } from 'react-redux';
import TagCategoryView from './tagCategoryListView';
import TagCategoryGridView from './tagCategoryGridView';
import { compareTagsAsc, getProhibitedCategoriesForEditIds, isTagVisibleOnSide } from './utils/tagUtils';

const TagCategory = memo(({ tagClickCallback, disabled = false, metaCategory = null }) => {
  const categoryList = useSelector(state => state.apiReducers.categoryList);
  const listOfProhibitedCategories = getProhibitedCategoriesForEditIds(categoryList);
  let tagList = useSelector(state => state.apiReducers.tagList);
  tagList = tagList
    .filter(t => {
      if (
        t.hidden ||
        t.additional_info?.downloadName ||
        listOfProhibitedCategories.some(cid => cid === t.category) ||
        !isTagVisibleOnSide(t, metaCategory)
      ) {
        return false;
      } else {
        return true;
      }
    })
    .sort(compareTagsAsc);

  const assignTagView = useSelector(state => state.selectionReducers.assignTagView);

  return (
    <>
      {assignTagView === true ? (
        <>
          <Grid>
            <TagCategoryView tags={tagList} clickCallback={tagClickCallback} disabled={disabled} metaCategory={metaCategory} />
          </Grid>
        </>
      ) : (
        <>
          <Grid>
            <TagCategoryGridView tags={tagList} clickCallback={tagClickCallback} disabled={disabled} metaCategory={metaCategory} />
          </Grid>
        </>
      )}
    </>
  );
});

export default TagCategory;
