/**
 * Created by ricgillams on 28/06/2018.
 */

import React, { memo } from 'react';
import { connect } from 'react-redux';
import * as nglLoadActions from '../../reducers/ngl/nglLoadActions';
import { Button } from 'react-bootstrap';
import { MOL_REPRESENTATION, STAGE_COLOR } from './constants';

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
    <div>
      <h3>Viewer controls</h3>
      <Button bsSize="sm" bsStyle="success" onClick={handleStageColor}>
        Change background colour
      </Button>
    </div>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NglViewerControls);
