/**
 * Created by abradley on 14/04/2018.
 */

import React, { memo, useCallback, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { Grid, withStyles } from '@material-ui/core';
import NGLView from '../components/nglComponents';
import MoleculeList from '../components/moleculeList';
import MolGroupSelector from '../components/molGroupSelector';
import SummaryView from '../components/summaryView';
import CompoundList from '../components/compoundList';
import NglViewerControls from '../components/nglViewerControls';
import HotspotList from '../components/hotspotList';
import ModalStateSave from '../components/modalStateSave';
import ModalErrorMessage from '../components/modalErrorDisplay';
import ModalTargetUnrecognised from '../components/modalTargetUnrecognised';
import * as apiActions from '../actions/apiActions';
import fetch from 'cross-fetch';
import { withRouter } from 'react-router-dom';
import { BrowserBomb } from '../components/browserBombModal';
import { SUFFIX, VIEWS } from '../constants/constants';
import * as nglObjectTypes from '../components/nglObjectTypes';
import * as nglLoadActions from '../actions/nglLoadActions';

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
  ({
    match,
    targetIdList,
    setErrorMessage,
    setTargetUnrecognised,
    classes,
    setTargetOn,
    loadObject,
    nglProtStyle,
    setMoleculeList,
    object_on,
    objectsInView,
    deleteObject
  }) => {
    const origTarget = useRef(-1);
    const target = match.params.target;

    const deployErrorModal = useCallback(
      error => {
        setErrorMessage(error);
      },
      [setErrorMessage]
    );

    const updateTarget = useCallback(() => {
      // Get from the REST API
      let targetUnrecognisedFlag = true;
      if (targetIdList.length !== 0) {
        targetIdList.forEach(targetId => {
          if (target === targetId.title) {
            targetUnrecognisedFlag = false;
          }
        });
      }
      setTargetUnrecognised(targetUnrecognisedFlag);
      if (targetUnrecognisedFlag === false) {
        fetch(window.location.protocol + '//' + window.location.host + '/api/targets/?title=' + target)
          .then(response => response.json())
          .then(json => setTargetOn(json['results'][0].id))
          .catch(error => {
            deployErrorModal(error);
          });
      }
    }, [target, setTargetUnrecognised, targetIdList, deployErrorModal, setTargetOn]);

    console.log(
      'render Preview '
      // targetIdList, // toto tu zo zaciatku nema hodnoty
      // nglProtStyle, // cartoon to sa nemeni
      // targetIdList, // toto je stale len protein, to sa nemeni
      // object_on,   // toto je undefined na zaciatku a potom nemenitelne cislo
      // objectsInView // tu sa to stale meni
    );

    useEffect(() => {
      updateTarget();
    }, [updateTarget]);

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
      if (object_on !== origTarget.current && object_on !== undefined && targetIdList && objectsInView) {
        let targetData = null;
        targetIdList.forEach(thisTarget => {
          if (thisTarget.id === object_on && targetData === null) {
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
        origTarget.current = object_on;
      }
    }, [deleteObject, generateTargetObject, loadObject, targetIdList, object_on, objectsInView, setMoleculeList]);

    // for loading protein
    useEffect(() => {
      if (targetIdList.length > 0) {
        checkForTargetChange();
      }
    }, [checkForTargetChange, targetIdList]);

    const screenHeight = window.innerHeight * (0.7).toString() + 'px';
    const molListHeight = window.innerHeight * (0.45).toString() + 'px';

    return (
      <Grid container spacing={2}>
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
        <ModalStateSave />
        <ModalErrorMessage />
        <ModalTargetUnrecognised />
        <BrowserBomb />
      </Grid>
    );
  }
);

function mapStateToProps(state) {
  return {
    targetIdList: state.apiReducers.present.target_id_list,

    nglProtStyle: state.nglReducers.present.nglProtStyle,
    object_on: state.apiReducers.present.target_on,
    objectsInView: state.nglReducers.present.objectsInView
  };
}
const mapDispatchToProps = {
  setTargetOn: apiActions.setTargetOn,
  setTargetUnrecognised: apiActions.setTargetUnrecognised,
  setErrorMessage: apiActions.setErrorMessage,

  loadObject: nglLoadActions.loadObject,
  setMoleculeList: apiActions.setMoleculeList,
  deleteObject: nglLoadActions.deleteObject
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles)(Preview))
);
