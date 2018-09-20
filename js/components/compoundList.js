/**
 * Created by abradley on 15/03/2018.
 */
import { Row, Well, Button} from 'react-bootstrap';
import React from 'react';
import {connect} from "react-redux";
import CompoundView from "./compoundView";
import * as selectionActions from "../actions/selectionActions";

const molStyle = {height: "400px",
    overflow:"scroll"}

class CompoundList extends React.Component {
    constructor(props) {
        super(props);
        this.handleClassNaming = this.handleClassNaming.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.clearAll = this.clearAll.bind(this);
        this.highlightFirstCompound = this.highlightFirstCompound.bind(this);
        this.colourClassBoxes = this.colourClassBoxes.bind(this);
    }

    handleClassNaming(e){
        if (e.keyCode === 13) {
            var newClassDescription = {[e.target.id]: e.target.value};
            console.log('submit new class name ' + newClassDescription);
            var classDescription = this.props.compoundClasses;
            var descriptionToSet = Object.assign(classDescription, newClassDescription);
            this.props.setCompoundClasses(descriptionToSet);
            this.props.setCurrentCompoundClass(e.target.id);
        }
    }

    selectAll() {
        for(var key in this.props.this_vector_list) {
            for (var index in this.props.this_vector_list[key]){
                var thisObj = {
                    smiles: this.props.this_vector_list[key][index],
                    vector: key.split("_")[0],
                    mol: this.props.to_query,
                    class:parseInt(this.props.currentCompoundClass)
                }
                this.props.appendToBuyList(thisObj);
            }
        }
    }

    clearAll() {
        this.props.setToBuyList([]);
    }

    getNum() {
        var tot_num=0;
        for(var key in this.props.to_select){
            tot_num+=this.props.to_select[key].length;
        }
        return tot_num;
    }

    highlightFirstCompound(props) {
        if ( Object.keys(props.highlightedCompound).length === 0 && props.this_vector_list != undefined ) {
            if (Object.keys(props.this_vector_list).length > 0) {
                props.setHighlighted({index: 0, smiles: props.this_vector_list[Object.keys(props.this_vector_list)][0]})
            }
        }
    }

    colourClassBoxes(props) {
        var colourList = {1: '#b3cde3', 2: '#fbb4ae', 3: '#ccebc5', 4: '#decbe4', 5: '#fed9a6'};
        for (var i in colourList) {
            if (!!document.getElementById(i)) {
                var inputId = document.getElementById(i);
                inputId.style.backgroundColor = colourList[i];
                inputId.style.border = "1px solid black"
                if ( props.currentCompoundClass === i ) {
                    inputId.style.border = "2px solid red"
                }
            }
        }
    }

    componentWillReceiveProps( nextProps ){
        this.highlightFirstCompound(nextProps);
        this.colourClassBoxes(nextProps);
    }

    componentDidMount(){
        this.highlightFirstCompound(this.props);
        this.colourClassBoxes(this.props);
    }

    render() {
        var numMols = this.getNum();
        var mol_string = "Loading...";
        if(numMols){
            mol_string = "Compounds to pick. Mol total: " + numMols
        }
        if(this.props.to_query=="" || this.props.to_query==undefined) {
            mol_string = ""
        }
        if (this.props.to_query != undefined) {
            var totArray = []
            totArray.push(<input id="1" key="CLASS_1" width={100} defaultValue={this.props.compoundClasses[1]} onKeyDown={ this.handleClassNaming }></input>)
            totArray.push(<input id="2" key="CLASS_2" width={100} defaultValue={this.props.compoundClasses[2]} onKeyDown={ this.handleClassNaming }></input>)
            totArray.push(<input id="3" key="CLASS_3" width={100} defaultValue={this.props.compoundClasses[3]} onKeyDown={ this.handleClassNaming }></input>)
            totArray.push(<input id="4" key="CLASS_4" width={100} defaultValue={this.props.compoundClasses[4]} onKeyDown={ this.handleClassNaming }></input>)
            totArray.push(<input id="5" key="CLASS_5" width={100} defaultValue={this.props.compoundClasses[5]} onKeyDown={ this.handleClassNaming }></input>)
            var retArray = [];
            for(var key in this.props.this_vector_list){
                for (var ele in this.props.this_vector_list[key]){
                    var input_data = {}
                    input_data.smiles=this.props.this_vector_list[key][ele]
                    input_data.vector=key.split("_")[0]
                    input_data.mol=this.props.to_query
                    input_data.index=ele
                    input_data.class=this.props.currentCompoundClass
                    retArray.push(<CompoundView height={100} width={100} key={ele+"__"+key} data={input_data}/>)
                }
            }
            totArray.push(<Row style={molStyle} key={key}>{retArray}</Row>)
            return <Well>
                <h3><b>{this.props.querying ? "Loading...." : mol_string }</b></h3>
                <Button bsSize="sm" bsStyle="success" onClick={this.selectAll}>Select All</Button>
                <Button bsSize="sm" bsStyle="success" onClick={this.clearAll}>Clear Selection</Button>
                <div>{totArray}</div>
            </Well>
        }
        else {
            return null;
        }
    }
}

function mapStateToProps(state) {
  return {
      this_vector_list: state.selectionReducers.present.this_vector_list,
      to_query: state.selectionReducers.present.to_query,
      highlightedCompound: state.selectionReducers.present.highlightedCompound,
      currentVector: state.selectionReducers.present.currentVector,
      compoundClasses: state.selectionReducers.present.compoundClasses,
      currentCompoundClass: state.selectionReducers.present.currentCompoundClass,
      to_select: state.selectionReducers.present.to_select,
      objectsInView: state.nglReducers.present.objectsInView,
      querying: state.selectionReducers.present.querying,
  }
}
const mapDispatchToProps = {
    setHighlighted: selectionActions.setHighlighted,
    setToBuyList: selectionActions.setToBuyList,
    appendToBuyList: selectionActions.appendToBuyList,
    removeFromToBuyList: selectionActions.removeFromToBuyList,
    setCompoundClasses: selectionActions.setCompoundClasses,
    setCurrentCompoundClass: selectionActions.setCurrentCompoundClass,
}

export default connect(mapStateToProps, mapDispatchToProps)(CompoundList);
