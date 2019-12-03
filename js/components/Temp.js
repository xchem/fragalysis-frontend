import React, { memo, useCallback, useContext, useEffect, useRef } from 'react';
import { NglContext } from './nglView/nglProvider';
import { Stage } from 'ngl';
import { VIEWS } from '../constants/constants';

export const Temp = memo(() => {
  const div_id = VIEWS.MAJOR_VIEW;
  const { registerNglView, unregisterNglView, getNglView } = useContext(NglContext);
  const stageRef = useRef();
  const nglView = getNglView(div_id);

  const handleResize = useCallback(() => {
    const newStage = getNglView(div_id);
    if (newStage) {
      newStage.stage.handleResize();
    }
  }, [div_id, getNglView]);

  useEffect(() => {
    stageRef.current = new Stage(div_id);
    registerNglView(div_id, stageRef.current);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      unregisterNglView(div_id);
    };
  }, [div_id, handleResize, registerNglView, unregisterNglView]);

  if (nglView) {
    nglView.stage.loadFile('rcsb://1crn', { defaultRepresentation: true });
  }

  return <div id={div_id} style={{ height: '400px', width: '100%' }} />;
});
