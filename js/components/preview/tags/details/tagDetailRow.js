import React, { memo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CATEGORY_TYPE_BY_ID } from '../../../../constants/constants';
import TagView from '../tagView';
import { getDefaultTagDiscoursePostText } from '../utils/tagUtils';
import { DJANGO_CONTEXT } from '../../../../utils/djangoContext';
import { updateTagProp, selectTag, unselectTag, removeSelectedTag, addSelectedTag } from '../redux/dispatchActions';
import { Grid, Tooltip, makeStyles, Button, Typography, IconButton } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { isURL } from '../../../../utils/common';
import classNames from 'classnames';
import { createTagPost, isDiscourseAvailableNotSignedIn, isDiscourseAvailable } from '../../../../utils/discourse';
import { setTagToEdit, appendToMolListToEdit, removeFromMolListToEdit } from '../../../../reducers/selection/actions';

const useStyles = makeStyles(theme => ({
  contColButton: {
    minWidth: 'fit-content',
    paddingLeft: theme.spacing(1) / 4,
    paddingRight: theme.spacing(1) / 4,
    paddingBottom: 0,
    paddingTop: 0,
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
  divContainer: {
    flexDirection: 'row',
    display: 'flex',
    // height: '100%',
    width: '100%'
    /*paddingTop: theme.spacing(1) / 2,
    marginRight: '1px',
    marginLeft: '1px'*/
  },
  editButton: {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
      color: theme.palette.success.contrastText
    }
  },
  editButtonIcon: {
    width: '0.75em',
    height: '0.75em'
  },
  unselectButtonWrapper: {
    paddingLeft: '1px !important',
    paddingRight: '1px !important'
  }
}));

/**
 * TagDetailRow represents a row of TagDetails panel summary
 */
const TagDetailRow = memo(({ tag, moleculesToEditIds, moleculesToEdit }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [allMoleculesOfTag, setAllMoleculesOfTag] = useState([]);

  const targetName = useSelector(state => state.apiReducers.target_on_name);
  const selectedTagList = useSelector(state => state.selectionReducers.selectedTagList);
  const allMolList = useSelector(state => state.apiReducers.all_mol_lists);

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
      dispatch(unselectTag(tag));
    } else {
      // select all
      allMoleculesOfTag.forEach(mol => {
        if (!moleculesToEditIds.includes(mol.id)) {
          dispatch(appendToMolListToEdit(mol.id));
        }
      });
      dispatch(selectTag(tag));
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
    if (selected) {
      dispatch(removeSelectedTag(tag));
    } else {
      dispatch(addSelectedTag(tag));
    }
  };

  const handleEditTag = tag => {
    dispatch(setTagToEdit(tag));
  };

  return (
    <Grid container item className={classes.divContainer} spacing={1} wrap="nowrap" alignItems="center" xs={12}>
      {/* TagView Chip */}
      <Grid item xs={3}>
        <TagView
          key={`tag-item-editor${tag.id}`}
          tag={tag}
          selected={selectedTagList.some(i => i.id === tag.id)}
          handleClick={handleTagClick}
          // disabled={!DJANGO_CONTEXT.pk}
          disabled={false}
          isEdit={true}
          isTagEditor={true}
        ></TagView>
      </Grid>
      {/* category */}
      <Grid item xs={1} wrap="nowrap">
        <Tooltip title={CATEGORY_TYPE_BY_ID[tag.category_id]}>
          <Typography variant="body2" noWrap>
            {CATEGORY_TYPE_BY_ID[tag.category_id]}
          </Typography>
        </Tooltip>
      </Grid>
      {/* select hits button */}
      <Grid item xs={2} className={hasSelectedMolecule() ? classes.unselectButtonWrapper : null}>
        <Tooltip title="Select hits">
          <Grid item>
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
          </Grid>
        </Tooltip>
      </Grid>
      {/* discourse button */}
      <Grid item xs={2}>
        <Tooltip title="Discourse link">
          <Grid item>
            <Button
              variant="outlined"
              className={classNames(classes.contColButton, {
                [classes.contColButtonSelected]: false,
                [classes.contColButtonHalfSelected]: false
              })}
              onClick={() => {
                if (isURL(tag.discourse_url)) {
                  window.open(tag.discourse_url, '_blank');
                } else {
                  createTagPost(tag, targetName, getDefaultTagDiscoursePostText(tag)).then(resp => {
                    const tagURL = resp.data['Post url'];
                    tag['discourse_url'] = tagURL;
                    dispatch(updateTagProp(tag, tagURL, 'discourse_url'));
                    window.open(tag.discourse_url, '_blank');
                  });
                }
              }}
              disabled={!(isDiscourseAvailable() || (isDiscourseAvailableNotSignedIn() && tag.discourse_url))}
            >
              Discourse
            </Button>
          </Grid>
        </Tooltip>
      </Grid>
      {/* user */}
      <Grid item xs={1}>
        <Typography variant="body2">{tag.user_id}</Typography>
      </Grid>
      {/* date */}
      <Grid item xs={2} container alignContent="center" justifyContent="center">
        <Typography variant="body2" noWrap>
          {navigator.language
            ? new Date(tag.create_date).toLocaleDateString(navigator.language)
            : new Date(tag.create_date).toLocaleDateString()}
        </Typography>
      </Grid>
      {/* edit button */}
      <Grid item xs={1}>
        <IconButton
          variant="contained"
          className={classes.editButton}
          size="small"
          onClick={() => handleEditTag(tag)}
          disabled={!DJANGO_CONTEXT.pk}
          aria-label="edit tag"
        >
          <Tooltip title="Edit" className={classes.editButtonIcon}>
            <Edit />
          </Tooltip>
        </IconButton>
      </Grid>
    </Grid>
  );
});

export default TagDetailRow;
