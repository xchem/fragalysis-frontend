import React, { memo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CATEGORY_TYPE, CATEGORY_ID, CATEGORY_TYPE_BY_ID } from '../../../../constants/constants';
import { ColorPicker } from '../../../common/Components/ColorPicker';
import { DEFAULT_TAG_COLOR, augumentTagObjectWithId, createMoleculeTagObject } from '../utils/tagUtils';
import { DJANGO_CONTEXT } from '../../../../utils/djangoContext';
import { updateTagProp, removeSelectedTag } from '../redux/dispatchActions';
import { Grid, TextField, makeStyles, Button, Select, MenuItem, withStyles, IconButton, Tooltip } from '@material-ui/core';
import { Block } from '@material-ui/icons';
import { createNewTag, deleteExistingTag } from '../api/tagsApi';
import { appendTagList, setTagToEdit, removeFromTagList } from '../../../../reducers/selection/actions';
import { appendMoleculeTag, updateMoleculeInMolLists } from '../../../../reducers/api/actions';

const useStyles = makeStyles(theme => ({
  divContainer: {
    flexDirection: 'row',
    display: 'flex',
    height: '100%',
    width: '100%',
    // paddingTop: theme.spacing(1) / 2,
    paddingTop: "0 !important",
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
    },
    createButton: {
      color: theme.palette.success.light
    }
  },
  positionColor: {
    marginLeft: -7
  },
  positionCategories: {
    marginLeft: -30,
    marginRight: 28
  },
  sdcButtonWrapper: {
    textAlign: "end"
  },
  sdcButton: {
    minWidth: 52,
    padding: 4
  },
  positionSaveButton: {
    marginRight: -9
  },
  positionDeleteButton: {
    marginRight: -7
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
  const allMolList = useSelector(state => state.apiReducers.all_mol_lists);

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
        defaultColor = '#d7191c';
        break;
      case CATEGORY_TYPE.SERIES:
        defaultColor = '#fdae61';
        break;
      case CATEGORY_TYPE.FORUM:
        defaultColor = '#abd9e9';
        break;
      case CATEGORY_TYPE.OTHER:
        defaultColor = '#2c7bb6';
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
        let augMolTagObject = augumentTagObjectWithId(
          {
            tag: molTag.tag,
            category_id: molTag.category,
            target_id: molTag.target,
            user_id: molTag.user,
            create_date: molTag.create_date,
            colour: molTag.colour,
            discourse_url: molTag.discourse_url,
            help_text: molTag.help_text,
            additional_info: molTag.additional_info,
            mol_group_id: molTag.mol_group
          },
          molTag.id
        );
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
      dispatch(
        updateTagProp(
          Object.assign({}, tagToEdit, {
            category_id: newTagCategory,
            colour: newTagColor,
            tag: newTagName,
            discourse_url: newTagLink
          }),
          newTagName,
          'tag'
        )
      );
      // reset tag/fields after updating selected one
      resetTagToEditState();
    }
  };
  
  const cancelTag = () => {
    resetTagToEditState();
  };

  const deleteTag = () => {
    if (confirm("Do wou want to delete \"" + tagToEdit.tag + "\"?")) {
      dispatch(removeSelectedTag(tagToEdit));
      dispatch(removeFromTagList(tagToEdit));
      // remove from all molecules
      const molsForTag = allMolList.filter(mol => {
        const tags = mol.tags_set.filter(id => id === tagToEdit.id);
        return tags && tags.length ? true : false;
      });
      if (molsForTag && molsForTag.length) {
        molsForTag.forEach(m => {
          let newMol = { ...m };
          newMol.tags_set = newMol.tags_set.filter(id => id !== tagToEdit.id);
          dispatch(updateMoleculeInMolLists(newMol));
        });
      }
      deleteExistingTag(tagToEdit, tagToEdit.id);
      // reset tag/fields after removing selected tag
      resetTagToEditState();
    }
  };

  const CreateButton = withStyles((theme) => ({
    root: {
      color: theme.palette.success.contrastText,
      backgroundColor: theme.palette.success.light,
      '&:hover': {
        backgroundColor: theme.palette.success.main
      }
    }
  }))(Button);

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
      <Grid item xs={2} className={classes.positionColor}>
        <ColorPicker
          id="tag-editor-tag-color"
          selectedColor={newTagColor}
          setSelectedColor={value => {
            setNewTagColor(value);
          }}
          disabled={!DJANGO_CONTEXT.pk}
        />
      </Grid>
      <Grid item xs={1} className={classes.positionCategories}>
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
      <Grid item xs={5}>
        {tagToEdit ? (
          <Grid container item direction="row" alignItems="center" justify="flex-end" xs={12}>
            <Grid item className={`${classes.sdcButtonWrapper} ${classes.positionSaveButton}`} xs={4}>
              <Button
                onClick={() => updateTag()}
                color="primary"
                variant="contained"
                disabled={!DJANGO_CONTEXT.pk}
                size="small"
                className={classes.sdcButton}
              >
                Save
              </Button>
            </Grid>
            <Grid item className={`${classes.sdcButtonWrapper} ${classes.positionDeleteButton}`} xs={4}>
              <Button
                onClick={() => deleteTag()}
                color="secondary"
                variant="contained"
                disabled={!DJANGO_CONTEXT.pk}
                size="small"
                className={classes.sdcButton}
              >
                Delete
              </Button>
            </Grid>
            <Grid item className={classes.sdcButtonWrapper} xs={4}>
              <Button
                onClick={() => cancelTag()}
                //color="success"
                variant="contained"
                disabled={!DJANGO_CONTEXT.pk}
                size="small"
                className={classes.sdcButton}
              >
                Cancel
              </Button>
            </Grid>
            {/*<Grid item xs={2}>
              <IconButton
                variant="contained"
                size="small"
                onClick={() => cancelTag()}
                disabled={!DJANGO_CONTEXT.pk}
              >
                <Tooltip title="Cancel">
                  <Block />
                </Tooltip>
              </IconButton>
            </Grid>*/}
          </Grid>
        ) : (
          <Grid container item direction="row" alignItems="center" justify="center" xs={12}>
            <CreateButton
              onClick={() => createTag()}
              variant="contained"
              disabled={!DJANGO_CONTEXT.pk}
              size="small"
            >
              Create
            </CreateButton>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
});

export default NewTagDetailRow;
