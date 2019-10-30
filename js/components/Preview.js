/**
 * Created by abradley on 14/04/2018.
 */

import React, { memo, useCallback, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { Grid, withStyles } from '@material-ui/core';
import NGLView from './nglComponents';
import MoleculeList from './molecule/moleculeList';
import MolGroupSelector from './molGroupSelector';
import SummaryView from './summaryView';
import CompoundList from './compoundList';
import NglViewerControls from './nglViewerControls';
import HotspotList from './hotspot/hotspotList';
import ModalStateSave from './session/modalStateSave';
import ModalErrorMessage from './modalErrorDisplay';
import HandleUnrecognisedTarget from './handleUnrecognisedTarget';
import * as apiActions from '../actions/apiActions';

import { BrowserBomb } from './browserBombModal';
import { SUFFIX, VIEWS } from '../constants/constants';
import * as nglObjectTypes from './nglObjectTypes';
import * as nglLoadActions from '../actions/nglLoadActions';
import { withUpdatingTarget } from '../hoc/withUpdatingTarget';

const styles = () => ({
  gridItemLhs: {
    width: '500px'
  },
  gridItemRhs: {
    width: 'calc(100% - 500px)'
  },
  fullWidth: {
    width: '100%'
  }
});

const Preview = memo(
  ({ targetIdList, classes, loadObject, nglProtStyle, setMoleculeList, target_on, objectsInView, deleteObject }) => {
    const origTarget = useRef(-1);

    console.log('render Preview ', target_on);

    const generateTargetObject = useCallback(
      targetData => {
        // Now deal with this target
        const prot_to_load = window.location.protocol + '//' + window.location.host + targetData.template_protein;
        if (JSON.stringify(prot_to_load) !== JSON.stringify(undefined)) {
          return {
            name: 'PROTEIN_' + targetData.id.toString(),
            prot_url: prot_to_load,
            OBJECT_TYPE: nglObjectTypes.PROTEIN,
            nglProtStyle: nglProtStyle
          };
        }
        return undefined;
      },
      [nglProtStyle]
    );

    const checkForTargetChange = useCallback(() => {
      if (target_on !== origTarget.current && target_on !== undefined && targetIdList && objectsInView) {
        let targetData = null;
        targetIdList.forEach(thisTarget => {
          if (thisTarget.id === target_on && targetData === null) {
            targetData = thisTarget;
          }
        });

        setMoleculeList([]);

        Object.keys(objectsInView).forEach(obj => {
          deleteObject(objectsInView[obj]);
        });
        const targObject = generateTargetObject(targetData);
        if (targObject) {
          loadObject(Object.assign({}, targObject, { display_div: VIEWS.SUMMARY_VIEW }));
          loadObject(
            Object.assign({}, targObject, {
              display_div: VIEWS.MAJOR_VIEW,
              name: targObject.name + SUFFIX.MAIN
            })
          );
        }
        origTarget.current = target_on;
      }
    }, [deleteObject, generateTargetObject, loadObject, targetIdList, target_on, objectsInView, setMoleculeList]);

    // for loading protein
    useEffect(() => {
      if (targetIdList.length > 0) {
        checkForTargetChange();
      }
    }, [checkForTargetChange, targetIdList]);

    const screenHeight = window.innerHeight * (0.7).toString() + 'px';
    const molListHeight = window.innerHeight * (0.45).toString() + 'px';

    return (
      <HandleUnrecognisedTarget>
        <Grid container spacing={2}>
          <ModalStateSave />
          {/* continue with refactoring of next components, but now is Preview component 3 times rendered
          <Grid item container direction="column" alignItems="stretch" spacing={2} className={classes.gridItemLhs}>
            <Grid item className={classes.fullWidth}>
              <MolGroupSelector />
            </Grid>
            <Grid item>
              <MoleculeList height={molListHeight} />
            </Grid>
          </Grid>
          <Grid item container className={classes.gridItemRhs} spacing={2}>
            <Grid item lg={6} md={12}>
              <NGLView div_id="major_view" height={screenHeight} />
              <NglViewerControls />
            </Grid>
            <Grid item lg={6} md={12}>
              <SummaryView />
              <CompoundList />
              <HotspotList />
            </Grid>
          </Grid>
*/}
          <ModalErrorMessage />
          <BrowserBomb />
        </Grid>
      </HandleUnrecognisedTarget>
    );
  }
);

function mapStateToProps(state) {
  return {
    targetIdList: state.apiReducers.present.target_id_list,
    nglProtStyle: state.nglReducers.present.nglProtStyle,
    target_on: state.apiReducers.present.target_on,
    objectsInView: state.nglReducers.present.objectsInView
  };
}
const mapDispatchToProps = {
  loadObject: nglLoadActions.loadObject,
  setMoleculeList: apiActions.setMoleculeList,
  deleteObject: nglLoadActions.deleteObject
};

export default withUpdatingTarget(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(Preview))
);
