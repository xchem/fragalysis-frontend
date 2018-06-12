/**
 * Created by abradley on 01/03/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import * as nglLoadActions from '../actions/nglLoadActions'
import { Button, Well, Col, Row } from 'react-bootstrap'


export class UpdateOrientation extends React.Component {
    constructor(props) {
        super(props);

        this.refreshOrientation = this.refreshOrientation.bind(this);
    }
    componentDidMount() {
    }


    refreshOrientation() {
        for(var key in this.props.nglOrientations){
            this.props.setOrientation(key,"REFRESH")
        }
    }

    componentWillReceiveProps(newProps){
    }

    componentDidUpdate() {
    }


    render() {
        return <div>
            <Button bsSize="large" bsStyle="success" onClick={this.refreshOrientation}>REFRESH</Button>
            {JSON.stringify(this.props.nglOrientations)}
           </div>
    }
}

function mapStateToProps(state) {
  return {

      nglOrientations: state.nglReducers.nglOrientations,
  }
}
const mapDispatchToProps = {
    setOrientation: nglLoadActions.setOrientation
}
export default connect(mapStateToProps, mapDispatchToProps)(UpdateOrientation);