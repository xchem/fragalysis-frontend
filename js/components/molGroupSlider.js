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
    }
    render() {
        return <div><Pager>
            <Pager.Item onClick={this.handleClick('previous')}>Previous</Pager.Item>{' '}
            <Pager.Item onClick={this.handleClick('next')}>Next</Pager.Item>
        </Pager>
        <ProgressBar now={this.state.progress} />;
        </div>;
    }

    handleClick(staging){
        var selected;
        var progress;
        if (staging=='previous'){
            if (this.state.selected>0){
                selected=this.state.selected-1
            }
        }
        else if (staging=='next'){
            if (this.state.selected<this.props.object_list.length){
                selected=this.state.selected+1
            }
        }
        progress = 100*selected/this.props.object_list.length
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
