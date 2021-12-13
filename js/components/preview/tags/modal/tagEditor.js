import React, { forwardRef, memo } from 'react';
import {
  Grid,
  Popper,
  IconButton,
  Tooltip,
  makeStyles
} from '@material-ui/core';
import { Panel } from '../../../common';
import { Close } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import { updateMoleculeInMolLists, updateMoleculeTag } from '../../../../reducers/api/actions';
import {
  getMoleculeForId
} from '../redux/dispatchActions';
import { setMoleculeForTagEdit, setIsTagGlobalEdit } from '../../../../reducers/selection/actions';
import { updateExistingTag } from '../api/tagsApi';
import { DJANGO_CONTEXT } from '../../../../utils/djangoContext';
import {
  compareTagsAsc,
  augumentTagObjectWithId,
  createMoleculeTagObject,
  getMoleculeTagForTag
} from '../utils/tagUtils';
import TagCategory from '../tagCategory';

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
  }
}));

export const TagEditor = memo(
  forwardRef(({ open = false, anchorEl, setOpenDialog }, ref) => {
    const id = open ? 'simple-popover-mols-tag-editor' : undefined;
    const classes = useStyles();
    const dispatch = useDispatch();
    let moleculeTags = useSelector(state => state.apiReducers.moleculeTags);
    const isTagGlobalEdit = useSelector(state => state.selectionReducers.isGlobalEdit);
    const molId = useSelector(state => state.selectionReducers.molForTagEdit);
    let moleculesToEditIds = useSelector(state => state.selectionReducers.moleculesToEdit);
    if (!isTagGlobalEdit) {
      moleculesToEditIds = [];
      moleculesToEditIds.push(molId);
    }
    const moleculesToEdit = moleculesToEditIds.map(id => dispatch(getMoleculeForId(id)));

    moleculeTags = moleculeTags.sort(compareTagsAsc);

    const handleCloseModal = () => {
      if (open) {
        dispatch(setOpenDialog(false));
        dispatch(setMoleculeForTagEdit(null));
        dispatch(setIsTagGlobalEdit(false));
      }
    };

    const handleTagClick = (selected, tag) => {
      let molTagObjects = [];
      if (selected) {
        moleculesToEdit.forEach(m => {
          let newMol = { ...m };
          newMol.tags_set = newMol.tags_set.filter(id => id !== tag.id);
          dispatch(updateMoleculeInMolLists(newMol));
          const moleculeTag = getMoleculeTagForTag(moleculeTags, tag.id);
          let newMolList = [...moleculeTag.molecules];
          newMolList = newMolList.filter(id => id !== m.id);
          const mtObject = createMoleculeTagObject(
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
          molTagObjects.push(mtObject);
        });
      } else {
        moleculesToEdit.forEach(m => {
          if (!m.tags_set.some(id => id === tag.id)) {
            let newMol = { ...m };
            newMol.tags_set.push(tag.id);
            dispatch(updateMoleculeInMolLists(newMol));
            const moleculeTag = getMoleculeTagForTag(moleculeTags, tag.id);
            const mtObject = createMoleculeTagObject(
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
            molTagObjects.push(mtObject);
          }
        });
      }
      if (molTagObjects) {
        molTagObjects.forEach(mto => {
          let molTagObject = { ...mto };
          let augMolTagObject = augumentTagObjectWithId(molTagObject, tag.id);
          dispatch(updateMoleculeTag(augMolTagObject));
          updateExistingTag(molTagObject, tag.id);
        });
      }
    };

    return (
      <Popper id={id} open={open} anchorEl={anchorEl} placement="left-start" ref={ref}>
        <Panel
          hasHeader
          secondaryBackground
          title="Assign tags"
          className={classes.paper}
          headerActions={[
            <Tooltip title="Close editor">
              <IconButton color="inherit" className={classes.headerButton} onClick={handleCloseModal}>
                <Close />
              </IconButton>
            </Tooltip>
          ]}
        >
          <Grid>
            <TagCategory tagClickCallback={handleTagClick} />
          </Grid>
        </Panel>
      </Popper>
    );
  })
);
