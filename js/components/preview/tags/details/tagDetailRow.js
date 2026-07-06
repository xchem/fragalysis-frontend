import React, { memo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PLURAL_TO_SINGULAR } from '../../../../constants/constants';
import TagView from '../tagView';
import { getDefaultTagDiscoursePostText } from '../utils/tagUtils';
import { updateTagProp, removeSelectedTag, addSelectedTag } from '../redux/dispatchActions';
import {
  appendRHSSelectedTag,
  removeRHSSelectedTag,
  appendLHSSelectedTag,
  removeLHSSelectedTag
} from '../../../../reducers/selection/actions';
import { makeStyles, Button, Typography, Fab } from '@material-ui/core';
import { Forum } from '@material-ui/icons';
import classNames from 'classnames';
import {
  createTagPost,
  isDiscourseAvailableNotSignedIn,
  isDiscourseAvailable,
  openDiscourseLink
} from '../../../../utils/discourse';
import { setTagToEdit, appendToMolListToEdit, removeFromMolListToEdit } from '../../../../reducers/selection/actions';
import { setOpenDiscourseErrorModal } from '../../../../reducers/api/actions';
import { getCategoryById } from '../../molecule/redux/dispatchActions';
import RichTooltip from '../../../tooltip/RichTooltip';

const useStyles = makeStyles(theme => ({
  contColButton: {
    height: 16,
    minWidth: 'fit-content',
    padding: '0 1px',
    fontWeight: 'bold',
    fontSize: 9,
    borderRadius: 7,
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
    '&:disabled': {
      borderRadius: 0,
      borderColor: 'white'
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.light
    }
  },
  contColButtonSelected: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.main
    }
  },
  contColButtonHalfSelected: {
    backgroundColor: theme.palette.primary.semidark,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.black
    }
  },
  editButton: {
    width: 16,
    height: 16,
    padding: 0,
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
      color: theme.palette.success.contrastText
    }
  },
  editButtonIcon: {
    width: '0.6em',
    height: '0.6em'
  },
  discourseButton: {
    color: theme.palette.white,
    width: 16,
    height: 16,
    minHeight: 'unset'
  },
  discourseButtonIcon: {
    width: '0.55em',
    height: '0.55em'
  },
  discoursePlaceholder: {
    width: 16,
    height: 16
  },
  text: {
    lineHeight: 1.2
  }
}));

/**
 * TagDetailRow represents a row of TagDetails panel summary
 */
const TagDetailRow = memo(({ tag, moleculesToEditIds, moleculesToEdit, side = 'shared' }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const showDiscourseButton = false;
  const [allMoleculesOfTag, setAllMoleculesOfTag] = useState([]);

  const targetName = useSelector(state => state.apiReducers.target_on_name);
  const selectedTagList = useSelector(state => {
    if (side === 'rhs') return state.selectionReducers.rhs_selectedTagList;
    if (side === 'lhs') return state.selectionReducers.lhs_selectedTagList;
    return state.selectionReducers.selectedTagList;
  });
  const allMolList = useSelector(state => state.apiReducers.all_mol_lists);
  const tagList = useSelector(state => state.apiReducers.tagList);

  useEffect(() => {
    if (allMolList.length) {
      setAllMoleculesOfTag(
        allMolList.filter(mol => {
          const tags = mol.tags_set.filter(id => id === tag.id);
          return tags && tags.length ? true : false;
        })
      );
    }
  }, [allMolList, tag]);

  const handleSelectHits = () => {
    if (hasSelectedMolecule(tag)) {
      // deselect all
      allMoleculesOfTag.forEach(mol => {
        if (moleculesToEditIds.includes(mol.id)) {
          dispatch(removeFromMolListToEdit(mol.id));
        }
      });
    } else {
      // select all
      allMoleculesOfTag.forEach(mol => {
        if (!moleculesToEditIds.includes(mol.id)) {
          dispatch(appendToMolListToEdit(mol.id));
        }
      });
    }
  };

  const hasSelectedMolecule = () => {
    let result = false;
    for (let i = 0; i < moleculesToEdit.length; i++) {
      const mol = moleculesToEdit[i];
      if (mol.tags_set.some(id => id === tag.id)) {
        result = true;
        break;
      }
    }
    return result;
  };

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

  const handleEditTag = tag => {
    dispatch(setTagToEdit(tag));
  };

  const getTagCategoryName = () => {
    const category = dispatch(getCategoryById(tag.category))?.category;
    return PLURAL_TO_SINGULAR.hasOwnProperty(category) ? PLURAL_TO_SINGULAR[category] : category;
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

      {/* category */}
      <RichTooltip path="tagCategory" values={{ tagCategory: getTagCategoryName() }}>
        <Typography className={classes.text} variant="body2" noWrap>
          {getTagCategoryName()}
        </Typography>
      </RichTooltip>
      {/* select hits button */}
      <RichTooltip path={hasSelectedMolecule() ? 'selectHits.unselectHits' : 'selectHits.selectHits'}>
        <Button
          variant="outlined"
          className={classNames(classes.contColButton, {
            [classes.contColButtonSelected]: hasSelectedMolecule(),
            [classes.contColButtonHalfSelected]: false
          })}
          onClick={() => handleSelectHits()}
          disabled={false}
        >
          {hasSelectedMolecule() ? 'Unselect hits' : 'Select hits'}
        </Button>
      </RichTooltip>

      {showDiscourseButton ? (
        <RichTooltip path="discourseLink">
          {/* Tooltip should not have disabled element as a direct child */}
          <>
            <Fab
              color="secondary"
              size="small"
              className={classes.discourseButton}
              onClick={() => {
                try {
                  if (tag.discourse_url) {
                    openDiscourseLink(tag.discourse_url);
                  } else {
                    createTagPost(tag, targetName, getDefaultTagDiscoursePostText(tag)).then(resp => {
                      const tagURL = resp.data['Post url'];
                      tag['discourse_url'] = tagURL;
                      dispatch(updateTagProp(tag, tagURL, 'discourse_url'));
                      openDiscourseLink(tag.discourse_url);
                    });
                  }
                } catch (err) {
                  console.log(err);
                  dispatch(setOpenDiscourseErrorModal(true));
                }
              }}
              disabled={!(isDiscourseAvailable() || (isDiscourseAvailableNotSignedIn() && tag.discourse_url))}
            >
              <Forum className={classes.discourseButtonIcon} />
            </Fab>
          </>
        </RichTooltip>
      ) : (
        <div className={classes.discoursePlaceholder} aria-hidden="true"></div>
      )}

      {/* user */}
      <Typography className={classes.text} variant="body2">
        {tag.user_id}
      </Typography>

      {/* date */}
      <Typography className={classes.text} variant="body2" noWrap>
        {navigator.language
          ? new Date(tag.create_date).toLocaleDateString(navigator.language)
          : new Date(tag.create_date).toLocaleDateString()}
      </Typography>
      {/* </TableCell> */}

      {/* edit button */}
      <div></div>
    </>
  );
});

export default TagDetailRow;
