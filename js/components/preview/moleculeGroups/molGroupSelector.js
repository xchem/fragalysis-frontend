import React, { memo, useContext, useRef } from 'react';
import { Grid, makeStyles } from '@material-ui/core';
import { Delete } from '@material-ui/icons';

import { Panel } from '../../common/Surfaces/Panel';
import { Button } from '../../common/Inputs/Button';
import NGLView from '../../nglView/nglView';
import MolGroupChecklist from './molGroupChecklist';
import * as apiActions from '../../../reducers/api/apiActions';
import { connect } from 'react-redux';
import * as nglActions from '../../../reducers/ngl/nglActions';
import { VIEWS } from '../../../constants/constants';
import * as selectionActions from '../../../reducers/selection/selectionActions';
import { withLoadingMolGroupList } from '../../../hoc/withLoadingMolGroupList';
import { NglContext } from '../../nglView/nglProvider';
import { useDisableUserInteraction } from '../../helpers/useEnableUserInteracion';
import { SCENES } from '../../../reducers/ngl/nglConstants';

export const heightOfBody = '164px';

const useStyles = makeStyles(theme => ({
  containerExpanded: {
    height: heightOfBody
  },
  containerCollapsed: {
    height: 0
  },
  nglViewItem: {
    paddingLeft: theme.spacing(1) / 2
  },
  checklistItem: {
    height: '100%'
  }
}));

const molGroupSelector = memo(
  ({
    setObjectOn,
    setObjectSelection,
    setFragmentDisplayList,
    setComplexList,
    setVectorOnList,
    setVectorList,
    resetSelectionState,
    handleHeightChange,
    reloadNglViewFromScene
  }) => {
    const classes = useStyles();
    const ref = useRef(null);

    const { getNglView } = useContext(NglContext);
    const disableUserInteraction = useDisableUserInteraction();

    const handleClearSelection = () => {
      // Reset NGL VIEWS to default state
      const majorViewStage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
      const summaryViewStage = getNglView(VIEWS.SUMMARY_VIEW) && getNglView(VIEWS.SUMMARY_VIEW).stage;
      reloadNglViewFromScene(majorViewStage, VIEWS.MAJOR_VIEW, SCENES.defaultScene);
      reloadNglViewFromScene(summaryViewStage, VIEWS.SUMMARY_VIEW, SCENES.defaultScene);

      // Reset selection reducer
      // remove sites selection
      setObjectOn(undefined);
      setObjectSelection([]);

      // reset all selection state
      resetSelectionState();

      // remove Ligand, Complex, Vectors from selection
      //Ligand
      setFragmentDisplayList([]);
      // Complex
      setComplexList([]);
      // Vectors
      setVectorOnList([]);
      setVectorList([]);
    };

    return (
      <Panel
        ref={ref}
        hasHeader
        hasExpansion
        defaultExpanded
        title="Hit cluster selector"
        headerActions={[
          <Button
            onClick={handleClearSelection}
            disabled={disableUserInteraction}
            color="inherit"
            variant="text"
            size="small"
            startIcon={<Delete />}
          >
            Clear selection
          </Button>
        ]}
        onExpandChange={expand => {
          if (ref.current && handleHeightChange instanceof Function) {
            handleHeightChange(ref.current.offsetHeight);
          }
        }}
      >
        <Grid container justify="space-between" className={classes.containerExpanded}>
          <Grid item xs={5} className={classes.nglViewItem}>
            <NGLView div_id={VIEWS.SUMMARY_VIEW} height={heightOfBody} />
          </Grid>
          <Grid item xs={7} className={classes.checklistItem}>
            <MolGroupChecklist />
          </Grid>
        </Grid>
      </Panel>
    );
  }
);

function mapStateToProps(state) {
  return {};
}
const mapDispatchToProps = {
  setObjectOn: apiActions.setMolGroupOn,
  setObjectSelection: selectionActions.setMolGroupSelection,
  removeFromFragmentDisplayList: selectionActions.removeFromFragmentDisplayList,
  setFragmentDisplayList: selectionActions.setFragmentDisplayList,
  setComplexList: selectionActions.setComplexList,
  setVectorOnList: selectionActions.setVectorOnList,
  setVectorList: selectionActions.setVectorList,
  resetSelectionState: selectionActions.resetSelectionState,
  reloadNglViewFromScene: nglActions.reloadNglViewFromScene
};
export default withLoadingMolGroupList(connect(mapStateToProps, mapDispatchToProps)(molGroupSelector));
