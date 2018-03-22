/**
 * Created by abradley on 22/03/2018.
 */
import { ListGroupItem, ListGroup, Col} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import {Pager, ProgressBar} from 'react-bootstrap';


class MolGroupSlider extends React.Component{

    constructor(props) {
        super(props);
        this.handleForward = this.handleForward.bind(this);
        this.handleBackward = this.handleBackward.bind(this);
        this.state = {currentlySelected: 0, progress: 0}
    }

    render() {
        this.progress = this.state.progress;
        return <div><Pager>
            <Pager.Item onClick={this.handleBackward}>Previous</Pager.Item>{' '}
            <Pager.Item onClick={this.handleForward}>Next</Pager.Item>
        </Pager>
        <ProgressBar active now={this.state.progress} />;
        </div>;
    }

    handleForward(){
        var selected = this.state.currentlySelected;
        if (selected<this.props.object_list.length){
            selected+=1
        }
        var progress = 100*selected/this.props.object_list.length
        this.setState(prevState => ({currentlySelected: selected, progress: progress}))
    }
    handleBackward(){
        var selected = this.state.currentlySelected;
        if (selected>0){
                selected-=1
        }
        var progress = 100*selected/this.props.object_list.length
        this.setState(prevState => ({currentlySelected: selected, progress: progress}))
    }

}
function mapStateToProps(state) {
  return {
      object_list: state.apiReducers.mol_group_list,
      object_on: state.apiReducers.mol_group_on
  }
}
const mapDispatchToProps = {
    setObjectOn: apiActions.setMolGroupOn,
    setObjectList: apiActions.setMolGroupList
}
export default connect(mapStateToProps, mapDispatchToProps)(MolGroupSlider);
