import React, { forwardRef, memo, useState, useCallback, useContext, useEffect } from 'react';
import {
  Grid,
  Popper,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  makeStyles,
  Button,
  useTheme,
  Select,
  MenuItem,
  Box
} from '@material-ui/core';
import { Panel } from '../../../common';
import { ColorPicker } from '../../../common/Components/ColorPicker';
import { Close, Search } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import classNames from 'classnames';
import TagView from '../tagView';
import { updateMoleculeInMolLists, updateMoleculeTag, appendMoleculeTag } from '../../../../reducers/api/actions';
import {
  displayAllMolsInNGL,
  hideAllMolsInNGL,
  displayInListForTag,
  hideInListForTag,
  updateTagProp,
  getMoleculeForId
} from '../redux/dispatchActions';
import { NglContext } from '../../../nglView/nglProvider';
import { VIEWS, CATEGORY_TYPE, CATEGORY_ID } from '../../../../constants/constants';
import { appendTagList, updateTag } from '../../../../reducers/selection/actions';
import { createNewTag, updateExistingTag } from '../api/tagsApi';
import { DJANGO_CONTEXT } from '../../../../utils/djangoContext';
import {
  compareTagsAsc,
  DEFAULT_TAG_COLOR,
  augumentTagObjectWithId,
  createMoleculeTagObject,
  getMoleculeTagForTag,
  getAllTagsForMol
} from '../utils/tagUtils';

const useStyles = makeStyles(theme => ({
  paper: {
    height: 343,
    overflowY: 'hidden'
  },
  content: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: 300
  },
  contColButton: {
    minWidth: 'fit-content',
    paddingLeft: theme.spacing(1) / 4,
    paddingRight: theme.spacing(1) / 4,
    paddingBottom: 0,
    paddingTop: 0,
    fontWeight: 'bold',
    fontSize: 9,
    borderRadius: 0,
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText
    },
    '&:disabled': {
      borderRadius: 0,
      borderColor: 'white'
    }
  },
  divContainer: {
    flexDirection: 'row',
    display: 'flex',
    height: '100%',
    width: '100%',
    paddingTop: theme.spacing(1) / 2,
    marginRight: '1px',
    marginLeft: '1px'
  },
  contColButtonSelected: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.black
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

export const TagEditor = memo(
  forwardRef(({ open = false, anchorEl, setOpenDialog }, ref) => {
    const id = open ? 'simple-popover-mols-tag-editor' : undefined;
    const classes = useStyles();
    const theme = useTheme();
    const dispatch = useDispatch();
    const [searchString, setSearchString] = useState(null);
    const [newTagCategory, setNewTagCategory] = useState(1);
    const [newTagColor, setNewTagColor] = useState(DEFAULT_TAG_COLOR);
    const [newTagName, setNewTagName] = useState(null);
    const [newTagLink, setNewTagLink] = useState(null);
    let tagList = useSelector(state => state.selectionReducers.tagList);
    let moleculeTags = useSelector(state => state.apiReducers.moleculeTags);
    const displayAllInNGLList = useSelector(state => state.selectionReducers.displayAllInNGLList);
    const displayAllInList = useSelector(state => state.selectionReducers.listAllList);
    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
    const molId = useSelector(state => state.selectionReducers.molForTagEdit);
    const mol = dispatch(getMoleculeForId(molId));

    tagList = tagList.sort(compareTagsAsc);
    moleculeTags = moleculeTags.sort(compareTagsAsc);

    const resetNewTagFields = () => {
      setNewTagCategory(1);
      setNewTagColor(DEFAULT_TAG_COLOR);
      setNewTagName(null);
      setNewTagLink(null);
    };

    const handleCloseModal = () => {
      setSearchString(null);
      dispatch(setOpenDialog(false));
    };

    let tagsForMolecule = getAllTagsForMol(mol, tagList);

    const isTagSelected = tag => {
      return tagsForMolecule && tagsForMolecule.some(t => t.id === tag.id);
    };

    const handleTagClick = (selected, tag) => {
      let molTagObject = undefined;
      if (selected) {
        let newMol = { ...mol };
        newMol.tags_set = newMol.tags_set.filter(id => id !== tag.id);
        dispatch(updateMoleculeInMolLists(newMol));
        const moleculeTag = getMoleculeTagForTag(moleculeTags, tag.id);
        let newMolList = [...moleculeTag.molecules];
        newMolList = newMolList.filter(id => id !== mol.id);
        molTagObject = createMoleculeTagObject(
          tag.tag,
          newMol.proteinData.target_id,
          tag.category_id,
          DJANGO_CONTEXT.pk,
          tag.colour,
          tag.discourse_url,
          newMolList,
          tag.create_date,
          tag.additional_info
        );
      } else {
        if (!mol.tags_set.some(id => id === tag.id)) {
          let newMol = { ...mol };
          newMol.tags_set.push(tag.id);
          dispatch(updateMoleculeInMolLists(newMol));
          const moleculeTag = getMoleculeTagForTag(moleculeTags, tag.id);
          molTagObject = createMoleculeTagObject(
            tag.tag,
            newMol.proteinData.target_id,
            tag.category_id,
            DJANGO_CONTEXT.pk,
            tag.colour,
            tag.discourse_url,
            [...moleculeTag.molecules, newMol.id],
            tag.create_date,
            tag.additional_info
          );
        }
      }
      if (molTagObject) {
        let augMolTagObject = augumentTagObjectWithId(molTagObject, tag.id);
        dispatch(updateMoleculeTag(augMolTagObject));
        updateExistingTag(molTagObject, tag.id);
      }
    };

    let filteredTags = tagList;
    if (searchString !== null) {
      filteredTags = tagList.filter(
        tag => isTagSelected(tag) || tag.tag.toLowerCase().includes(searchString.toLowerCase())
      );
    }

    let debouncedFn;

    const handleSearch = event => {
      /* signal to React not to nullify the event object */
      event.persist();
      if (!debouncedFn) {
        debouncedFn = debounce(() => {
          setSearchString(event.target.value !== '' ? event.target.value : null);
        }, 350);
      }
      debouncedFn();
    };

    const handleDisplayAllInNGL = tag => {
      if (isTagDisplayedInNGL(tag)) {
        dispatch(hideAllMolsInNGL(stage, tag));
      } else {
        dispatch(displayAllMolsInNGL(stage, tag));
      }
    };

    const handleDisplayAllInList = tag => {
      if (isTagDislayedInList(tag)) {
        dispatch(hideInListForTag(tag));
      } else {
        dispatch(displayInListForTag(tag));
      }
    };

    const isTagDisplayedInNGL = tag => {
      return displayAllInNGLList.includes(tag.id);
    };

    const isTagDislayedInList = tag => {
      return displayAllInList.includes(tag.id);
    };

    const onCategoryForNewTagChange = event => {
      setNewTagCategory(event.target.value);
    };

    const onNameForNewTagChange = event => {
      setNewTagName(event.target.value);
    };

    const onLinkForNewTagChange = event => {
      setNewTagLink(event.target.value);
    };

    const createTag = () => {
      if (newTagName) {
        const newTag = { tag: newTagName, colour: newTagColor, category_id: newTagCategory, discourse_url: newTagLink };
        const tagObject = createMoleculeTagObject(
          newTagName,
          mol.proteinData.target_id,
          newTagCategory,
          DJANGO_CONTEXT.pk,
          newTagColor,
          newTagLink,
          [mol.id]
        );
        createNewTag(tagObject).then(molTag => {
          let augMolTagObject = augumentTagObjectWithId(newTag, molTag.id);
          dispatch(appendTagList(augMolTagObject));
          dispatch(appendMoleculeTag(molTag));
        });
        // resetNewTagFields();
      }
    };

    const onUpdateTag = (tag, value, prop) => {
      if (value) {
        dispatch(updateTagProp(tag, value, prop));
      }
    };

    return (
      <Popper id={id} open={open} anchorEl={anchorEl} placement="left-start" ref={ref}>
        <Panel
          hasHeader
          secondaryBackground
          title="Tag Editor"
          className={classes.paper}
          headerActions={[
            <TextField
              className={classes.search}
              id="search-inspiration-dialog"
              placeholder="Search"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="inherit" />
                  </InputAdornment>
                )
              }}
              onChange={handleSearch}
              disabled={false}
            />,
            <Tooltip title="Close tag editor">
              <IconButton color="inherit" className={classes.headerButton} onClick={handleCloseModal}>
                <Close />
              </IconButton>
            </Tooltip>
          ]}
        >
          <div className={classes.content}>
            <Grid container direction="column">
              <Grid container item className={classes.divContainer} spacing={5} alignItems="flex-end" xs={12}>
                <Grid item xs={4}>
                  <TextField
                    id="tag-editor-tag-name"
                    placeholder="Name"
                    size="small"
                    onChange={onNameForNewTagChange}
                    fullWidth
                    disabled={!DJANGO_CONTEXT.pk}
                  />
                </Grid>
                <Grid item xs={1}>
                  <ColorPicker
                    id="tag-editor-tag-color"
                    selectedColor={newTagColor}
                    setSelectedColor={value => {
                      setNewTagColor(value);
                    }}
                    disabled={!DJANGO_CONTEXT.pk}
                  />
                </Grid>
                <Grid item xs={1}>
                  <Select
                    className={classes.select}
                    value={newTagCategory}
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
                <Grid item xs={2}>
                  <TextField
                    id="tag-editor-tag-post"
                    placeholder="Post"
                    size="small"
                    onChange={onLinkForNewTagChange}
                    disabled={!DJANGO_CONTEXT.pk}
                  />
                </Grid>
                <Grid item>
                  <Button onClick={createTag} color="primary" disabled={!DJANGO_CONTEXT.pk}>
                    Save Tag
                  </Button>
                </Grid>
              </Grid>
              {filteredTags &&
                filteredTags.map((tag, idx) => {
                  return (
                    <Grid
                      container
                      item
                      className={classes.divContainer}
                      spacing={5}
                      wrap="nowrap"
                      alignItems="flex-end"
                    >
                      <Grid item xs={4}>
                        <TagView
                          key={`tag-item-editor${tag.id}`}
                          tag={tag}
                          selected={isTagSelected(tag)}
                          handleClick={handleTagClick}
                          editable={true}
                          disabled={!DJANGO_CONTEXT.pk}
                          isEdit={true}
                        ></TagView>
                      </Grid>
                      <Grid item xs={1}>
                        <ColorPicker
                          disabled={!DJANGO_CONTEXT.pk}
                          id={`tag-editor-tag-color-edit-${tag.id}`}
                          selectedColor={tag.colour ? tag.colour : DEFAULT_TAG_COLOR}
                          setSelectedColor={value => {
                            onUpdateTag(tag, value, 'colour');
                          }}
                        />
                      </Grid>
                      <Grid item xs={1}>
                        <Select
                          disabled={!DJANGO_CONTEXT.pk}
                          className={classes.select}
                          value={tag.category_id}
                          onChange={event => {
                            onUpdateTag(tag, event.target.value, 'category_id');
                          }}
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
                      <Grid item xs={2}>
                        <TextField
                          disabled={!DJANGO_CONTEXT.pk}
                          id={`tag-editor-tag-post-edit-${tag.id}`}
                          placeholder="Post"
                          size="small"
                          value={tag.discourse_url ? tag.discourse_url : ''}
                          onKeyPress={e => {
                            if (e.key === 'Enter') {
                              onUpdateTag(tag, e.target.value, 'discourse_url');
                            }
                          }}
                        />
                      </Grid>
                      <Grid item>
                        <Grid container item direction="row" alignItems="center">
                          <Tooltip title="Display all in list">
                            <Grid item>
                              <Button
                                variant="outlined"
                                className={classNames(classes.contColButton, {
                                  [classes.contColButtonSelected]: isTagDislayedInList(tag),
                                  [classes.contColButtonHalfSelected]: false
                                })}
                                onClick={() => handleDisplayAllInList(tag)}
                                disabled={false}
                              >
                                Display all in list
                              </Button>
                            </Grid>
                          </Tooltip>
                          {/* <Tooltip title="Display all in 3D">
                            <Grid item>
                              <Button
                                variant="outlined"
                                className={classNames(classes.contColButton, {
                                  [classes.contColButtonSelected]: isTagDisplayedInNGL(tag),
                                  [classes.contColButtonHalfSelected]: false
                                })}
                                onClick={() => {
                                  handleDisplayAllInNGL(tag);
                                }}
                                disabled={false}
                              >
                                V
                              </Button>
                            </Grid>
                          </Tooltip> */}
                          <Tooltip title="Discourse link">
                            <Grid item>
                              <Button
                                variant="outlined"
                                className={classNames(classes.contColButton, {
                                  [classes.contColButtonSelected]: false,
                                  [classes.contColButtonHalfSelected]: false
                                })}
                                onClick={() => {
                                  window.open(tag.discourse_url, '_blank');
                                }}
                                disabled={!tag.discourse_url}
                              >
                                Discourse link
                              </Button>
                            </Grid>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Grid>
                  );
                })}
            </Grid>
          </div>
        </Panel>
      </Popper>
    );
  })
);
