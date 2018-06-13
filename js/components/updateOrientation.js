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

    postToServer() {
        // Refresh orientation
        for(var key in this.props.nglOrientations){
            this.props.setOrientation(key,"REFRESH")
        }
    }


    componentDidUpdate() {
        var hasBeenRefreshed = true
        for(var key in this.props.nglOrientations){
            if(this.props.nglOrientations[key]=="REFRESH"){
                hasBeenRefreshed = false;
            }
        }
        if (hasBeenRefreshed){
            // Post the data to the server as usual
            
        }

    }


    render() {
        return <div>
            <Button bsSize="large" bsStyle="success" onClick={this.postToServer}>REFRESH</Button>
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