/**
 * Created by abradley on 01/03/2018.
 */
import { Stage, Shape, concatStructures, Selection } from 'ngl';
import { ListGroupItem, ListGroup, Col} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import * as nglLoadActions from '../actions/nglLoadActions'
import * as nglObjectTypes from '../components/nglObjectTypes'
import * as listTypes from './listTypes'
import { showLoading, hideLoading } from 'react-redux-loading-bar'
import * as selectionActions from '../actions/selectionActions'


export class NGLView extends React.Component {
    constructor(props) {
        super(props);

        this.refreshOrientation = this.refreshOrientation.bind(this);
    }
    componentDidMount() {
    }


    refreshOrientation() {
        for(var key in this.props.nglOrientations){
            this.props.setOrientations(key,"REFRESH")
        }
    }

    componentWillReceiveProps(newProps){
    }

    componentDidUpdate() {
        this.renderDisplay();
    }


    render() {
        return <div>
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