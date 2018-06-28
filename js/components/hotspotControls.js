/**
 * Created by rgillams on 28/06/2018.
 */

import React from 'react';
import { connect } from 'react-redux';
import * as hotspotActions from '../actions/hotspotActions'
import hotspotReducers from "../reducers/hotspotReducers";


class HotspotControls extends React.Component {

    constructor(props) {
        super(props)
    }


    render() {
        return <div>
            Hotspot controls
            <div><button onClick={this.props.increaseCounter}>Increase</button></div>
        </div>
    }
}

function mapStateToProps(state) {
    return {
//        hotspotStatus: state.hotspotReducers.hotspotStatus
    }
}

const mapDispatchToProps = {
//    toggleHotspot: hotspotActions.toggleHotspot
}

export default connect(mapStateToProps, mapDispatchToProps)(HotspotControls)
