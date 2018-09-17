/**
 * Created by abradley on 14/04/2018.
 */

import React, {Component} from "react";
import {connect} from "react-redux";
import {Row, Col} from "react-bootstrap";
import NGLView from "../components/nglComponents";
import MolGroupList from "../components/molGroupList";
import MoleculeList from "../components/moleculeList";
import MolGroupSlider from "../components/molGroupSlider";
import SummaryView from "../components/summaryView";
import CompoundList from '../components/compoundList';
import NglViewerControls from "../components/nglViewerControls";
import HotspotList from "../components/hotspotList";
import * as apiActions from "../actions/apiActions";
import * as selectionActions from "../actions/selectionActions";
import fetch from "cross-fetch";
import {withRouter} from "react-router-dom";
import keydown from "react-keydown";

const KEYS = [ 'left', 'right', '0', '1', '2', '3', '4', '5' ];
@keydown( KEYS )
class Preview extends Component {

    constructor(props) {
        super(props)
        this.updateTarget = this.updateTarget.bind(this);
        this.handleCursor = this.handleCursor.bind(this);
        this.highlightFirstCompound = this.highlightFirstCompound.bind(this);
    }

    updateTarget(){
        var target = this.props.match.params.target;
        // Get from the REST API
        fetch(window.location.protocol + "//" + window.location.host+"/api/targets/?title="+target)
            .then(response => response.json())
            .then(json => this.props.setTargetOn(json["results"][0].id));
    }

    handleCursor(keyCode) {
        if(JSON.stringify(this.props.this_vector_list)==JSON.stringify({})){
            return;
        }
        var defaultSet = {index: 0, smiles: this.props.this_vector_list[Object.keys(this.props.this_vector_list)][0]};
        if (keyCode === 37) {
            console.log('left cursor ' + this.props.currentCompoundClass);
            if (Object.keys(this.props.highlightedCompound).length == 0) {
                this.props.setHighlighted(defaultSet)
            }
            else {
                var indexToSet = Math.max(this.props.highlightedCompound["index"] - 1, 0)
                this.props.setHighlighted({
                    index: indexToSet,
                    smiles: this.props.this_vector_list[Object.keys(this.props.this_vector_list)][indexToSet]
                })
            }
        } else if (keyCode === 39) {
            console.log('right cursor ' + this.props.currentCompoundClass);
            if (Object.keys(this.props.highlightedCompound).length == 0) {
                this.props.setHighlighted(defaultSet)
            }
            else {
                var indexToSet = Math.min(parseInt(this.props.highlightedCompound["index"]) + 1, this.props.this_vector_list[Object.keys(this.props.this_vector_list)].length - 1)
                this.props.setHighlighted({
                    index: indexToSet,
                    smiles: this.props.this_vector_list[Object.keys(this.props.this_vector_list)][indexToSet]
                })
            }
        }
        this.highlightFirstCompound()
        var classDict = {48: 0, 49: 1, 50: 2, 51:3, 52:4, 53:5}
        if(keyCode in classDict) {
            var toBuyObj = {
                mol: this.props.to_query,
                smiles: this.props.highlightedCompound.smiles,
                vector: this.props.currentVector,
                class: classDict[keyCode]
            }
            if (keyCode === 48) {
                this.props.removeFromToBuyList(toBuyObj)
            } else{
                this.props.appendToBuyList(toBuyObj)
            }
        }
    }

    highlightFirstCompound() {
        if ( Object.keys(this.props.highlightedCompound).length === 0 && this.props.this_vector_list != undefined ) {
            if (Object.keys(this.props.this_vector_list).length > 0) {
                this.props.setHighlighted({index: 0, smiles: this.props.this_vector_list[Object.keys(this.props.this_vector_list)][0]})
            }
        }
    }

    componentDidMount() {
        this.updateTarget()
    }

    componentDidUpdate(){
        this.updateTarget()
    }

    componentWillReceiveProps( {keydown} ){
        if ( keydown.event ) {
            this.handleCursor(keydown.event.which);
        }
    }

    render() {
        return (
            <Row>
                <Col xs={0} md={0}>
                    <MolGroupList/>
                </Col>
                <Col xs={3} md={3}>
                    <NGLView div_id="summary_view" height="200px"/>
                    <MolGroupSlider/>
                    <MoleculeList style={{overflow: scroll}}/>
                </Col>
                <Col xs={5} md={5}>
                    <NGLView div_id="major_view" height="90%"/>
                    <NglViewerControls/>
                </Col>
                <Col xs={4} md={4}>
                    <SummaryView/>
                    <CompoundList/>
                    <HotspotList/>
                </Col>
            </Row>
        )
    }

}

function mapStateToProps(state) {
  return {
      this_vector_list: state.selectionReducers.present.this_vector_list,
      to_query: state.selectionReducers.present.to_query,
      highlightedCompound: state.selectionReducers.present.highlightedCompound,
      currentVector: state.selectionReducers.present.currentVector,
      currentCompoundClass: state.selectionReducers.present.currentCompoundClass,
  }
}
const mapDispatchToProps = {
    setTargetOn: apiActions.setTargetOn,
    setHighlighted: selectionActions.setHighlighted,
    appendToBuyList: selectionActions.appendToBuyList,
    removeFromToBuyList: selectionActions.removeFromToBuyList,
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Preview))
