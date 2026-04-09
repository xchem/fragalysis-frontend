import React, { memo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TagView from '../tagView';
import { removeSelectedTag, addSelectedTag } from '../redux/dispatchActions';
import {
  appendRHSSelectedTag,
  removeRHSSelectedTag,
  appendLHSSelectedTag,
  removeLHSSelectedTag
} from '../../../../reducers/selection/actions';

/**
 * TagGridRows represents a  Grid view for tags
 */
const TagGridRows = memo(({ tag, side = 'shared' }) => {
  const dispatch = useDispatch();
  const selectedTagList = useSelector(state => {
    if (side === 'rhs') return state.selectionReducers.rhs_selectedTagList;
    if (side === 'lhs') return state.selectionReducers.lhs_selectedTagList;
    return state.selectionReducers.selectedTagList;
  });
  const tagList = useSelector(state => state.apiReducers.tagList);

  const handleTagClick = (selected, tag) => {
    const removeAction =
      side === 'rhs' ? removeRHSSelectedTag : side === 'lhs' ? removeLHSSelectedTag : removeSelectedTag;
    const addAction = side === 'rhs' ? appendRHSSelectedTag : side === 'lhs' ? appendLHSSelectedTag : addSelectedTag;

    if (selected) {
      dispatch(removeAction(tag));
    } else {
      dispatch(addAction(tag));
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
