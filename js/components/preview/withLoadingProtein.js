/**
 * Created by abradley on 13/03/2018.
 */
import React, { memo, useCallback, useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import * as nglActions from '../../reducers/ngl/nglActions';
import * as apiActions from '../../reducers/api/apiActions';
import { VIEWS, SUFFIX } from '../../constants/constants';
import { NglContext } from '../nglView/nglProvider';
import { generateProteinObject } from '../../reducers/ngl/renderingHelpers';
import { setProteinsHasLoad } from '../../reducers/ngl/nglActions';

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
      isStateLoaded,
      setProteinsHasLoad,
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
            /*There will be two variants:
              1. Generate new protein
              2. Skip loading of protein and load everything from session
            */
            const targObject = generateProteinObject(targetData);
            if (targObject) {
              let newParams = { display_div: nglView.id };
              if (nglView.if === VIEWS.MAJOR_VIEW) {
                newParams[name] = targObject.name + SUFFIX.MAIN;
              }
              loadObject(Object.assign({}, targObject, newParams), nglView.stage)
                .then(() => setProteinsHasLoad(true))
                .catch(() => setProteinsHasLoad(false));
            }
          }
        },
        [loadObject, setProteinsHasLoad, targetIdList, target_on]
      );

      useEffect(() => {
        if (targetIdList && targetIdList.length > 0 && nglViewList && nglViewList.length > 0) {
          setProteinsHasLoad(false);
          console.log('___ loading proteins for NGL views: ', nglViewList);
          nglViewList.forEach(nglView => loadProtein(nglView));
          if (targetOnName !== undefined) {
            document.title = targetOnName + ': Fragalysis';
          }
        }
      }, [nglViewList, loadProtein, targetIdList, targetOnName, setProteinsHasLoad]);

      return <WrappedComponent {...rest} />;
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
    setProteinsHasLoad: setProteinsHasLoad
  };
  return connect(mapStateToProps, mapDispatchToProps)(ProteinLoader);
};
