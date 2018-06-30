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
            <H3>Viewer controls</H3>
            <button>Toggle background colour</button>
            <H3>Hotspot controls</H3>
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
