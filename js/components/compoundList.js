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
        this.colourClassBoxes = this.colourClassBoxes.bind(this);
        this.updateClassNames = this.updateClassNames.bind(this);
        this.state = {
            "compoundClasses": {
                1: "blue",
                2: "red",
                3: "green",
                4: "purple",
                5: "apricot"
            }
        }
    }

    updateClassNames(newNames){
        var newCompoundClasses = newNames;
        this.setState(prevState => ({compoundClasses: newCompoundClasses}))
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
            tot_num+=this.props.to_select[key]["addition"].length;
        }
        return tot_num;
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

    componentWillReceiveProps(nextProps){
        this.updateClassNames(nextProps.compoundClasses)
        this.colourClassBoxes(nextProps);
    }

    componentDidMount(){
        this.colourClassBoxes(this.props);
        this.updateClassNames(this.props.compoundClasses)
    }

    render() {
        var numMols = this.getNum();
        var mol_string = "No molecules found!";
        if(numMols){
            mol_string = "Compounds to pick. Mol total: " + numMols
        }
        if(this.props.to_query=="" || this.props.to_query==undefined) {
            mol_string = ""
        }
        if (this.props.to_query != undefined) {
            var totArray = []
            totArray.push(<p key={"breakup"}><br/></p>)
            totArray.push(<input id="1" key="CLASS_1" style={{ width:100 }} defaultValue={this.state.compoundClasses[1]} onKeyDown={ this.handleClassNaming }></input>)
            totArray.push(<input id="2" key="CLASS_2" style={{ width:100 }} defaultValue={this.state.compoundClasses[2]} onKeyDown={ this.handleClassNaming }></input>)
            totArray.push(<input id="3" key="CLASS_3" style={{ width:100 }} defaultValue={this.state.compoundClasses[3]} onKeyDown={ this.handleClassNaming }></input>)
            totArray.push(<input id="4" key="CLASS_4" style={{ width:100 }} defaultValue={this.state.compoundClasses[4]} onKeyDown={ this.handleClassNaming }></input>)
            totArray.push(<input id="5" key="CLASS_5" style={{ width:100 }} defaultValue={this.state.compoundClasses[5]} onKeyDown={ this.handleClassNaming }></input>)
            totArray.push(<p key={"breakdown"}><br/></p>)
            var retArray = [];
            for(var key in this.props.this_vector_list){
                var vector_smi = this.props.this_vector_list[key]["vector"]
                var change_list = this.props.this_vector_list[key]["addition"]
                for (var ele in change_list){
                    var data_transfer = change_list[ele]
                    var input_data = {}
                    input_data.smiles = data_transfer["end"]
                    // Set this back for now - because it's confusing
                    input_data.show_frag = data_transfer["end"]
                    input_data.vector = vector_smi
                    input_data.mol=this.props.to_query
                    input_data.index=ele
                    input_data.class=this.props.currentCompoundClass
                    retArray.push(<CompoundView height={100} width={100} key={ele+"__"+key} data={input_data}/>)
                }
            }
            totArray.push(<Row style={molStyle} key={"CMPD_ROW"}>{retArray}</Row>)
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
      compoundClasses: state.selectionReducers.present.compoundClasses,
      currentCompoundClass: state.selectionReducers.present.currentCompoundClass,
      to_select: state.selectionReducers.present.to_select,
      querying: state.selectionReducers.present.querying,
  }
}
const mapDispatchToProps = {
    setToBuyList: selectionActions.setToBuyList,
    appendToBuyList: selectionActions.appendToBuyList,
    setCompoundClasses: selectionActions.setCompoundClasses,
    setCurrentCompoundClass: selectionActions.setCurrentCompoundClass,
}

export default connect(mapStateToProps, mapDispatchToProps)(CompoundList);
