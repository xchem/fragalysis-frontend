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
            this.props.setNglProtStyle('hyperball')
        } else if (this.props.nglProtStyle === 'hyperball') {
            this.props.setNglProtStyle('cartoon')
        }
    }

    render() {
        return <div>
            <h3>Viewer controls</h3>
            <Button bsSize="large" bsStyle="success" onClick={this.handleStageColor}>Change background colour</Button>
            <Button bsSize="large" bsStyle="success" onClick={this.handleNglProtStyle}>Change protein representation</Button>
            <UpdateOrientation />
        </div>
    }
}

function mapStateToProps(state) {
    return {
        stageColor: state.nglReducers.present.stageColor,
        nglProtStyle: state.nglReducers.present.nglProtStyle
    }
}

const mapDispatchToProps = {
    setStageColor: nglLoadActions.setStageColor,
    setNglProtStyle: nglLoadActions.setNglProtStyle
}

export default connect(mapStateToProps, mapDispatchToProps)(NglViewerControls)
