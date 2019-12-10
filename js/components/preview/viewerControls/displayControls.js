import React, { Fragment } from 'react';
import { Drawer } from '../../common/Navigation/Drawer';
import { makeStyles, Grid, IconButton } from '@material-ui/core';
import TreeView from '@material-ui/lab/TreeView';
import { ChevronRight, ExpandMore, Edit, Visibility, Delete } from '@material-ui/icons';
import TreeItem from '@material-ui/lab/TreeItem';
import { useSelector } from 'react-redux';

const useStyles = makeStyles(theme => ({
  root: {
    height: 216,
    flexGrow: 1,
    maxWidth: 400
  },
  itemRow: {
    height: theme.spacing(3)
  }
}));

export const DisplayControls = ({ open, onClose }) => {
  const classes = useStyles();
  const objectsInView = useSelector(state => state.nglReducers.present.objectsInView) || {};

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
          <Grid item>{representation.id}</Grid>
          <Grid item container justify="flex-end" direction="row">
            <Grid item>
              <IconButton>
                <Edit />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton>
                <Visibility />
              </IconButton>
            </Grid>
            <Grid item>
              <IconButton>
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
        {Object.keys(objectsInView).map(parentItem => (
          <TreeItem
            nodeId={objectsInView[parentItem].name}
            key={objectsInView[parentItem].name}
            label={objectsInView[parentItem].name}
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
