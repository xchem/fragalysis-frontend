/**
 * Created by rgillams on 28/06/2018.
 */

import React from 'react';
import { connect } from 'react-redux';
import * as nglReducers from "../reducers/nglReducers";
import * as nglLoadActions from '../actions/nglLoadActions';

class HotspotControls extends React.Component {

    constructor(props) {
        super(props)
        this.handleStageColor = this.handleStageColor.bind(this);
    }

    handleStageColor() {
        if (this.props.stageColor === 'white') {
            this.props.setStageColor('black');
        } else {
            this.props.setStageColor('white');
        }
    }

    render() {
        return <div>
            <h3>Viewer controls</h3>
            <button onClick={this.handleStageColor}>Toggle background colour</button>
            <h3>Hotspot controls</h3>
        </div>
    }
}

function mapStateToProps(state) {
    return {
        stageColor: state.nglReducers.stageColor
//        hotspotStatus: state.hotspotReducers.hotspotStatus
    }
}

const mapDispatchToProps = {
    setStageColor: nglLoadActions.setStageColor,
    //    toggleHotspot: hotspotActions.toggleHotspot
}

export default connect(mapStateToProps, mapDispatchToProps)(HotspotControls)
