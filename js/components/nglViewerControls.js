/**
 * Created by ricgillams on 28/06/2018.
 */

import React from 'react';
import { connect } from 'react-redux';
import * as nglLoadActions from '../actions/nglLoadActions';
import UpdateOrientation from './updateOrientation';
import { Button } from 'react-bootstrap';

class NglViewerControls extends React.Component {

    constructor(props) {
        super(props)
        this.handleStageColor = this.handleStageColor.bind(this);
        this.handleNglProtStyle = this.handleNglProtStyle.bind(this);
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
            this.props.setNglProtStyle('hyperball')
        } else if (this.props.nglProtStyle === "hyperball") {
            this.props.setNglProtStyle("ball+stick")
        }
    }

    render() {
        return <div>
            <h3>Viewer controls</h3>
            <Button bsSize="large" bsStyle="success" onClick={this.handleStageColor}>Change background colour</Button>
            <UpdateOrientation />
        </div>
    }
}

function mapStateToProps(state) {
    return {
        stageColor: state.nglReducers.stageColor,
        nglProtStyle: state.nglReducers.nglProtStyle
    }
}

const mapDispatchToProps = {
    setStageColor: nglLoadActions.setStageColor,
    setNglProtStyle: nglLoadActions.setNglProtStyle
}

export default connect(mapStateToProps, mapDispatchToProps)(NglViewerControls)
