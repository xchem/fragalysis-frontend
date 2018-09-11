/**
 * Created by abradley on 15/03/2018.
 */
import { Row, Well, Button} from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'
import CompoundView from './compoundView';
import * as selectionActions from "../actions/selectionActions";
import * as actions from "../actions/actonTypes";
import keydown from 'react-keydown';

const molStyle = {height: "400px",
    overflow:"scroll"}
const KEYS = [ 'left', 'right', '0', '1', '2', '3', '4', '5' ];
@keydown( KEYS )

class CompoundList extends React.Component {
    constructor(props) {
        super(props);
        this.handleCursor=this.handleCursor.bind(this);
        this.handleClassNaming = this.handleClassNaming.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.highlightFirstCompound = this.highlightFirstCompound.bind(this)
        this.colourClassBoxes = this.colourClassBoxes.bind(this)
        this.state = {
            currentCompoundClass: 1,
            compoundClasses: {1: "Blue", 2: "Red", 3: "Green", 4: "Purple", 5: "Apricot"},
        }
    }

    handleClassNaming(e){
        if (e.keyCode === 13) {
            var newClassDescription = {[e.target.id]: e.target.value};
            console.log('submit new class name ' + newClassDescription);
            var classDescription = this.props.compoundClasses;
            var descriptionToSet = Object.assign(classDescription, newClassDescription);
            this.setState(prevState => ({compoundClasses: descriptionToSet}));
            this.props.setCompoundClasses(descriptionToSet);
            var newCurrentClass = e.target.id;
            this.setState(prevState => ({currentCompoundClass: newCurrentClass}));
            this.props.setCurrentCompoundClass(e.target.id);
            this.colourClassBoxes();
        }
    }

    handleCursor(keyCode) {
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
                var indexToSet = Math.min(this.props.highlightedCompound["index"] + 1, this.props.this_vector_list[Object.keys(this.props.this_vector_list)].length - 1)
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

    getNum() {
        var tot_num=0;
        for(var key in this.props.to_select){
            tot_num+=this.props.to_select[key].length;
        }
        return tot_num;
    }

    highlightFirstCompound() {
        if ( Object.keys(this.props.highlightedCompound).length === 0 && this.props.this_vector_list != undefined ) {
            if (Object.keys(this.props.this_vector_list).length > 0) {
                this.props.setHighlighted({index: 0, smiles: this.props.this_vector_list[Object.keys(this.props.this_vector_list)][0]})
            }
        }
    }

    colourClassBoxes() {
        var colourList = {1: '#b3cde3', 2: '#fbb4ae', 3: '#ccebc5', 4: '#decbe4', 5: '#fed9a6'};
        for (var i in colourList) {
            if (!!document.getElementById(i.toString())) {
                var inputId = document.getElementById(i.toString());
                inputId.style.backgroundColor = colourList[i];
                inputId.style.border = "1px solid black"
                if ( this.props.currentCompoundClass === i ) {
                    inputId.style.border = "2px solid red"
                }
            }
        }
    }

    componentWillReceiveProps( {keydown} ){
        this.highlightFirstCompound();
        this.colourClassBoxes();
        if ( keydown.event ) {
            this.handleCursor(keydown.event.which);
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
            totArray.push(<input id="1" key="CLASS_1" defaultValue={this.props.compoundClasses[1]} onKeyDown={ this.handleClassNaming }></input>)
            totArray.push(<input id="2" key="CLASS_2" defaultValue={this.props.compoundClasses[2]} onKeyDown={ this.handleClassNaming }></input>)
            totArray.push(<input id="3" key="CLASS_3" defaultValue={this.props.compoundClasses[3]} onKeyDown={ this.handleClassNaming }></input>)
            totArray.push(<input id="4" key="CLASS_4" defaultValue={this.props.compoundClasses[4]} onKeyDown={ this.handleClassNaming }></input>)
            totArray.push(<input id="5" key="CLASS_5" defaultValue={this.props.compoundClasses[5]} onKeyDown={ this.handleClassNaming }></input>)
            for(var key in this.props.this_vector_list){
                var retArray = [];
                for (var ele in this.props.this_vector_list[key]){
                    var input_data = {}
                    input_data.smiles=this.props.this_vector_list[key][ele]
                    input_data.vector=key.split("_")[0]
                    input_data.mol=this.props.to_query
                    input_data.index=ele
                    input_data.class=this.props.currentCompoundClass
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
      this_vector_list: state.selectionReducers.present.this_vector_list,
      to_query: state.selectionReducers.present.to_query,
      highlightedCompound: state.selectionReducers.present.highlightedCompound,
      currentVector: state.selectionReducers.present.currentVector,
      compoundClasses: state.selectionReducers.present.compoundClasses,
      currentCompoundClass: state.selectionReducers.present.currentCompoundClass,
      to_select: state.selectionReducers.present.to_select,
  }
}
const mapDispatchToProps = {
    setHighlighted: selectionActions.setHighlighted,
    appendToBuyList: selectionActions.appendToBuyList,
    removeFromToBuyList: selectionActions.removeFromToBuyList,
    setCompoundClasses: selectionActions.setCompoundClasses,
    setCurrentCompoundClass: selectionActions.setCurrentCompoundClass,
}

export default connect(mapStateToProps, mapDispatchToProps)(CompoundList);
