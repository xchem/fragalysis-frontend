/**
 * Created by ricgillams on 28/06/2018.
 */

import React, { memo } from 'react';
import { connect } from 'react-redux';
import * as nglLoadActions from '../../reducers/ngl/nglLoadActions';
import { Button } from '../common/Inputs/Button';
import { MOL_REPRESENTATION, STAGE_COLOR } from './constants';
import { Panel } from '../common/Surfaces/Panel';
import { InvertColors } from '@material-ui/icons';

const NglViewerControls = memo(({ stageColor, nglProtStyle, setStageColor, setNglProtStyle }) => {
  const handleStageColor = () => {
    if (stageColor === STAGE_COLOR.white) {
      setStageColor(STAGE_COLOR.black);
    } else {
      setStageColor(STAGE_COLOR.white);
    }
  };

  const handleNglProtStyle = () => {
    if (nglProtStyle === MOL_REPRESENTATION.cartoon) {
      setNglProtStyle(MOL_REPRESENTATION.hyperball);
    } else if (nglProtStyle === MOL_REPRESENTATION.hyperball) {
      setNglProtStyle(MOL_REPRESENTATION.cartoon);
    }
  };

  return (
    <Panel hasHeader title="Viewer controls">
      <Button color="primary" onClick={handleStageColor} startIcon={<InvertColors />}>
        Change background colour
      </Button>
    </Panel>
  );
});

function mapStateToProps(state) {
  return {
    stageColor: state.nglReducers.present.stageColor,
    nglProtStyle: state.nglReducers.present.nglProtStyle
  };
}

const mapDispatchToProps = {
  setStageColor: nglLoadActions.setStageColor,
  setNglProtStyle: nglLoadActions.setNglProtStyle
};

export default connect(mapStateToProps, mapDispatchToProps)(NglViewerControls);
