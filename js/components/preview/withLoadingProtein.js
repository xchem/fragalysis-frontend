/**
 * Created by abradley on 13/03/2018.
 */
import React, { memo, useCallback, useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import * as nglActions from '../../reducers/ngl/nglActions';
import * as apiActions from '../../reducers/api/apiActions';
import { VIEWS, SUFFIX } from '../../constants/constants';
import { NglContext } from '../nglView/nglProvider';
import { generateProteinObject } from '../nglView/generatingObjects';
import { setProteinsHasLoaded } from '../../reducers/ngl/nglActions';

// is responsible for loading molecules list
export const withLoadingProtein = WrappedComponent => {
  const ProteinLoader = memo(
    ({
      targetIdList,
      targetOnName,
      loadObject,
      target_on,
      group_type,
      setObjectList,
      setProteinsHasLoaded,
      isStateLoaded,
      ...rest
    }) => {
      const { nglViewList } = useContext(NglContext);

      const loadProtein = useCallback(
        nglView => {
          if (target_on !== undefined && targetIdList && nglView && nglView.id && nglView.stage) {
            let targetData = null;
            targetIdList.forEach(thisTarget => {
              if (thisTarget.id === target_on && targetData === null) {
                targetData = thisTarget;
              }
            });
            const targObject = generateProteinObject(targetData);
            if (targObject) {
              let newParams = { display_div: nglView.id };
              if (nglView.id === VIEWS.MAJOR_VIEW) {
                newParams.name = targObject.name + SUFFIX.MAIN;
              }
              return loadObject(Object.assign({}, targObject, newParams), nglView.stage);
            }
          }
          return Promise.reject('Cannot load Protein to NGL View ID ', nglView.id);
        },
        [loadObject, targetIdList, target_on]
      );

      useEffect(() => {
        if (targetIdList && targetIdList.length > 0 && nglViewList && nglViewList.length > 0) {
          //  1. Generate new protein or skip this action and everything will be loaded from session
          if (!isStateLoaded) {
            console.log('___ loading proteins for NGL views: ', nglViewList);
            setProteinsHasLoaded(false);
            Promise.all(nglViewList.map(nglView => loadProtein(nglView)))
              .then(() => setProteinsHasLoaded(true))
              .catch(() => setProteinsHasLoaded(false));
          } else {
            setProteinsHasLoaded(true);
          }
          if (targetOnName !== undefined) {
            document.title = targetOnName + ': Fragalysis';
          }
        }
      }, [nglViewList, loadProtein, targetIdList, targetOnName, setProteinsHasLoaded, isStateLoaded]);

      return <WrappedComponent isStateLoaded={isStateLoaded} {...rest} />;
    }
  );

  function mapStateToProps(state) {
    return {
      group_type: state.apiReducers.present.group_type,
      target_on: state.apiReducers.present.target_on,
      targetIdList: state.apiReducers.present.target_id_list,
      targetOnName: state.apiReducers.present.target_on_name
    };
  }
  const mapDispatchToProps = {
    loadObject: nglActions.loadObject,
    setObjectList: apiActions.setMolGroupList,
    setProteinsHasLoaded: setProteinsHasLoaded
  };
  return connect(mapStateToProps, mapDispatchToProps)(ProteinLoader);
};
