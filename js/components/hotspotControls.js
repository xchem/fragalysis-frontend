/**
 * Created by rgillams on 28/06/2018.
 */

import React from 'react';
import { connect } from 'react-redux';
import nglReducers from "../reducers/nglReducers";
import * as nglRenderActions from '../actions/nglRenderActions';

class HotspotControls extends React.Component {

    constructor(props) {
        super(props)
        this.handleStageColor = this.handleStageColor.bind(this);
    }

    handleStageColor() {
        this.props.setStageColor();
    }

    render() {
        return <div>
            <h3>Viewer controls</h3>
            <button onClick={this.handleStageColor}>Toggle background colour</button>
            <h3>Hotspot controls</h3>
            <div><button>Increase</button></div>
        </div>
    }
}

function mapStateToProps(state) {
    return {
//        hotspotStatus: state.hotspotReducers.hotspotStatus
    }
}

const mapDispatchToProps = {
    setStageColor: nglRenderActions.setStageColor,
    //    toggleHotspot: hotspotActions.toggleHotspot
}

export default connect(mapStateToProps, mapDispatchToProps)(HotspotControls)
