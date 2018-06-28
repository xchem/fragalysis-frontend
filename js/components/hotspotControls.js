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
            Hotspot controls
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
