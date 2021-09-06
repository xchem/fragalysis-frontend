import React, { forwardRef, memo, useState, useCallback, useContext } from 'react';
import {
  Grid,
  Popper,
  IconButton,
  Typography,
  InputAdornment,
  TextField,
  Tooltip,
  makeStyles,
  Button,
  useTheme,
  Select,
  MenuItem
} from '@material-ui/core';
import { Panel } from '../../../common';
import { ColorPicker } from '../../../common/Components/ColorPicker';
import { Close, Satellite, Search } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from 'lodash';
import classNames from 'classnames';
import TagView from '../tagView';
import { updateMoleculeInMolLists } from '../../../../reducers/api/actions';
import { displayAllMolsInNGL, hideAllMolsInNGL, displayInListForTag, hideInListForTag } from '../redux/dispatchActions';
import { NglContext } from '../../../nglView/nglProvider';
import { VIEWS, CATEGORY_TYPE, CATEGORY_ID } from '../../../../constants/constants';
import { appendTagList, updateTag } from '../../../../reducers/selection/actions';
import { createNewTag } from '../api/tagsApi';
import { DJANGO_CONTEXT } from '../../../../utils/djangoContext';

const useStyles = makeStyles(theme => ({
  paper: {
    width: 700,
    height: 294,
    overflowY: 'hidden'
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
    paddingTop: theme.spacing(1) / 2
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
  forwardRef(({ open = false, anchorEl, mol, setOpenDialog }, ref) => {
    const id = open ? 'simple-popover-mols-tag-editor' : undefined;
    const classes = useStyles();
    const theme = useTheme();
    const dispatch = useDispatch();
    const [searchString, setSearchString] = useState(null);
    const [newTagCategory, setNewTagCategory] = useState(1);
    const [newTagColor, setNewTagColor] = useState(theme.palette.primary.main);
    const [newTagName, setNewTagName] = useState(null);
    const [newTagLink, setNewTagLink] = useState(null);
    const tagList = useSelector(state => state.selectionReducers.tagList);
    const displayAllInNGLList = useSelector(state => state.selectionReducers.displayAllInNGLList);
    const displayAllInList = useSelector(state => state.selectionReducers.listAllList);
    const { getNglView } = useContext(NglContext);
    const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

    const handleCloseModal = () => {
      dispatch(setOpenDialog(false));
    };

    const getAllTagsForMol = useCallback(() => {
      const result = [];
      mol.tags_set &&
        mol.tags_set.forEach(tagId => {
          let tag = tagList.filter(t => t.id === tagId);
          if (tag && tag.length > 0) {
            result.push(tag[0]);
          }
        });
      return result;
    }, [mol, tagList]);

    let tagsForMolecule = getAllTagsForMol();

    const isTagSelected = tag => {
      return tagsForMolecule && tagsForMolecule.some(t => t.id === tag.id);
    };

    const handleTagClick = (selected, tag, allTags) => {
      if (selected) {
        let newMol = { ...mol };
        newMol.tags_set = newMol.tags_set.filter(id => id !== tag.id);
        dispatch(updateMoleculeInMolLists(newMol));
      } else {
        if (!mol.tags_set.some(id => id === tag.id)) {
          let newMol = { ...mol };
          newMol.tags_set.push(tag.id);
          dispatch(updateMoleculeInMolLists(newMol));
        }
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
        dispatch(appendTagList(newTag));
        dispatch(
          createNewTag(newTagName, mol.id, mol.target, newTagCategory, DJANGO_CONTEXT.username, newTagColor, newTagLink)
        );
        // handleTagClick(false, newTag);
      }
    };

    const onUpdateTag = (tag, value, prop) => {
      if (value) {
        const newTag = { ...tag };
        newTag[prop] = value;
        dispatch(updateTag(newTag));
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
          <Grid container direction="column" spacing={1}>
            <Grid container item className={classes.divContainer} spacing={1} alignItems="flex-end" xs={12}>
              <Grid item xs={4}>
                <TextField
                  id="tag-editor-tag-name"
                  placeholder="Name"
                  size="small"
                  onChange={onNameForNewTagChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={1}>
                <ColorPicker
                  id="tag-editor-tag-color"
                  selectedColor={newTagColor}
                  setSelectedColor={value => {
                    setNewTagColor(value);
                  }}
                />
              </Grid>
              <Grid item xs={1}>
                <Select className={classes.select} value={newTagCategory} onChange={onCategoryForNewTagChange}>
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
                <TextField id="tag-editor-tag-post" placeholder="Post" size="small" onChange={onLinkForNewTagChange} />
              </Grid>
              <Grid item>
                <Button onClick={createTag} color="primary">
                  Save Tag
                </Button>
              </Grid>
            </Grid>
            {filteredTags &&
              filteredTags.map((tag, idx) => {
                return (
                  <Grid container item className={classes.divContainer} spacing={1} wrap="nowrap" xs={12}>
                    <Grid item xs={8}>
                      <Grid container xs={12} alignItems="flex-end" className={classes.divContainer} spacing={1}>
                        <Grid item xs={3}>
                          <TagView
                            key={`tag-item-editor${tag.id}`}
                            tag={tag}
                            selected={isTagSelected(tag)}
                            handleClick={handleTagClick}
                          ></TagView>
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            id={`tag-editor-tag-name-edit-${tag.id}`}
                            placeholder="Name"
                            size="small"
                            onChange={event => {
                              onUpdateTag(tag, event.target.value, 'tag');
                            }}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <ColorPicker
                            id={`tag-editor-tag-color-edit-${tag.id}`}
                            selectedColor={newTagColor}
                            setSelectedColor={value => {
                              onUpdateTag(tag, value, 'colour');
                            }}
                          />
                        </Grid>
                        <Grid item xs={1}>
                          <Select
                            className={classes.select}
                            value={newTagCategory}
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
                        <Grid item xs={3}>
                          <TextField
                            id={`tag-editor-tag-post-edit-${tag.id}`}
                            placeholder="Post"
                            size="small"
                            onChange={event => {
                              onUpdateTag(tag, event.target.value, 'discourse_url');
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={4}>
                      <Grid container item direction="row" spacing={0} alignItems="center">
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
                              A
                            </Button>
                          </Grid>
                        </Tooltip>
                        <Tooltip title="Display all in 3D">
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
                        </Tooltip>
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
                              D
                            </Button>
                          </Grid>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>
                );
              })}
          </Grid>
        </Panel>
      </Popper>
    );
  })
);
