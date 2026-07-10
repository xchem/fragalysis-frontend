import React, { useContext, memo } from 'react';
import { Drawer } from '../../../common/Navigation/Drawer';
import { GridLegacy as Grid, IconButton, Select } from '@mui/material';
import { makeStyles } from '../../../../ui/styles';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { ChevronRight, ExpandMore, Edit, Visibility, Delete, VisibilityOff, Add } from '@mui/icons-material';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { useDispatch, useSelector } from 'react-redux';
import { NglContext } from '../../../nglView/nglProvider';
import {
  addComponentRepresentation,
  removeComponentRepresentation,
  updateComponentRepresentation,
  updateComponentRepresentationVisibility,
  updateComponentRepresentationVisibilityAll,
  changeComponentRepresentation
} from '../../../../reducers/ngl/actions';
import { deleteObject, checkRemoveFromDensityList } from '../../../../reducers/ngl/dispatchActions';
import { MOL_REPRESENTATION, OBJECT_TYPE, SELECTION_TYPE } from '../../../nglView/constants';
import { VIEWS } from '../../../../constants/constants';
import { EditRepresentationMenu } from './editRepresentationMenu';
import { hideShapeRepresentations } from '../../../nglView/redux/dispatchActions';

const useStyles = makeStyles(theme => ({
  root: {
    overflow: 'auto',
    height: '100%'
  },
  itemRow: {
    height: theme.spacing(3)
  }
}));

export default memo(({ open, onClose }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const objectsInView = useSelector(state => state.nglReducers.objectsInView) || {};
  const { getViewerAdapter } = useContext(NglContext);

  const [editMenuAnchors, setEditMenuAnchors] = React.useState({});

  const openRepresentationEditMenu = (event, key) => {
    setEditMenuAnchors({ ...editMenuAnchors, [key]: event.currentTarget });
  };

  const closeRepresentationEditMenu = key => e => {
    setEditMenuAnchors({ ...editMenuAnchors, [key]: null });
  };

  const changeVisibility = (representation, parentKey) => {
    const viewerAdapter = getViewerAdapter(objectsInView[parentKey].display_div);
    const component = viewerAdapter.getObject(parentKey);
    const representationElement = viewerAdapter.getRepresentation(component, representation);

    if (representationElement) {
      const newVisibility = !viewerAdapter.getVisibility(representationElement);
      representation.params.visible = newVisibility;
      dispatch(updateComponentRepresentation(parentKey, representation.uuid, representation, '', true));
      dispatch(updateComponentRepresentationVisibility(parentKey, representation.uuid, representation, newVisibility));
      viewerAdapter.setVisibility(representationElement, newVisibility);
    }

    hideShapeRepresentations(representationElement, viewerAdapter, parentKey);
  };
  const changeMolecularRepresentation = (representation, parentKey, e) => {
    const newRepresentationType = e.target.value;
    const oldRepresentation = JSON.parse(JSON.stringify(representation));
    const viewerAdapter = getViewerAdapter(objectsInView[parentKey].display_div);
    const component = viewerAdapter.getObject(parentKey);

    // add representation to NGL
    const newRepresentation = viewerAdapter.createRepresentation(
      component,
      newRepresentationType,
      oldRepresentation.params,
      oldRepresentation.lastKnownID
    );
    // add new representation to redux
    dispatch(addComponentRepresentation(parentKey, newRepresentation, true));

    // remove previous representation from NGL
    removeRepresentation(representation, parentKey, true);

    dispatch(changeComponentRepresentation(parentKey, oldRepresentation, newRepresentation));
  };

  const addMolecularRepresentation = (parentKey, e) => {
    e.stopPropagation();
    const viewerAdapter = getViewerAdapter(objectsInView[parentKey].display_div);
    const component = viewerAdapter.getObject(parentKey);

    // add representation to NGL
    const newRepresentation = viewerAdapter.createRepresentation(component, MOL_REPRESENTATION.axes);
    // add new representation to redux
    dispatch(addComponentRepresentation(parentKey, newRepresentation));
  };

  const removeRepresentation = (representation, parentKey, skipTracking) => {
    const viewerAdapter = getViewerAdapter(objectsInView[parentKey].display_div);
    const component = viewerAdapter.getObject(parentKey);
    const foundedRepresentation = viewerAdapter.getRepresentation(component, representation);
    if (foundedRepresentation) {
      // update in nglView
      viewerAdapter.removeRepresentation(component, foundedRepresentation);
      // update in redux
      const targetObject = objectsInView[parentKey];

      if (viewerAdapter.getRepresentationCount(component) === 0) {
        // remove from nglReducer and selectionReducer
        dispatch(deleteObject(targetObject, viewerAdapter, true));
      } else {
        hideShapeRepresentations(foundedRepresentation, viewerAdapter, parentKey);
        dispatch(removeComponentRepresentation(parentKey, representation, skipTracking));
      }
    }
  };

  // Removing with Cascade
  const removeMoleculeWithRepresentations = (parentKey, e) => {
    e.stopPropagation();
    const targetObject = objectsInView[parentKey];
    const viewerAdapter = getViewerAdapter(objectsInView[parentKey].display_div);
    const component = viewerAdapter.getObject(parentKey);
    viewerAdapter
      .getRepresentations(component)
      .forEach(representation => dispatch(removeComponentRepresentation(parentKey, representation, true)));

    let deleteFromSelections =
      targetObject.selectionType !== SELECTION_TYPE.DENSITY ||
      dispatch(checkRemoveFromDensityList(targetObject, objectsInView));

    // remove from nglReducer and selectionReducer
    dispatch(deleteObject(targetObject, viewerAdapter, deleteFromSelections));
  };

  // ChangeVisibility with cascade
  const changeVisibilityMoleculeRepresentations = (parentKey, e) => {
    e.stopPropagation();
    const representations = (objectsInView[parentKey] && objectsInView[parentKey].representations) || [];
    const viewerAdapter = getViewerAdapter(objectsInView[parentKey].display_div);
    const component = viewerAdapter.getObject(parentKey);
    let newVisibility = false;
    representations.forEach((representation, index) => {
      if (index === 0) {
        newVisibility = !representation.params.visible;
      }

      const representationElement = viewerAdapter.getRepresentation(component, representation);
      if (representationElement) {
        representation.params.visible = newVisibility;
        viewerAdapter.setVisibility(representationElement, newVisibility);
        dispatch(updateComponentRepresentation(parentKey, representation.uuid, representation, '', true));
      }

      hideShapeRepresentations(representationElement, viewerAdapter, parentKey);
    });

    dispatch(updateComponentRepresentationVisibilityAll(parentKey, newVisibility));
  };

  const hasAllRepresentationVisibled = parentKey => {
    const representations = (objectsInView[parentKey] && objectsInView[parentKey].representations) || [];
    let countOfNonVisibled = 0;

    representations.forEach(r => {
      if (r.params && r.params.visible === false) {
        countOfNonVisibled++;
      }
    });
    return countOfNonVisibled !== representations.length;
  };

  const renderSubtreeItem = (representation, item, index) => {
    const representationKey = `${objectsInView[item].name}___${index}`;
    return (
      <TreeItem
        itemId={representationKey}
        key={representationKey}
        label={
          <Grid
            container
            justifyContent="space-between"
            direction="row"
            wrap="nowrap"
            alignItems="center"
            className={classes.itemRow}
          >
            <Grid item xs={6}>
              <Select
                native
                value={representation && representation.type}
                onChange={e => changeMolecularRepresentation(representation, item, e)}
              >
                {Object.keys(MOL_REPRESENTATION).map(option => (
                  <option key={MOL_REPRESENTATION[option]} value={MOL_REPRESENTATION[option]}>
                    {MOL_REPRESENTATION[option]}
                  </option>
                ))}
              </Select>
            </Grid>
            <Grid item xs={6} container justifyContent="flex-end" direction="row" wrap="nowrap">
              <Grid item>
                <IconButton onClick={e => openRepresentationEditMenu(e, representationKey)}>
                  <Edit />
                </IconButton>
                <EditRepresentationMenu
                  editMenuAnchor={editMenuAnchors[representationKey]}
                  closeRepresentationEditMenu={closeRepresentationEditMenu(representationKey)}
                  representation={representation}
                  parentKey={item}
                />
              </Grid>
              <Grid item>
                <IconButton onClick={() => changeVisibility(representation, item)}>
                  {representation && representation.params && representation.params.visible === true ? (
                    <Visibility />
                  ) : (
                    <VisibilityOff />
                  )}
                </IconButton>
              </Grid>
              <Grid item>
                <IconButton
                  onClick={() => removeRepresentation(representation, item)}
                  disabled={
                    objectsInView[item].selectionType === SELECTION_TYPE.VECTOR ||
                    objectsInView[item].OBJECT_TYPE === OBJECT_TYPE.PROTEIN
                  }
                >
                  <Delete />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        }
      />
    );
  };

  return (
    <Drawer title="Display controls" open={open} onClose={onClose}>
      <SimpleTreeView
        className={classes.root}
        slots={{ collapseIcon: ExpandMore, expandIcon: ChevronRight }}
      >
        {Object.keys(objectsInView)
          .filter(
            item =>
              objectsInView[item].display_div === VIEWS.MAJOR_VIEW &&
              objectsInView[item].selectionType !== SELECTION_TYPE.VECTOR
          )
          .sort((a, b) => {
            return a.localeCompare(b);
          })
          .map(parentItem => (
            <TreeItem
              itemId={objectsInView[parentItem].name}
              key={objectsInView[parentItem].name}
              label={
                <Grid container justifyContent="space-between" direction="row" wrap="nowrap" alignItems="center">
                  <Grid item>{objectsInView[parentItem].name}</Grid>
                  <Grid item>
                    <IconButton onClick={e => addMolecularRepresentation(parentItem, e)}>
                      <Add />
                    </IconButton>
                    <IconButton onClick={e => changeVisibilityMoleculeRepresentations(parentItem, e)}>
                      {hasAllRepresentationVisibled(parentItem) === true ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                    <IconButton
                      disabled={
                        objectsInView[parentItem].selectionType === SELECTION_TYPE.VECTOR ||
                        objectsInView[parentItem].OBJECT_TYPE === OBJECT_TYPE.PROTEIN
                      }
                      onClick={e => removeMoleculeWithRepresentations(parentItem, e)}
                    >
                      <Delete />
                    </IconButton>
                  </Grid>
                </Grid>
              }
            >
              {objectsInView[parentItem].representations &&
                objectsInView[parentItem].representations
                  .sort((a, b) => (a.lastKnownID > b.lastKnownID ? 1 : -1))
                  .map((representation, index) => renderSubtreeItem(representation, parentItem, index))}
            </TreeItem>
          ))}
      </SimpleTreeView>
    </Drawer>
  );
});
