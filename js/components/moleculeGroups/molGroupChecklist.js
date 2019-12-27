import React, { memo, Fragment, useContext } from 'react';
import { Grid, makeStyles, Checkbox } from '@material-ui/core';
import { connect } from 'react-redux';
import * as apiActions from '../../reducers/api/apiActions';
import { heightOfBody } from './molGroupSelector';
import { generateSphere } from '../molecule/molecules_helpers';
import { VIEWS } from '../../constants/constants';
import * as nglLoadActions from '../../reducers/ngl/nglActions';
import { useDisableUserInteraction } from '../useEnableUserInteracion';
import * as selectionActions from '../../reducers/selection/selectionActions';
import { NglContext } from '../nglView/nglProvider';
import { OBJECT_TYPE } from '../nglView/constants';
import { clearAfterDeselectingMoleculeGroup } from './molGroupHelpers';

const useStyles = makeStyles(theme => ({
  divContainer: {
    height: '100%',
    width: '100%',
    paddingTop: theme.spacing(1) / 2
  },
  divScrollable: {
    height: '100%',
    width: '100%',
    border: 'solid 1px #DEDEDE',
    overflow: 'auto'
  },
  selectedLine: {
    color: theme.palette.primary.main,
    fontWeight: 'bold'
  },
  title: {
    position: 'relative',
    top: `calc(0px - 6px - ${heightOfBody})`,
    marginLeft: theme.spacing(1),
    backgroundColor: theme.palette.white,
    width: 'fit-content',
    fontWeight: 'bold'
  },
  rowItem: {
    height: 22
  }
}));

const molGroupChecklist = memo(
  ({
    mol_group_list,
    mol_group_selection,
    setMolGroupOn,
    setMolGroupSelection,
    vector_list,
    cached_mol_lists,
    deleteObject,
    loadObject
  }) => {
    const classes = useStyles();
    const disableUserInteraction = useDisableUserInteraction();
    const { getNglView } = useContext(NglContext);

    const handleOnSelect = selectedObject => e => {
      const stageSummaryView = getNglView(VIEWS.SUMMARY_VIEW).stage;
      const majorViewStage = getNglView(VIEWS.MAJOR_VIEW).stage;
      const objIdx = mol_group_selection.indexOf(selectedObject.id);
      const selectionCopy = mol_group_selection.slice();
      const currentMolGroup = mol_group_list.find(o => o.id === selectedObject.id);
      const currentMolGroupStringID = `${OBJECT_TYPE.MOLECULE_GROUP}_${selectedObject.id}`;
      if (e.target.checked && objIdx === -1) {
        setMolGroupOn(selectedObject.id);
        selectionCopy.push(selectedObject.id);
        deleteObject(
          {
            display_div: VIEWS.SUMMARY_VIEW,
            name: currentMolGroupStringID
          },
          stageSummaryView
        );
        loadObject(
          Object.assign({ display_div: VIEWS.SUMMARY_VIEW }, generateSphere(currentMolGroup, true)),
          stageSummaryView
        );
        setMolGroupSelection(selectionCopy);
      } else if (!e.target.checked && objIdx > -1) {
        clearAfterDeselectingMoleculeGroup({
          molGroupId: selectedObject.id,
          majorViewStage,
          cached_mol_lists,
          mol_group_list,
          vector_list,
          deleteObject
        });
        selectionCopy.splice(objIdx, 1);
        deleteObject(
          {
            display_div: VIEWS.SUMMARY_VIEW,
            name: currentMolGroupStringID
          },
          stageSummaryView
        );
        loadObject(
          Object.assign({ display_div: VIEWS.SUMMARY_VIEW }, generateSphere(currentMolGroup, false)),
          stageSummaryView
        );
        setMolGroupSelection(selectionCopy);
        if (selectionCopy.length > 0) {
          setMolGroupOn(selectionCopy.slice(-1)[0]);
        } else {
          setMolGroupOn(undefined);
        }
      }
    };

    return (
      <Fragment>
        <div className={classes.divContainer}>
          <div className={classes.divScrollable}>
            <Grid container direction="column">
              {mol_group_list &&
                mol_group_list.map((o, idx) => {
                  const checked = mol_group_selection.some(i => i === o.id);
                  const site = idx + 1;
                  return (
                    <Grid
                      item
                      container
                      alignItems="center"
                      key={`mol-checklist-item-${idx}`}
                      className={classes.rowItem}
                    >
                      <Grid item>
                        <Checkbox
                          color="primary"
                          checked={checked}
                          onChange={handleOnSelect(o)}
                          disabled={disableUserInteraction}
                        />
                      </Grid>
                      <Grid item className={checked ? classes.selectedLine : null}>
                        {`Site ${site} - (${o.id})`}
                      </Grid>
                    </Grid>
                  );
                })}
            </Grid>
          </div>
        </div>
        <div className={classes.title}>Selected sites:</div>
      </Fragment>
    );
  }
);

const mapStateToProps = state => {
  return {
    mol_group_list: state.apiReducers.present.mol_group_list,
    mol_group_selection: state.selectionReducers.present.mol_group_selection,
    cached_mol_lists: state.apiReducers.present.cached_mol_lists,
    vector_list: state.selectionReducers.present.vector_list
  };
};

const mapDispatchToProps = {
  setMolGroupOn: apiActions.setMolGroupOn,
  setMolGroupSelection: selectionActions.setMolGroupSelection,
  deleteObject: nglLoadActions.deleteObject,
  loadObject: nglLoadActions.loadObject
};
export default connect(mapStateToProps, mapDispatchToProps)(molGroupChecklist);
