import React, { forwardRef, memo, useEffect, useState, useRef } from 'react';
import { Grid, Popper, IconButton, makeStyles, FormControlLabel, Switch } from '@material-ui/core';
import { Panel } from '../../../common';
import { Close } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { updateMoleculeInMolLists, updateMoleculeTag, updateTag } from '../../../../reducers/api/actions';
import {
  setMoleculeForTagEdit,
  setIsTagGlobalEdit,
  setAssignTagView
} from '../../../../reducers/selection/actions';
import { updateExistingTag } from '../api/tagsApi';
import { DJANGO_CONTEXT } from '../../../../utils/djangoContext';
import {
  compareTagsAsc,
  augumentTagObjectWithId,
  createMoleculeTagObject,
  getMoleculeTagForTag,
  DEFAULT_TAG_COLOR
} from '../utils/tagUtils';
import TagCategory from '../tagCategory';
import { TaggingInProgressModal } from './taggingInProgressModal';
import { withStyles } from '@material-ui/core/styles';
import { blue } from '@material-ui/core/colors';
import { getCategoryById } from '../../molecule/redux/dispatchActions';
import RichTooltip from '../../../tooltip/RichTooltip';

const useStyles = makeStyles(theme => ({
  paper: {
    maxHeight: 343,
    height: 'auto',
    overflowY: 'auto'
  },
  content: {
    overflowY: 'auto',
    overflowX: 'hidden',
    height: 'auto',
    maxHeight: 300
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
    '&:disabled': {
      borderRadius: 0,
      borderColor: 'white'
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.light
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
  },
  search: {
    margin: theme.spacing(1),
    width: 116,
    '& .MuiInputBase-root': {
      color: 'inherit'
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: 'inherit'
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: 'inherit'
    }
  },
  tagModeSwitch: {
    width: 32, // Should be adjusted if a label for the switch changes
    marginRight: '100px',
    marginLeft: '1px'
  }
}));

const TagEditorComponent = (
  {
    open = false,
    anchorEl,
    setOpenDialog,
    closeDisabled,
    compounds = [],
    molForTagEditId = [],
    moleculesToEditIds = [],
    isGlobalEdit = false,
    metaCategory = null,
    getMoleculeForId = () => null,
    updateCompound = () => {},
    updateMoleculeInObservations = () => {},
    resetTagEditorSide = () => {}
  },
  tagEditorRef
) => {
    const id = open ? 'simple-popover-mols-tag-editor' : undefined;
    const classes = useStyles();
    const dispatch = useDispatch();
    const refForOutsideClick = useRef(null);
    let moleculeTags = useSelector(state => state.apiReducers.moleculeTags);
    const targetId = useSelector(state => state.apiReducers.target_on);

    const [taggingInProgress, setTaggingInProgress] = useState(false);
    const [isError, setIsError] = useState(false);
    const [molsLeftForTagging, setMolsLeftForTagging] = useState(0);

    let selectedMoleculeIds = [];
    if ((moleculesToEditIds || []).length === 0 || !isGlobalEdit) {
      selectedMoleculeIds.push(...(molForTagEditId || []));
    } else {
      selectedMoleculeIds = [...moleculesToEditIds];
    }

    const moleculesToEdit = selectedMoleculeIds.map(id => getMoleculeForId(id)).filter(Boolean);
    let poses = [];
    moleculesToEdit?.forEach(m => {
      const pose = compounds.find(p => p.site_observations?.includes(m?.id));
      if (pose && !poses.find(p => p.id === pose.id)) {
        poses.push(pose);
      }
    });
    moleculeTags = [...moleculeTags].sort(compareTagsAsc);
    const assignTagEditorOpen = useSelector(state => state.selectionReducers.tagEditorOpened);

    const assignTagView = useSelector(state => state.selectionReducers.assignTagView);

    useEffect(() => {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    });

    const handleOutsideClick = e => {
      if (refForOutsideClick.current && !refForOutsideClick.current.contains(e.target)) {
        assignTagEditorOpen === true ? (dispatch(setOpenDialog(false)), dispatch(setMoleculeForTagEdit([]))) : '';
      }
    };

    const handleCloseModal = () => {
      if (open) {
        dispatch(setAssignTagView(false));
        dispatch(setOpenDialog(false));
        dispatch(setMoleculeForTagEdit([]));
        dispatch(setIsTagGlobalEdit(false));
        resetTagEditorSide();
      }
    };

    const updateCmp = (cmp, obs) => {
      if (!obs || !Array.isArray(cmp?.associatedObs)) {
        return;
      }

      let newCmp = { ...cmp, associatedObs: [...cmp.associatedObs] };
      const index = newCmp.associatedObs.findIndex(o => o.id === obs.id);
      if (index >= 0) {
        newCmp.associatedObs[index] = obs;
        updateCompound(newCmp);
      }
    };

    const handleTagClick = async (selected, tag) => {
      try {
        setTaggingInProgress(true);

        let tagColor = DEFAULT_TAG_COLOR;
        if (tag.colour && tag.colour !== '') {
          tagColor = tag.colour;
        } else {
          const tagCategory = dispatch(getCategoryById(tag.category));
          if (tagCategory) {
            tagColor = `#${tagCategory.colour}`;
          }
        }

        let molTagObjects = [];
        if (selected) {
          moleculesToEdit.forEach(m => {
            let newMol = { ...m };
            newMol.tags_set = (newMol.tags_set || []).filter(id => id !== tag.id);
            const pose = poses.find(p => p.site_observations.includes(m.id));
            updateCmp(pose, newMol);
            dispatch(updateMoleculeInMolLists(newMol));
            updateMoleculeInObservations(newMol);
            const moleculeTag = getMoleculeTagForTag(moleculeTags, tag.id);

            let mtObject = molTagObjects.find(mto => mto.tag === tag.tag);
            if (mtObject) {
              mtObject.site_observations = mtObject.site_observations.filter(id => id !== m.id);
            } else {
              let newMolList = [...moleculeTag.site_observations];
              newMolList = newMolList.filter(id => id !== m.id);
              mtObject = createMoleculeTagObject(
                tag.tag,
                targetId,
                tag.category,
                DJANGO_CONTEXT.pk,
                tagColor,
                tag.discourse_url,
                newMolList,
                tag.create_date,
                tag.additional_info,
                tag.mol_group,
                tag.hidden,
                tag.tag_prefix,
                tag.upload_name,
                tag.meta_category
              );
              molTagObjects.push(mtObject);
            }
          });
        } else {
          moleculesToEdit.forEach(m => {
            if (!(m.tags_set || []).some(id => id === tag.id)) {
              let newMol = { ...m };
              newMol.tags_set = [...(newMol.tags_set || []), tag.id];
              const pose = poses.find(p => p.site_observations.includes(m.id));
              updateCmp(pose, newMol);
              dispatch(updateMoleculeInMolLists(newMol));
              updateMoleculeInObservations(newMol);
              const moleculeTag = getMoleculeTagForTag(moleculeTags, tag.id);
              let mtObject = molTagObjects.find(mto => mto.tag === tag.tag);
              if (mtObject) {
                mtObject.site_observations.push(newMol.id);
              } else {
                mtObject = createMoleculeTagObject(
                  tag.tag,
                  targetId,
                  tag.category,
                  DJANGO_CONTEXT.pk,
                  tagColor,
                  tag.discourse_url,
                  [...moleculeTag.site_observations, newMol.id],
                  tag.create_date,
                  tag.additional_info,
                  tag.mol_group,
                  tag.hidden,
                  tag.tag_prefix,
                  tag.upload_name,
                  tag.meta_category
                );
                molTagObjects.push(mtObject);
              }
            }
          });
        }
        if (molTagObjects) {
          let molsLeft = molTagObjects.length;
          setMolsLeftForTagging(molsLeft);
          for (const mto of molTagObjects) {
            let molTagObject = { ...mto };
            let augMolTagObject = augumentTagObjectWithId(molTagObject, tag.id);
            await updateExistingTag(molTagObject, tag.id);
            dispatch(updateMoleculeTag(augMolTagObject));
            dispatch(updateTag(augMolTagObject));
            molsLeft = molsLeft - 1;
            setMolsLeftForTagging(molsLeft);
          }
        }
      } catch (e) {
        console.log(e);
        setIsError(true);
        //dispatch(setIsErrorDuringTagging(true));
      } finally {
        setTaggingInProgress(false);
      }
    };

    const handleTagginInProgressClose = () => {
      setIsError(false);
      setTaggingInProgress(false);
    };

    const viewModeSwitched = () => {
      dispatch(setAssignTagView(!assignTagView));
    };

    const TagModeSwitch = withStyles({
      switchBase: {
        color: blue[300],
        '&$checked': {
          color: blue[500]
        },
        '&$checked + $track': {
          backgroundColor: blue[500]
        }
      },
      checked: {},
      track: {}
    })(Switch);

    return (
      <Popper id={id} open={open} anchorEl={anchorEl} placement="right-start" ref={tagEditorRef}>
        <Panel
          ref={refForOutsideClick}
          hasHeader
          secondaryBackground
          title="Assign tags"
          className={classes.paper}
          style={{ width: assignTagView ? '240px' : '310px' }}
          headerActions={[
            <RichTooltip
              absolutePath
              path={
                assignTagView ? 'fragalysis.components.tagEditor.showGrid' : 'fragalysis.components.tagEditor.showList'
              }
              style={{ paddingRight: assignTagView ? '40px' : '110px' }}
            >
              <FormControlLabel
                className={classes.tagModeSwitch}
                classes={{ label: classes.tagLabel }}
                control={
                  <TagModeSwitch
                    checked={assignTagView}
                    onChange={viewModeSwitched}
                    name="tag-filtering-mode"
                    size="small"
                  />
                }
                label={assignTagView ? 'List' : 'Grid'}
              />
            </RichTooltip>,
            <RichTooltip absolutePath path="fragalysis.components.tagEditor.close">
              <IconButton
                color="inherit"
                className={classes.headerButton}
                onClick={handleCloseModal}
                disabled={closeDisabled}
              >
                <Close />
              </IconButton>
            </RichTooltip>
          ]}
        >
          <TaggingInProgressModal
            open={taggingInProgress}
            isError={isError}
            handleClose={handleTagginInProgressClose}
            molsLeft={molsLeftForTagging}
          />
          <Grid className={classes.content}>
            <TagCategory tagClickCallback={handleTagClick} disabled={!DJANGO_CONTEXT.pk} metaCategory={metaCategory} />
          </Grid>
        </Panel>
      </Popper>
    );
};

export const TagEditor = memo(forwardRef(TagEditorComponent));
