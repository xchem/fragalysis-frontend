import React, { useContext } from 'react';
import { Drawer } from '../../common/Navigation/Drawer';
import { makeStyles, Grid, IconButton } from '@material-ui/core';
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
import { OBJECT_TYPE, SELECTION_TYPE } from '../../nglView/constants';
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
          <Grid item>{representation && representation.id}</Grid>
          <Grid item container justify="flex-end" direction="row">
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
                  objectsInView[item].selectionType === SELECTION_TYPE.VECTOR || objectsInView[item].OBJECT_TYPE.PROTEIN
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
                    <IconButton
                      disabled={
                        objectsInView[parentItem].selectionType === SELECTION_TYPE.VECTOR ||
                        objectsInView[parentItem].OBJECT_TYPE.PROTEIN
                      }
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
