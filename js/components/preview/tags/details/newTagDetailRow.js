import React, { memo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CATEGORY_TYPE, CATEGORY_ID, CATEGORY_TYPE_BY_ID } from '../../../../constants/constants';
import { ColorPicker } from '../../../common/Components/ColorPicker';
import {
  DEFAULT_TAG_COLOR,
  augumentTagObjectWithId,
  createMoleculeTagObject
} from '../utils/tagUtils';
import { DJANGO_CONTEXT } from '../../../../utils/djangoContext';
import {
  getMoleculeForId,
  updateTagProp,
  removeSelectedTag
} from '../redux/dispatchActions';
import {
  Grid,
  TextField,
  makeStyles,
  Button,
  Select,
  MenuItem
} from '@material-ui/core';
import { createNewTag } from '../api/tagsApi';
import { appendTagList, setTagToEdit } from '../../../../reducers/selection/actions';
import { appendMoleculeTag } from '../../../../reducers/api/actions';

const useStyles = makeStyles(theme => ({
  divContainer: {
    flexDirection: 'row',
    display: 'flex',
    height: '100%',
    width: '100%',
    paddingTop: theme.spacing(1) / 2,
    marginRight: '1px',
    marginLeft: '1px'
  },
  select: {
    color: 'inherit',
    fill: 'inherit',
    '&:hover:not(.Mui-disabled):before': {
      borderColor: 'inherit'
    },
    '&:before': {
      borderColor: 'inherit'
    },
    '&:not(.Mui-disabled)': {
      fill: theme.palette.white
    }
  }
}));

/**
 * NewTagDetailRow provides possibility to create and edit tags in TagDetails panel
 */
const NewTagDetailRow = memo(({ moleculesToEditIds, moleculesToEdit }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const targetName = useSelector(state => state.apiReducers.target_on_name);
  const targetId = useSelector(state => state.apiReducers.target_on);
  const tagToEdit = useSelector(state => state.selectionReducers.tagToEdit);

  const [newTagCategory, setNewTagCategory] = useState(0);
  const [newTagColor, setNewTagColor] = useState(DEFAULT_TAG_COLOR);
  const [newTagName, setNewTagName] = useState('');
  const [newTagLink, setNewTagLink] = useState('');

  useEffect(() => {
    if (tagToEdit) {
      setNewTagCategory(tagToEdit.category_id);
      if (tagToEdit.colour) setNewTagColor(tagToEdit.colour);
      setNewTagName(tagToEdit.tag);
      setNewTagLink(tagToEdit.discourse_url);
    }
  }, [tagToEdit]);

  const resetTagToEditState = () => {
    dispatch(setTagToEdit(null));
    setNewTagCategory(0);
    setNewTagColor(DEFAULT_TAG_COLOR);
    setNewTagName('');
    setNewTagLink('');
  };

  const onCategoryForNewTagChange = event => {
    setNewTagCategory(event.target.value);
    // apply also default color for every categpry (TODO move values to constants?)
    let defaultColor = DEFAULT_TAG_COLOR;
    switch (CATEGORY_TYPE_BY_ID[event.target.value]) {
      case CATEGORY_TYPE.SITE:
        defaultColor = "#d7191c";
        break;
      case CATEGORY_TYPE.SERIES:
        defaultColor = "#fdae61";
        break;
      case CATEGORY_TYPE.FORUM:
        defaultColor = "#abd9e9";
        break;
      case CATEGORY_TYPE.OTHER:
        defaultColor = "#2c7bb6";
        break;
      default:
        break;
    }
    setNewTagColor(defaultColor);
  };

  const onNameForNewTagChange = event => {
    setNewTagName(event.target.value);
  };

  const createTag = () => {
    if (newTagName && newTagCategory) {
      const newTag = { tag: newTagName, colour: newTagColor, category_id: newTagCategory, discourse_url: newTagLink };
      const tagObject = createMoleculeTagObject(
        newTagName,
        moleculesToEdit.length ? moleculesToEdit[0].proteinData.target_id : targetId,
        newTagCategory,
        DJANGO_CONTEXT.pk,
        newTagColor,
        newTagLink,
        [...moleculesToEditIds]
      );
      createNewTag(tagObject, targetName).then(molTag => {
        let augMolTagObject = augumentTagObjectWithId(newTag, molTag.id);
        dispatch(appendTagList(augMolTagObject));
        dispatch(appendMoleculeTag(molTag));
      });
      // reset tag/fields after creating new one
      resetTagToEditState();
    }
  };

  const updateTag = () => {
    if (tagToEdit && newTagCategory && newTagName) {
      // update all props at once
      dispatch(updateTagProp(Object.assign({}, tagToEdit, {
        category_id: newTagCategory,
        colour: newTagColor,
        tag: newTagName,
        discourse_url: newTagLink
      }), newTagName, "tag"));
      
      /*dispatch(updateTagProp(tagToEdit, newTagCategory, "category_id"));
      dispatch(updateTagProp(tagToEdit, newTagColor, "colour"));
      dispatch(updateTagProp(tagToEdit, newTagName, "tag"));
      dispatch(updateTagProp(tagToEdit, newTagLink, "discourse_url"));*/

      // reset tag/fields after updating selected one
      resetTagToEditState();
    }
  };

  const deleteTag = () => {
    console.log("TODO delete tag", tagToEdit);
    dispatch(removeSelectedTag(tagToEdit));
    // reset tag/fields after removing selected tag
    resetTagToEditState();
  };

  return (
    <Grid item container className={classes.divContainer} spacing={1} alignItems="flex-end" xs={12}>
      <Grid item xs={4}>
        <TextField
          id="tag-editor-tag-name"
          placeholder="Name"
          size="small"
          onChange={onNameForNewTagChange}
          fullWidth
          disabled={!DJANGO_CONTEXT.pk}
          value={newTagName}
        />
      </Grid>
      <Grid item xs={2}>
        <ColorPicker
          id="tag-editor-tag-color"
          selectedColor={newTagColor}
          setSelectedColor={value => {
            setNewTagColor(value);
          }}
          disabled={!DJANGO_CONTEXT.pk}
        />
      </Grid>
      <Grid item xs={2}>
        <Select
          className={classes.select}
          value={newTagCategory}
          label="Category"
          onChange={onCategoryForNewTagChange}
          disabled={!DJANGO_CONTEXT.pk}
        >
          {Object.keys(CATEGORY_TYPE).map(c => (
            <MenuItem
              key={`tag-editor-new-category-${CATEGORY_ID[CATEGORY_TYPE[c]]}`}
              value={CATEGORY_ID[CATEGORY_TYPE[c]]}
            >
              {CATEGORY_TYPE[c]}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid item xs={4}>
        {tagToEdit ?
          <Grid container item direction="row" alignItems="center" justify="center" xs={12}>
            <Grid item xs={6}>
              <Button onClick={updateTag} color="primary" variant="contained" disabled={!DJANGO_CONTEXT.pk}>
                Save
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button onClick={deleteTag} color="secondary" variant="contained" disabled={!DJANGO_CONTEXT.pk}>
                Delete
              </Button>
            </Grid>
          </Grid>
          :
          <Grid container item direction="row" alignItems="center" justify="center">
            <Button onClick={createTag} color="primary" variant="contained" disabled={!DJANGO_CONTEXT.pk}>
              Create
            </Button>
          </Grid>
        }
      </Grid>
    </Grid>
  );
});

export default NewTagDetailRow;
