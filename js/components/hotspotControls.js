/**
 * Created by rgillams on 28/06/2018.
 */

import React from 'react';
import { connect } from 'react-redux';

class HotspotControls extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return <div>
            <h3>Viewer controls</h3>
            <button>Toggle background colour</button>
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
//    toggleHotspot: hotspotActions.toggleHotspot
}

export default connect(mapStateToProps, mapDispatchToProps)(HotspotControls)
