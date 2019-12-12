import React, { useContext } from 'react';
import { Drawer } from '../../common/Navigation/Drawer';
import { makeStyles, Grid, IconButton, Select, MenuItem } from '@material-ui/core';
import TreeView from '@material-ui/lab/TreeView';
import { ChevronRight, ExpandMore, Edit, Visibility, Delete, VisibilityOff } from '@material-ui/icons';
import TreeItem from '@material-ui/lab/TreeItem';
import { useDispatch, useSelector } from 'react-redux';
import { NglContext } from '../../nglView/nglProvider';
import {
  deleteObject,
  removeComponentRepresentation,
  updateComponentRepresentation
} from '../../../reducers/ngl/nglActions';
import { MOL_REPRESENTATION, OBJECT_TYPE, SELECTION_TYPE } from '../../nglView/constants';
import { VIEWS } from '../../../constants/constants';

const useStyles = makeStyles(theme => ({
  root: {
    overflow: 'auto'
  },
  itemRow: {
    height: theme.spacing(3)
  }
}));

export const DisplayControls = ({ open, onClose }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const objectsInView = useSelector(state => state.nglReducers.present.objectsInView) || {};
  const { getNglView } = useContext(NglContext);

  const changeVisibility = (representation, parentKey) => {
    const nglView = getNglView(objectsInView[parentKey].display_div);
    const comp = nglView.stage.getComponentsByName(parentKey).first;
    comp.eachRepresentation(r => {
      if (r.name === representation.id) {
        const newVisibility = !r.getVisibility();
        // update in redux
        representation.params.visible = newVisibility;
        dispatch(updateComponentRepresentation(parentKey, representation.id, representation));
        // update in nglView
        r.setVisibility(newVisibility);
      }
    });
  };
  const changeMolecularRepresentation = (representation, parentKey, e) => {
    const newRepresentation = e.target.value;
    const oldRepresentationId = JSON.parse(JSON.stringify(representation.id));
    const nglView = getNglView(objectsInView[parentKey].display_div);
    const comp = nglView.stage.getComponentsByName(parentKey).first;
    comp.eachRepresentation(r => {
      if (r.name === oldRepresentationId) {
        // update in redux
        representation.id = newRepresentation;
        dispatch(updateComponentRepresentation(parentKey, oldRepresentationId, representation));
        // update in nglView
        r.setSelection(newRepresentation);
      }
    });
  };

  const removeRepresentation = (representation, parentKey) => {
    const nglView = getNglView(objectsInView[parentKey].display_div);
    const comp = nglView.stage.getComponentsByName(parentKey).first;
    let foundedRepresentation = undefined;
    comp.eachRepresentation(r => {
      if (r.name === representation.id) {
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
        dispatch(removeComponentRepresentation(parentKey, representation.id));
      }
    }
  };

  // Removing with Cascade
  const removeMoleculeWithRepresentations = (parentKey, e) => {
    e.stopPropagation();
    const targetObject = objectsInView[parentKey];
    const nglView = getNglView(objectsInView[parentKey].display_div);
    const comp = nglView.stage.getComponentsByName(parentKey).first;
    comp.eachRepresentation(representation => dispatch(removeComponentRepresentation(parentKey, representation.id)));

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
      comp.eachRepresentation(r => {
        if (r.name === representation.id) {
          representation.params.visible = newVisibility;
          // update in nglView
          r.setVisibility(newVisibility);
          // update in redux
          dispatch(updateComponentRepresentation(parentKey, representation.id, representation));
        }
      });
    });
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

  const renderSubtreeItem = (representation, item, index) => (
    <TreeItem
      nodeId={`${objectsInView[item].name}___${index}`}
      key={`${objectsInView[item].name}___${index}`}
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
              value={representation && representation.id}
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
              <IconButton>
                <Edit />
              </IconButton>
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

  return (
    <Drawer title="Display controls" open={open} onClose={onClose}>
      <TreeView className={classes.root} defaultCollapseIcon={<ExpandMore />} defaultExpandIcon={<ChevronRight />}>
        {Object.keys(objectsInView)
          .filter(item => objectsInView[item].display_div === VIEWS.MAJOR_VIEW)
          .map(parentItem => (
            <TreeItem
              nodeId={objectsInView[parentItem].name}
              key={objectsInView[parentItem].name}
              label={
                <Grid container justify="space-between" direction="row" wrap="nowrap" alignItems="center">
                  <Grid item>{objectsInView[parentItem].name}</Grid>
                  <Grid item>
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
                objectsInView[parentItem].representations.map((representation, index) =>
                  renderSubtreeItem(representation, parentItem, index)
                )}
            </TreeItem>
          ))}
      </TreeView>
    </Drawer>
  );
};
