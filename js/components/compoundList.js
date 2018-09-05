/**
 * Created by abradley on 15/03/2018.
 */
import { ListGroupItem, ListGroup, Col, Row, Well, Button} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import CompoundView from './compoundView';
import * as selectionActions from "../actions/selectionActions";
import * as actions from "../actions/actonTypes";
import keydown from 'react-keydown';

const molStyle = {height: "400px",
    overflow:"scroll"}
const KEYS = [ 'left', 'right', '1', '2', '3', '4', '5' ];
@keydown( KEYS )

class CompoundList extends React.Component {
    constructor(props) {
        super(props);
        this.handleCursor=this.handleCursor.bind(this);
        this.selectAll = this.selectAll.bind(this);
    }

    handleCursor(e) {
        var defaultSet = {index: 0, smiles: this.props.this_vector_list[Object.keys(this.props.this_vector_list)][0]};
        if (e.keyCode === 13) {
            var newClassDescription = {[e.target.id]: e.target.value};
            console.log('submit new class name ' + newClassDescription);
            var classDescription = this.props.compoundClasses;
            var descriptionToSet = Object.assign(classDescription, newClassDescription);
            this.props.setCompoundClasses(descriptionToSet);
        }
        if (e.keyCode === 37) {
            console.log('left cursor ' + e.target.value);
            this.props.highlightedCompound;
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
        } else if (e.keyCode === 39) {
            console.log('right cursor ' + e.target.value);
            if (Object.keys(this.props.highlightedCompound).length == 0) {
                this.props.setHighlighted(defaultSet)
            }
            else {
                var indexToSet = Math.min(this.props.highlightedCompound["index"] + 1, this.props.this_vector_list[Object.keys(this.props.this_vector_list)].length - 1)
                this.props.setHighlighted({
                    index: indexToSet,
                    smiles: this.props.this_vector_list[Object.keys(this.props.this_vector_list)][indexToSet]
                })
            }
        }
        // Handle nothing selected
        if (Object.keys(this.props.highlightedCompound).length == 0) {
            this.props.setHighlighted({index: 0, smiles: this.props.this_vector_list[Object.keys(this.props.this_vector_list)][0]});
        }
        // numbers 1-5 have keycodes 49-53
        var classDict = {49: 1, 50: 2, 51:3, 52:4, 53:5}
        // This might not work
        if(e.keyCode in classDict) {
            var toBuyObj = {
                mol: this.props.to_query,
                smiles: this.props.highlightedCompound.smiles,
                vector: this.props.currentVector,
                class: classDict[e.keyCode]
            }
            this.props.appendToBuyList(toBuyObj)
        }
    }

    selectAll() {
        for(var key in this.props.this_vector_list) {
            for (var index in this.props.this_vector_list[key]){
                var thisObj = {
                    smiles: this.props.this_vector_list[key][index],
                    vector: key.split("_")[0],
                    mol: this.props.to_query
                }
                this.props.appendToBuyList(thisObj);
            }
        }
    }

    getNum() {
        var tot_num=0;
        for(var key in this.props.to_select){
            tot_num+=this.props.to_select[key].length;
        }
        return tot_num;
    }

    componentWillRecieveProps( { keydown } ){
        if ( keydown.event ) {
            console.log( keydown.event.which );
        }
    }

    render() {
        var numMols = this.getNum();
        var mol_string = "No mols found!!!";
        if(numMols){
            mol_string = "Compounds to pick. Mol total: " + numMols
        }
        if(this.props.to_query=="" || this.props.to_query==undefined) {
            mol_string = ""
        }
        if (this.props.currentVector != undefined) {
            var totArray = []
            totArray.push(<input id="1" key="CLASS_1" defaultValue={this.props.compoundClasses[1]} onKeyDown={ this.handleCursor }></input>)
            totArray.push(<input id="2" key="CLASS_2" defaultValue={this.props.compoundClasses[2]} onKeyDown={ this.handleCursor }></input>)
            totArray.push(<input id="3" key="CLASS_3" defaultValue={this.props.compoundClasses[3]} onKeyDown={ this.handleCursor }></input>)
            totArray.push(<input id="4" key="CLASS_4" defaultValue={this.props.compoundClasses[4]} onKeyDown={ this.handleCursor }></input>)
            totArray.push(<input id="5" key="CLASS_5" defaultValue={this.props.compoundClasses[5]} onKeyDown={ this.handleCursor }></input>)
            for(var key in this.props.moleculeList){
                var retArray = [];
                for (var ele in this.props.moleculeList[key]){
                    var input_data = {}
                    input_data.smiles=this.props.moleculeList[key][ele]
                    input_data.vector=key.split("_")[0]
                    input_data.mol=this.props.thisMol
                    retArray.push(<CompoundView height={100} width={100} key={ele+"__"+key} data={input_data}/>)
                }
                totArray.push(<Row style={molStyle} key={key}>{retArray}</Row>)
            }
            return <Well>
                <h1><b>{this.props.querying ? "Loading...." : mol_string }</b></h1>
                <Button bsSize="large" bsStyle="success" onClick={this.selectAll}>Select All</Button>
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
      moleculeList: state.selectionReducers.present.this_vector_list,
      thisMol: state.selectionReducers.present.to_query,
      highlightedCompound: state.selectionReducers.present.highlightedCompound,
      this_vector_list: state.selectionReducers.present.this_vector_list,
      to_query: state.selectionReducers.present.to_query,
      currentVector: state.selectionReducers.present.currentVector,
      compoundClasses: state.selectionReducers.present.compoundClasses,
      to_select: state.selectionReducers.present.to_select,
  }
}
const mapDispatchToProps = {
    setHighlighted: selectionActions.setHighlighted,
    appendToBuyList: selectionActions.appendToBuyList,
    setCompoundClasses: selectionActions.setCompoundClasses,
}

export default connect(mapStateToProps, mapDispatchToProps)(CompoundList);
