/**
 * Created by rgillams on 28/06/2018.
 */

import React from 'react';
import { connect } from 'react-redux';
import * as nglReducers from "../reducers/nglReducers";
import * as nglRenderActions from '../actions/nglLoadActions';

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

    handleNglProtStyle() {
        if (this.props.nglProtStyle === 'cartoon') {
            this.props.setNglProtStyle('licorice')
        } else if (this.props.nglProtStyle === 'licorice') {
            this.props.setNGLProtStyle('hyperball')
        }
    }

    render() {
        return <div>
            <h3>Viewer controls</h3>
            <button onClick={this.handleStageColor}>Toggle background colour</button>
            <button onClick={this.handleNglProtStyle}>Toggle protein style</button>
            {/*<h3>Hotspot controls</h3>*/}
        </div>
    }
}

function mapStateToProps(state) {
    return {
        stageColor: state.nglReducers.stageColor,
        nglProtStyle: state.nglReducers.nglProtStyle
//        hotspotStatus: state.hotspotReducers.hotspotStatus
    }
}

const mapDispatchToProps = {
    setStageColor: nglRenderActions.setStageColor,
    setNglProtStyle: nglRenderActions.setNglProtStyle
    //    toggleHotspot: hotspotActions.toggleHotspot
}

export default connect(mapStateToProps, mapDispatchToProps)(HotspotControls)
