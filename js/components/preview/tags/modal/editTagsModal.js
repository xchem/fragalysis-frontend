import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button, Checkbox, Grid, IconButton, InputLabel, MenuItem, Popper, Select, TextField, Tooltip, makeStyles, withStyles } from "@material-ui/core"
import { Panel } from "../../../common";
import { Close } from "@material-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_CATEGORY, DEFAULT_TAG_COLOR, augumentTagObjectWithId, compareTagsAsc, createMoleculeTagObject, getCategoriesToBeRemovedFromTagDetails, getEditNewTagCategories } from "../utils/tagUtils";
import { ColorPicker } from "../../../common/Components/ColorPicker";
import { DJANGO_CONTEXT } from "../../../../utils/djangoContext";
import { createNewTag, deleteExistingTag } from "../api/tagsApi";
import { appendMoleculeTag, appendTagList, removeFromTagList, setNoTagsReceived, updateMoleculeInMolLists } from "../../../../reducers/api/actions";
import { removeSelectedTag, updateTagProp } from "../redux/dispatchActions";
import { getCategoryById } from "../../molecule/redux/dispatchActions";
import { ToastContext } from "../../../toast";

const useStyles = makeStyles(theme => ({
    leftSide: {
        textAlign: "right",
        paddingRight: 9,
        "& > *": {
            fontWeight: "bold"
        }
    },
    row: {
        padding: 2
    },
    deleteButton: {
        marginRight: 10
    }
}));

const NEW_TAG = { id: -1, tag: '-- new tag --' };

export const EditTagsModal = ({ open, anchorEl, setOpenDialog }) => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const { toastInfo } = useContext(ToastContext);

    const targetName = useSelector(state => state.apiReducers.target_on_name);
    const targetId = useSelector(state => state.apiReducers.target_on);
    const preTagList = useSelector(state => state.apiReducers.tagList);
    const tagCategories = useSelector(state => state.apiReducers.categoryList);
    const allMolList = useSelector(state => state.apiReducers.all_mol_lists);
    const moleculesToEditIds = useSelector(state => state.selectionReducers.moleculesToEdit);

    const id = open ? 'simple-popover-tags-editor' : undefined;
    const [tag, setTag] = useState(null);
    const [tags, setTags] = useState([NEW_TAG]);
    const [newTagColor, setNewTagColor] = useState(DEFAULT_TAG_COLOR);
    const [newTagName, setNewTagName] = useState('');
    const [newTagLink, setNewTagLink] = useState('');
    const [newHidden, setNewHidden] = useState(false);
    const [newTagCategory, setNewTagCategory] = useState(DEFAULT_CATEGORY);

    const getTagLabel = tag => {
        return tag.tag_prefix ? tag.tag_prefix + " - " + tag.tag : tag.tag;
    }

    const getTagCategory = tag => {
        const tagCategory = tagCategories.find(category => category.id === tag?.category);
        return tagCategory?.category || '';
    }

    useEffect(() => {
        const categoriesToRemove = getCategoriesToBeRemovedFromTagDetails(tagCategories);
        const newTagList = preTagList.filter(t => {
            if (t.additional_info?.downloadName || categoriesToRemove.some(c => c.id === t.category)) {
                return false;
            } else {
                return true;
            }
        });
        setTags([NEW_TAG, ...newTagList].sort(compareTagsAsc));
        return () => {
            setTag(null);
            setTags([NEW_TAG]);
        };
    }, [preTagList, tagCategories]);

    useEffect(() => {
        if (tag) {
            setNewTagCategory(tag.category);
            if (tag.colour) {
                setNewTagColor(tag.colour);
            } else {
                const category = dispatch(getCategoryById(tag.category));
                if (category) {
                    setNewTagColor(category.colour ? `#${category.colour}` : DEFAULT_TAG_COLOR);
                } else {
                    setNewTagColor(DEFAULT_TAG_COLOR);
                }
            }
            setNewTagName(tag.tag);
            setNewTagLink(tag.discourse_url);
            setNewHidden(tag.hidden || false);
        }
    }, [dispatch, tag]);

    const comboCategories = useMemo(() => {
        return getEditNewTagCategories(tagCategories);
    }, [tagCategories]);

    const isRestrictedCategory = useMemo(() => {
        return tag && tag.hasOwnProperty('category') ? !comboCategories.some(cc => cc.id === tag.category) : false;
    }, [comboCategories, tag]);

    const compoundsCount = useMemo(() => {
        let count = 0;
        if (tag && tag['site_observations']) {
            let uniqueCompounds = [];
            allMolList.filter(molecule => tag.site_observations.includes(molecule.id)).forEach(observation => {
                // we are looking only for unique cmpd and canon_site_conf combination
                const uniqueString = observation.cmpd + '-' + observation.canon_site_conf;
                if (uniqueCompounds.includes(uniqueString)) {
                    // ignore - this combination exists already
                } else {
                    uniqueCompounds.push(uniqueString);
                }
            });
            count = uniqueCompounds.length;
        }
        return count;
    }, [allMolList, tag]);

    const resetTagToEditState = () => {
        setNewTagCategory(DEFAULT_CATEGORY);
        setNewTagColor(DEFAULT_TAG_COLOR);
        setNewTagName('');
        setNewTagLink('');
        setNewHidden(false);
    };

    const onCategoryForNewTagChange = event => {
        setNewTagCategory(event.target.value);
        // apply also default color for every categpry
        let tagColor = DEFAULT_TAG_COLOR;
        const category = dispatch(getCategoryById(event.target.value));
        if (category) {
            tagColor = `#${category.colour}`;
        }
        setNewTagColor(tagColor);
    };

    const onNameForNewTagChange = event => {
        setNewTagName(event.target.value);
    };

    const onHiddenForNewTagChange = event => {
        setNewHidden(event.target.checked);
    };

    const createTag = () => {
        if (newTagName && newTagCategory) {
            const tagObject = createMoleculeTagObject(
                newTagName,
                targetId,
                newTagCategory,
                DJANGO_CONTEXT.pk,
                newTagColor,
                newTagLink,
                [...moleculesToEditIds],
                new Date(),
                null,
                null,
                newHidden
            );
            createNewTag(tagObject, targetName).then(molTag => {
                let augMolTagObject = augumentTagObjectWithId(
                    {
                        tag: molTag.tag,
                        category: molTag.category,
                        target: molTag.target,
                        user: molTag.user,
                        create_date: molTag.create_date,
                        colour: molTag.colour,
                        discourse_url: molTag.discourse_url,
                        help_text: molTag.help_text,
                        additional_info: molTag.additional_info,
                        mol_group: molTag.mol_group,
                        hidden: molTag.hidden
                    },
                    molTag.id
                );
                dispatch(appendTagList(augMolTagObject));
                dispatch(appendMoleculeTag(molTag));
                dispatch(setNoTagsReceived(false));
                toastInfo('Tag was created', { autoHideDuration: 5000 });
            });
            // reset tag/fields after creating new one
            resetTagToEditState();
        }
    };

    const updateTag = () => {
        if (tag && newTagCategory && newTagName) {
            // update all props at once
            if (newTagCategory) {
                dispatch(
                    updateTagProp(
                        Object.assign({}, tag, {
                            category: newTagCategory,
                            colour: newTagColor,
                            tag: newTagName,
                            discourse_url: newTagLink,
                            hidden: newHidden
                        }),
                        newTagName,
                        'tag'
                    )
                );
            } else {
                dispatch(
                    updateTagProp(
                        Object.assign({}, tag, {
                            colour: newTagColor,
                            tag: newTagName,
                            discourse_url: newTagLink,
                            hidden: newHidden
                        }),
                        newTagName,
                        'tag'
                    )
                );
            }
            toastInfo('Tag was updated', { autoHideDuration: 5000 });
            // reset tag/fields after updating selected one
            resetTagToEditState();
        }
    };

    const deleteTag = () => {
        if (confirm('Do wou want to delete "' + tag.tag + '"?')) {
            dispatch(removeSelectedTag(tag));
            dispatch(removeFromTagList(tag));
            // remove from all molecules
            const molsForTag = allMolList.filter(mol => {
                const tags = mol.tags_set.filter(id => id === tag.id);
                return tags && tags.length ? true : false;
            });
            if (molsForTag && molsForTag.length) {
                molsForTag.forEach(m => {
                    let newMol = { ...m };
                    newMol.tags_set = newMol.tags_set.filter(id => id !== tag.id);
                    dispatch(updateMoleculeInMolLists(newMol));
                });
            }
            deleteExistingTag(tag, tag.id);
            toastInfo('Tag was deleted', { autoHideDuration: 5000 });
            // reset tag/fields after removing selected tag
            resetTagToEditState();
        }
    };

    const handleCloseModal = () => {
        if (open) {
            setOpenDialog(false);
        }
    };

    const leftSide = text => {
        return <Grid item xs={3} className={classes.leftSide}>
            <InputLabel>{text}</InputLabel>
        </Grid>;
    };

    const rightSide = child => {
        return <Grid item xs={9}>
            {child}
        </Grid>;
    };

    const CreateButton = withStyles(theme => ({
        root: {
            color: theme.palette.success.contrastText,
            backgroundColor: theme.palette.success.light,
            '&:hover': {
                backgroundColor: theme.palette.success.main
            }
        }
    }))(Button);

    return <Popper id={id} open={open} anchorEl={anchorEl} placement={"right-start"} >
        <Panel
            title={"Edit tags"}
            hasHeader
            secondaryBackground
            headerActions={[
                <Tooltip title="Close editor">
                    <IconButton
                        color="inherit"
                        // className={classes.headerButton}
                        onClick={handleCloseModal}
                    >
                        <Close />
                    </IconButton>
                </Tooltip>
            ]}
        >
            <Grid container direction="column">
                <Grid item container direction="row" alignItems="center" className={classes.row}>
                    {leftSide('Choose a tag')}
                    {rightSide(
                        <Select
                            value={tag?.id || 0}
                            onChange={(event) => setTag(tags.find(tag => tag.id === event.target.value))}
                            fullWidth
                        >
                            {tags?.map(tag => (
                                <MenuItem key={`tag-editor-new-category-${tag.id}`} value={tag.id}>
                                    {getTagLabel(tag)}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                </Grid>
                <Grid item container direction="row" alignItems="center" className={classes.row}>
                    {leftSide('Category')}
                    {isRestrictedCategory ?
                        rightSide(
                            <TextField
                                disabled={true}
                                value={getTagCategory(tag)}
                            />
                        )
                        :
                        rightSide(
                            <Select
                                // className={classes.select}
                                value={newTagCategory || DEFAULT_CATEGORY}
                                label="Category"
                                onChange={onCategoryForNewTagChange}
                            >
                                {comboCategories?.map(c => (
                                    <MenuItem key={`tag-editor-new-category-${c.id}`} value={c.id}>
                                        {c.category}
                                    </MenuItem>
                                ))}
                            </Select>
                        )

                    }
                </Grid>
                <Grid item container direction="row" alignItems="center" className={classes.row}>
                    {leftSide('Tag prefix')}
                    {rightSide(
                        <Grid item container direction="row" alignItems="center">
                            <Grid item xs>
                                <TextField
                                    disabled={true}
                                    value={tag?.tag_prefix || ""}
                                />
                            </Grid>
                            <Grid item xs className={classes.leftSide}>
                                <InputLabel>Upload name</InputLabel>
                            </Grid>
                            <Grid item xs>
                                <TextField
                                    disabled={true}
                                    value={tag?.upload_name || ""}
                                />
                            </Grid>
                        </Grid>
                    )}
                </Grid>
                <Grid item container direction="row" alignItems="center" className={classes.row}>
                    {leftSide('Display name')}
                    {rightSide(
                        <TextField
                            onChange={onNameForNewTagChange}
                            value={newTagName}
                            placeholder="Name"
                        />
                    )}
                </Grid>
                <Grid item container direction="row" alignItems="center" className={classes.row}>
                    {leftSide('Colour')}
                    {rightSide(
                        <ColorPicker
                            id="tag-editor-tag-color"
                            selectedColor={newTagColor}
                            setSelectedColor={value => {
                                setNewTagColor(value);
                            }}
                            disabled={!DJANGO_CONTEXT.pk}
                        />
                    )}
                </Grid>
                <Grid item container direction="row" alignItems="center" className={classes.row}>
                    {leftSide('Hidden')}
                    {rightSide(
                        <Checkbox
                            color="default"
                            // className = { classes.checkboxHeader }
                            checked={newHidden}
                            onChange={onHiddenForNewTagChange}
                        />
                    )}
                </Grid>
                <Grid item container direction="row" alignItems="center" className={classes.row}>
                    {leftSide('#Compounds')}
                    {rightSide(
                        <TextField
                            disabled={true}
                            value={compoundsCount}
                        />
                    )}
                </Grid>
                <Grid item container direction="row" alignItems="center" className={classes.row}>
                    {leftSide('#Observations')}
                    {rightSide(
                        <TextField
                            disabled={true}
                            value={tag?.site_observations?.length || 0}
                        />
                    )}
                </Grid>
                {/* Buttons */}
                <Grid item container direction="row" alignItems="center" justifyContent="flex-end">
                    {tag && tag.id !== -1 ? ([
                        <Button
                            id="create-tag-button"
                            key="create-tag-button"
                            onClick={() => deleteTag()}
                            color="secondary"
                            variant="contained"
                            disabled={!DJANGO_CONTEXT.pk || isRestrictedCategory}
                            size="small"
                            className={classes.deleteButton}
                        >
                            Delete
                        </Button>,
                        <Button
                            id="update-tag-button"
                            key="update-tag-button"
                            onClick={() => updateTag()}
                            color="primary"
                            variant="contained"
                            disabled={!DJANGO_CONTEXT.pk}
                            size="small"
                        >
                            Save
                        </Button>
                    ]
                    ) : (
                        <CreateButton id="create-tag-button" onClick={() => createTag()} variant="contained" disabled={!DJANGO_CONTEXT.pk} size="small">
                            Create
                        </CreateButton>
                    )}
                </Grid>
            </Grid>
        </Panel>
    </Popper>;
}