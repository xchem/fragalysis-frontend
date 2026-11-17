import React, { createContext, useContext, useMemo, memo } from 'react';
import { Drawer } from '../../../common/Navigation/Drawer';
import { GridLegacy as Grid, IconButton, Select } from '@mui/material';
import { makeStyles } from '../../../../ui/styles';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { createDisplayTreeModel, sameDisplayTreeItemProps } from './treeModel';
import { useVisibleControls } from './useVisibleControls';
import { ChevronRight, ExpandMore, Edit, Visibility, Delete, VisibilityOff, Add } from '@mui/icons-material';
import { useDispatch, useSelector, useStore } from 'react-redux';
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
import { EditRepresentationMenu } from './editRepresentationMenu';
import { hideShapeRepresentations } from '../../../nglView/redux/dispatchActions';

const useStyles = makeStyles(theme => ({
  root: {
    overflow: 'auto',
    height: '100%'
  },
  itemRow: {
    height: theme.spacing(3)
  },
  objectPlaceholder: {
    height: `calc(${theme.typography.pxToRem(24)} + ${theme.spacing(3)})`,
    display: 'flex',
    alignItems: 'center'
  }
}));
const treeSlots = {
  collapseIcon: ExpandMore,
  expandIcon: ChevronRight,
  item: memo(TreeItem, sameDisplayTreeItemProps)
};
const TreeControlsContext = createContext();
const treeSlotProps = { item: ({ itemId }) => ({ label: <DisplayTreeLabel itemId={itemId} /> }) };

const DisplayTreeLabel = memo(({ itemId }) => {
  const { models, actions, controlsVisible, editMenuAnchors } = useContext(TreeControlsContext);
  const model = models.get(itemId);
  const object = useSelector(
    state => model && state.nglReducers.objectsInView[model.parentKey],
    (previous, next) => !controlsVisible || previous === next
  );
  if (!model || !object) return null;
  return (
    <DisplayTreeControls model={model} object={object} actions={actions} editMenuAnchor={editMenuAnchors[itemId]} />
  );
});

const DisplayTreeControls = memo(({ model, object, actions, editMenuAnchor }) => {
  const classes = useStyles();
  const { ref, ready } = useVisibleControls();
  const representation =
    model.representation &&
    [...(object.representations || [])].sort((a, b) => (a.lastKnownID > b.lastKnownID ? 1 : -1))[
      model.representationIndex
    ];
  if (model.representation && !representation) return null;
  if (!ready)
    return (
      <div ref={ref} className={representation ? classes.itemRow : classes.objectPlaceholder}>
        {representation ? representation.type : object.name}
      </div>
    );
  return representation ? (
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
          onChange={e => actions.changeMolecularRepresentation(representation, model.parentKey, e)}
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
          <IconButton onClick={e => actions.openRepresentationEditMenu(e, model.id)}>
            <Edit />
          </IconButton>
          <EditRepresentationMenu
            editMenuAnchor={editMenuAnchor}
            closeRepresentationEditMenu={actions.closeRepresentationEditMenu(model.id)}
            representation={representation}
            parentKey={model.parentKey}
          />
        </Grid>
        <Grid item>
          <IconButton onClick={() => actions.changeVisibility(representation, model.parentKey)}>
            {representation && representation.params && representation.params.visible === true ? (
              <Visibility />
            ) : (
              <VisibilityOff />
            )}
          </IconButton>
        </Grid>
        <Grid item>
          <IconButton
            onClick={() => actions.removeRepresentation(representation, model.parentKey)}
            disabled={object.selectionType === SELECTION_TYPE.VECTOR || object.OBJECT_TYPE === OBJECT_TYPE.PROTEIN}
          >
            <Delete />
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  ) : (
    <Grid container justifyContent="space-between" direction="row" wrap="nowrap" alignItems="center">
      <Grid item>{object.name}</Grid>
      <Grid item>
        <IconButton onClick={e => actions.addMolecularRepresentation(model.parentKey, e)}>
          <Add />
        </IconButton>
        <IconButton onClick={e => actions.changeVisibilityMoleculeRepresentations(model.parentKey, e)}>
          {actions.hasAllRepresentationVisibled(model.parentKey) === true ? <Visibility /> : <VisibilityOff />}
        </IconButton>
        <IconButton
          disabled={object.selectionType === SELECTION_TYPE.VECTOR || object.OBJECT_TYPE === OBJECT_TYPE.PROTEIN}
          onClick={e => actions.removeMoleculeWithRepresentations(model.parentKey, e)}
        >
          <Delete />
        </IconButton>
      </Grid>
    </Grid>
  );
});

export default memo(({ open, onClose }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const store = useStore();
  const { getViewerAdapter } = useContext(NglContext);

  const [editMenuAnchors, setEditMenuAnchors] = React.useState({});
  const controlsVisible = open || Object.values(editMenuAnchors).some(Boolean);
  // Keep the mounted tree/editor state while closed. Rebase on the latest objects
  // when reopened instead of rebuilding a hidden tree for every bulk completion.
  const objectsInView =
    useSelector(
      state => state.nglReducers.objectsInView,
      (previous, next) => !controlsVisible || previous === next
    ) || {};

  const actions = useMemo(() => {
    const openRepresentationEditMenu = (event, key) => {
      const anchor = event.currentTarget;
      setEditMenuAnchors(anchors => ({ ...anchors, [key]: anchor }));
    };
    const closeRepresentationEditMenu = key => () => {
      setEditMenuAnchors(anchors => ({ ...anchors, [key]: null }));
    };

    const changeVisibility = (representation, parentKey) => {
      const objectsInView = store.getState().nglReducers.objectsInView;
      const viewerAdapter = getViewerAdapter(objectsInView[parentKey].display_div);
      const component = viewerAdapter.getObject(parentKey);
      const representationElement = viewerAdapter.getRepresentation(component, representation);

      if (representationElement) {
        const newVisibility = !viewerAdapter.getVisibility(representationElement);
        representation.params.visible = newVisibility;
        dispatch(updateComponentRepresentation(parentKey, representation.uuid, representation, '', true));
        dispatch(
          updateComponentRepresentationVisibility(parentKey, representation.uuid, representation, newVisibility)
        );
        viewerAdapter.setVisibility(representationElement, newVisibility);
      }

      hideShapeRepresentations(representationElement, viewerAdapter, parentKey);
    };
    const changeMolecularRepresentation = async (representation, parentKey, e) => {
      const objectsInView = store.getState().nglReducers.objectsInView;
      const newRepresentationType = e.target.value;
      const oldRepresentation = JSON.parse(JSON.stringify(representation));
      const viewerAdapter = getViewerAdapter(objectsInView[parentKey].display_div);
      const component = viewerAdapter.getObject(parentKey);

      try {
        const newRepresentation = viewerAdapter.createRepresentation(
          component,
          newRepresentationType,
          oldRepresentation.params,
          oldRepresentation.lastKnownID
        );
        await newRepresentation.ready;
        dispatch(addComponentRepresentation(parentKey, newRepresentation, true));
        removeRepresentation(representation, parentKey, true);
        dispatch(changeComponentRepresentation(parentKey, oldRepresentation, newRepresentation));
      } catch (error) {
        console.error(error);
      }
    };

    const addMolecularRepresentation = async (parentKey, e) => {
      const objectsInView = store.getState().nglReducers.objectsInView;
      e.stopPropagation();
      const viewerAdapter = getViewerAdapter(objectsInView[parentKey].display_div);
      const component = viewerAdapter.getObject(parentKey);

      try {
        const newRepresentation = viewerAdapter.createRepresentation(component, MOL_REPRESENTATION.axes);
        await newRepresentation.ready;
        dispatch(addComponentRepresentation(parentKey, newRepresentation));
      } catch (error) {
        console.error(error);
      }
    };

    const removeRepresentation = (representation, parentKey, skipTracking) => {
      const objectsInView = store.getState().nglReducers.objectsInView;
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
      const objectsInView = store.getState().nglReducers.objectsInView;
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
      const objectsInView = store.getState().nglReducers.objectsInView;
      e.stopPropagation();
      const representations = [
        ...((objectsInView[parentKey] && objectsInView[parentKey].representations) || [])
      ].sort((a, b) => (a.lastKnownID > b.lastKnownID ? 1 : -1));
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
      const objectsInView = store.getState().nglReducers.objectsInView;
      const representations = (objectsInView[parentKey] && objectsInView[parentKey].representations) || [];
      let countOfNonVisibled = 0;

      representations.forEach(r => {
        if (r.params && r.params.visible === false) {
          countOfNonVisibled++;
        }
      });
      return countOfNonVisibled !== representations.length;
    };

    return {
      openRepresentationEditMenu,
      closeRepresentationEditMenu,
      changeVisibility,
      changeMolecularRepresentation,
      addMolecularRepresentation,
      removeRepresentation,
      removeMoleculeWithRepresentations,
      changeVisibilityMoleculeRepresentations,
      hasAllRepresentationVisibled
    };
  }, [dispatch, store, getViewerAdapter]);
  const buildTree = useMemo(createDisplayTreeModel, []);
  const tree = useMemo(() => buildTree(objectsInView), [buildTree, objectsInView]);
  const controls = useMemo(() => ({ models: tree.byId, actions, controlsVisible, editMenuAnchors }), [
    tree,
    actions,
    controlsVisible,
    editMenuAnchors
  ]);
  return (
    <Drawer title="Display controls" open={open} onClose={onClose}>
      <TreeControlsContext.Provider value={controls}>
        <RichTreeView className={classes.root} items={tree.items} slotProps={treeSlotProps} slots={treeSlots} />
      </TreeControlsContext.Provider>
    </Drawer>
  );
});
