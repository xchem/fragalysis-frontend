/**
 * Created by abradley on 01/03/2018.
 */

import { Stage } from 'ngl';
import React, { memo, useEffect, useCallback, useContext, useState } from 'react';
import { connect } from 'react-redux';
import * as nglActions from '../../reducers/ngl/nglActions';
import * as nglDispatchActions from '../../reducers/ngl/nglDispatchActions';
import * as selectionActions from '../../reducers/selection/selectionActions';
import { NglContext } from './nglProvider';
import { handleNglViewPick } from './redux/nglViewActions';
import { throttle } from 'lodash';

const NglView = memo(({ div_id, height, setOrientation, removeAllNglComponents, handleNglViewPick }) => {
  // connect to NGL Stage object
  const { registerNglView, unregisterNglView, getNglView } = useContext(NglContext);
  const [stage, setStage] = useState();

  const handleOrientationChanged = useCallback(
    throttle(() => {
      const newStage = getNglView(div_id);
      if (newStage) {
        const currentOrientation = newStage.stage.viewerControls.getOrientation();
        setOrientation(div_id, currentOrientation);
      }
    }, 250),
    [div_id, getNglView, setOrientation]
  );

  // Initialization of NGL View component
  const handleResize = useCallback(() => {
    const newStage = getNglView(div_id);
    if (newStage) {
      newStage.stage.handleResize();
    }
  }, [div_id, getNglView]);

  const registerStageEvents = useCallback(
    (newStage, getNglView) => {
      window.addEventListener('resize', handleResize);
      newStage.mouseControls.add('clickPick-left', (stage, pickingProxy) =>
        handleNglViewPick(stage, pickingProxy, getNglView)
      );

      newStage.mouseObserver.signals.scrolled.add(handleOrientationChanged);
      newStage.mouseObserver.signals.dropped.add(handleOrientationChanged);
      newStage.mouseObserver.signals.dragged.add(handleOrientationChanged);
    },
    [handleResize, handleOrientationChanged, handleNglViewPick]
  );

  const unregisterStageEvents = useCallback(
    (stage, getNglView) => {
      window.addEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
      stage.mouseControls.remove('clickPick-left', (stage, pickingProxy) =>
        handleNglViewPick(stage, pickingProxy, getNglView)
      );

      stage.mouseObserver.signals.scrolled.remove(handleOrientationChanged);
      stage.mouseObserver.signals.dropped.remove(handleOrientationChanged);
      stage.mouseObserver.signals.dragged.remove(handleOrientationChanged);
    },
    [handleResize, handleOrientationChanged, handleNglViewPick]
  );

  useEffect(() => {
    const nglViewFromContext = getNglView(div_id);
    if (stage === undefined && !nglViewFromContext) {
      const newStage = new Stage(div_id);
      registerNglView(div_id, newStage);
      registerStageEvents(newStage, getNglView);
      setStage(newStage);
    } else if (stage === undefined && nglViewFromContext && nglViewFromContext.stage) {
      registerStageEvents(nglViewFromContext.stage, getNglView);
      setStage(nglViewFromContext.stage);
    } else if (stage) {
      registerStageEvents(stage, getNglView);
    }

    return () => {
      if (stage) {
        unregisterStageEvents(stage, getNglView);
        unregisterNglView(div_id);
      }
    };
  }, [
    div_id,
    handleResize,
    registerNglView,
    unregisterNglView,
    handleOrientationChanged,
    removeAllNglComponents,
    registerStageEvents,
    unregisterStageEvents,
    stage,
    getNglView
  ]);
  // End of Initialization NGL View component

  return <div id={div_id} style={{ height: height || '600px', width: '100%' }} />;
});

function mapStateToProps(state) {
  return {};
}
const mapDispatchToProps = {
  setMolGroupSelection: selectionActions.setMolGroupSelection,
  setOrientation: nglDispatchActions.setOrientation,
  removeAllNglComponents: nglActions.removeAllNglComponents,
  handleNglViewPick
};

NglView.displayName = 'NglView';

export default connect(mapStateToProps, mapDispatchToProps)(NglView);
