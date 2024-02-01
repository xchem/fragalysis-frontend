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
  tagList = tagList
    .filter(t => {
      if (t.additional_info?.downloadName) {
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
            <TagCategoryView tags={tagList} clickCallback={tagClickCallback} disabled={disabled} />
          </Grid>
        </>
      ) : (
        <>
          <Grid>
            <TagCategoryGridView tags={tagList} clickCallback={tagClickCallback} disabled={disabled} />
          </Grid>
        </>
      )}
    </>
  );
});

export default TagCategory;
