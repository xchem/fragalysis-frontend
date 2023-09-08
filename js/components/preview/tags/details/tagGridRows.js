import React, { memo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TagView from '../tagView';
import { removeSelectedTag, addSelectedTag } from '../redux/dispatchActions';

/**
 * TagGridRows represents a  Grid view for tags
 */
const TagGridRows = memo(({ tag }) => {
  const dispatch = useDispatch();
  const selectedTagList = useSelector(state => state.selectionReducers.selectedTagList);
  const tagList = useSelector(state => state.apiReducers.tagList);

  const handleTagClick = (selected, tag) => {
    if (selected) {
      dispatch(removeSelectedTag(tag));
    } else {
      dispatch(addSelectedTag(tag));
    }
  };

  return (
    <>
      {/* TagView Chip */}
      <TagView
        tags={tagList}
        key={`tag-item-editor${tag.id}`}
        tag={tag}
        selected={selectedTagList.some(i => i.id === tag.id)}
        handleClick={handleTagClick}
        // disabled={!DJANGO_CONTEXT.pk}
        disabled={false}
        isEdit={true}
        isTagEditor={true}
      ></TagView>
    </>
  );
});

export default TagGridRows;
