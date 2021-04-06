import React, { useContext, memo } from 'react';
import { Drawer } from '../../../common/Navigation/Drawer';
import { makeStyles, Grid, IconButton, Select } from '@material-ui/core';
import TreeView from '@material-ui/lab/TreeView';
import { ChevronRight, ExpandMore, Edit, Visibility, Delete, VisibilityOff, Add } from '@material-ui/icons';
import TreeItem from '@material-ui/lab/TreeItem';
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
import { deleteObject } from '../../../../reducers/ngl/dispatchActions';
import { MOL_REPRESENTATION, OBJECT_TYPE, SELECTION_TYPE } from '../../../nglView/constants';
import { VIEWS } from '../../../../constants/constants';
import { assignRepresentationToComp } from '../../../nglView/generatingObjects';
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
  const { getNglView } = useContext(NglContext);

  const [editMenuAnchors, setEditMenuAnchors] = React.useState({});

  const openRepresentationEditMenu = (event, key) => {
    setEditMenuAnchors({ ...editMenuAnchors, [key]: event.currentTarget });
  };

  const closeRepresentationEditMenu = key => e => {
    setEditMenuAnchors({ ...editMenuAnchors, [key]: null });
  };

  const changeVisibility = (representation, parentKey) => {
    const nglView = getNglView(objectsInView[parentKey].display_div);
    const comp = nglView.stage.getComponentsByName(parentKey).first;
    let representationElement = null;

    comp.eachRepresentation(r => {
      if (r.uuid === representation.uuid || r.uuid === representation.lastKnownID) {
        representationElement = r;
        const newVisibility = !r.getVisibility();
        // update in redux
        representation.params.visible = newVisibility;
        dispatch(updateComponentRepresentation(parentKey, representation.uuid, representation, '', true));
        dispatch(
          updateComponentRepresentationVisibility(parentKey, representation.uuid, representation, newVisibility)
        );
        // update in nglView
        r.setVisibility(newVisibility);
      }
    });

    hideShapeRepresentations(representationElement, nglView, parentKey);
  };
  const changeMolecularRepresentation = (representation, parentKey, e) => {
    const newRepresentationType = e.target.value;
    const oldRepresentation = JSON.parse(JSON.stringify(representation));
    const nglView = getNglView(objectsInView[parentKey].display_div);
    const comp = nglView.stage.getComponentsByName(parentKey).first;

    // add representation to NGL
    const newRepresentation = assignRepresentationToComp(
      newRepresentationType,
      oldRepresentation.params,
      comp,
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
    const nglView = getNglView(objectsInView[parentKey].display_div);
    const comp = nglView.stage.getComponentsByName(parentKey).first;

    // add representation to NGL
    const newRepresentation = assignRepresentationToComp(MOL_REPRESENTATION.axes, undefined, comp);
    // add new representation to redux
    dispatch(addComponentRepresentation(parentKey, newRepresentation));
  };

  const removeRepresentation = (representation, parentKey, skipTracking) => {
    const nglView = getNglView(objectsInView[parentKey].display_div);
    const comp = nglView.stage.getComponentsByName(parentKey).first;
    let foundedRepresentation = undefined;
    comp.eachRepresentation(r => {
      if (r.uuid === representation.uuid || r.uuid === representation.lastKnownID) {
        foundedRepresentation = r;
      }
    });
    if (foundedRepresentation) {
      // update in nglView
      comp.removeRepresentation(foundedRepresentation);
      // update in redux
      const targetObject = objectsInView[parentKey];

      if (comp.reprList.length === 0) {
        // remove from nglReducer and selectionReducer
        dispatch(deleteObject(targetObject, nglView.stage, true));
      } else {
        hideShapeRepresentations(foundedRepresentation, nglView, parentKey);
        dispatch(removeComponentRepresentation(parentKey, representation, skipTracking));
      }
    }
  };

  // Removing with Cascade
  const removeMoleculeWithRepresentations = (parentKey, e) => {
    e.stopPropagation();
    const targetObject = objectsInView[parentKey];
    const nglView = getNglView(objectsInView[parentKey].display_div);
    const comp = nglView.stage.getComponentsByName(parentKey).first;
    comp.eachRepresentation(representation => dispatch(removeComponentRepresentation(parentKey, representation, true)));

    // remove from nglReducer and selectionReducer
    dispatch(deleteObject(targetObject, nglView.stage, true));
  };

  // ChangeVisibility with cascade
  const changeVisibilityMoleculeRepresentations = (parentKey, e) => {
    e.stopPropagation();
    const representations = (objectsInView[parentKey] && objectsInView[parentKey].representations) || [];
    const nglView = getNglView(objectsInView[parentKey].display_div);
    const comp = nglView.stage.getComponentsByName(parentKey).first;
    let newVisibility = false;
    representations.forEach((representation, index) => {
      if (index === 0) {
        newVisibility = !representation.params.visible;
      }

      let representationElement = null;
      comp.eachRepresentation(r => {
        if (r.uuid === representation.uuid || r.uuid === representation.lastKnownID) {
          representationElement = r;
          representation.params.visible = newVisibility;
          // update in nglView
          r.setVisibility(newVisibility);
          // update in redux
          dispatch(updateComponentRepresentation(parentKey, representation.uuid, representation, '', true));
        }
      });

      hideShapeRepresentations(representationElement, nglView, parentKey);
    });

    dispatch(updateComponentRepresentationVisibilityAll(parentKey, newVisibility));
  };

  const hasAllRepresentationVisibled = parentKey => {
    const representations = (objectsInView[parentKey] && objectsInView[parentKey].representations) || [];
    let countOfNonVisibled = 0;

    representations.forEach(r => {
      if (r.params.visible === false) {
        countOfNonVisibled++;
      }
    });
    return countOfNonVisibled !== representations.length;
  };

  const renderSubtreeItem = (representation, item, index) => {
    const representationKey = `${objectsInView[item].name}___${index}`;
    return (
      <TreeItem
        nodeId={representationKey}
        key={representationKey}
        label={
          <Grid
            container
            justify="space-between"
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
            <Grid item xs={6} container justify="flex-end" direction="row">
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
      <TreeView className={classes.root} defaultCollapseIcon={<ExpandMore />} defaultExpandIcon={<ChevronRight />}>
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
              nodeId={objectsInView[parentItem].name}
              key={objectsInView[parentItem].name}
              label={
                <Grid container justify="space-between" direction="row" wrap="nowrap" alignItems="center">
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
      </TreeView>
    </Drawer>
  );
});
