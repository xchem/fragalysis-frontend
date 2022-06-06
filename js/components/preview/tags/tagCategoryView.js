import React, { memo } from 'react';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import TagView from './tagView';
import { removeSelectedTag, addSelectedTag, getMoleculeForId } from './redux/dispatchActions';
import { getAllTagsForMol } from './utils/tagUtils';

const useStyles = makeStyles(theme => ({
  divContainer: {
    flexDirection: 'column',
    display: 'flex',
    height: '100%',
    width: '100%',
    paddingTop: theme.spacing(1) / 2,
    textAlign: 'left'
  },
  categoryItem: {
    paddingRight: theme.spacing(1),
    textAlign: 'left'
  },
  headerItem: {
    paddingLeft: theme.spacing(2)
  }
}));

/**
 * TagCategoryView has two ways of behavior depending if clickCallback is defined or not:
 *  -if is- behaves as Assign tag element and assignes tags to hits
 *  -if is NOT- behaves as Hit filter element and filters hits in Hit navigator
 */
const TagCategoryView = memo(({ name, tags, specialTags, clickCallback, disabled = false }) => {
  const classes = useStyles();
  const selectedTagList = useSelector(state => state.selectionReducers.selectedTagList);
  const dispatch = useDispatch();

  const tagList = useSelector(state => state.apiReducers.tagList);
  const isTagGlobalEdit = useSelector(state => state.selectionReducers.isGlobalEdit);
  const molId = useSelector(state => state.selectionReducers.molForTagEdit);
  let moleculesToEditIds = useSelector(state => state.selectionReducers.moleculesToEdit);
  if (!isTagGlobalEdit) {
    moleculesToEditIds = [];
    moleculesToEditIds.push(molId);
  }
  const moleculesToEdit =
    moleculesToEditIds &&
    moleculesToEditIds.length > 0 &&
    !(moleculesToEditIds.length === 1 && moleculesToEditIds[0] === null)
      ? moleculesToEditIds.map(id => dispatch(getMoleculeForId(id)))
      : [];

  const handleTagClick = (selected, tag, allTags) => {
    if (clickCallback !== undefined) {
      clickCallback(selected, tag);
    } else {
      if (selected) {
        dispatch(removeSelectedTag(tag));
      } else {
        dispatch(addSelectedTag(tag));
      }
    }
  };

  const isTagSelected = tag => {
    let result = false;
    let partiallySelected = false;
    for (let i = 0; i < moleculesToEdit.length; i++) {
      const m = moleculesToEdit[i];
      const tagsForMol = getAllTagsForMol(m, tagList);
      if (tagsForMol && tagsForMol.some(t => t.id === tag.id)) {
        result = true;
        // break;
      } else {
        partiallySelected = true;
      }
    }
    return { isSelected: result, isPartiallySelected: partiallySelected };
  };

  return (
    <>
      <Grid item className={classes.categoryItem} xs={3}>
        {name && (
          <Grid className={classes.headerItem}>
            <Typography variant="h6" noWrap>
              {name}
            </Typography>
          </Grid>
        )}

        {(tags || specialTags) && (
          <Grid className={classes.divContainer}>
            {tags &&
              tags.map((tag, idx) => {
                let selected = selectedTagList.some(i => i.id === tag.id);
                let tagSelected = isTagSelected(tag);
                return (
                  <TagView
                    key={`tag-item-${idx}`}
                    tag={tag}
                    selected={clickCallback !== undefined ? tagSelected.isSelected : selected}
                    handleClick={handleTagClick}
                    disabled={disabled}
                    partiallySelected={tagSelected.isPartiallySelected}
                  ></TagView>
                );
              })}
          </Grid>
        )}
      </Grid>
    </>
  );
});

export default TagCategoryView;
