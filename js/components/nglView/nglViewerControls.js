/**
 * Created by ricgillams on 28/06/2018.
 */

import React, { memo } from 'react';
import { connect } from 'react-redux';
import * as nglLoadActions from '../../actions/nglLoadActions';
import { Button } from 'react-bootstrap';

const NglViewerControls = memo(({ stageColor, nglProtStyle, setStageColor, setNglProtStyle }) => {
  const handleStageColor = () => {
    if (stageColor === 'white') {
      setStageColor('black');
    } else {
      setStageColor('white');
    }
  };

  const handleNglProtStyle = () => {
    if (nglProtStyle === 'cartoon') {
      setNglProtStyle('hyperball');
    } else if (nglProtStyle === 'hyperball') {
      setNglProtStyle('cartoon');
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
