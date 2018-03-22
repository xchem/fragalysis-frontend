/**
 * Created by abradley on 15/03/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import { Button, Well } from 'react-bootstrap'
import * as selectionActions from '../actions/selectionActions'
import CompoundList from './compoundList';

class SummaryView extends React.Component{
    constructor(props) {
        super(props);
        this.list_len = undefined
        this.update = this.update.bind(this);
        this.handleExport = this.handleExport.bind(this);
        // Number vectors and series to be incorporated later
        this.state = {list_len: 0, cost: 0, num_vectors: 0, num_series: 0}
    }

    update() {
        var old_state = this.state
        old_state.list_len = this.props.to_buy_list.length
        old_state.cost = this.props.to_buy_list.length * 150.0 + 500.0
        var vector_list = new Array()
        var mol_list = new Array()
        for(var index in this.props.to_buy_list){
            var item = this.props.to_buy_list[index];
            vector_list.push(item["vector"])
            mol_list.push(item["mol"])
        }
        old_state.num_vectors = new Set(vector_list).size;
        old_state.num_series = new Set(mol_list).size;
        this.setState({ state: old_state});
    }
    componentDidMount() {
        this.update();
        setInterval(this.update,50);
    }

    convert_data_to_list(input_list){
        var outArray = new Array();
        var headerArray = ["smiles"];
        outArray.push(headerArray)
        for(var item in input_list){
            var newArray = new Array();
            newArray.push(input_list[item].smiles)
            outArray.push(newArray)
        }
        return outArray;
    }

    handleExport(){
        const rows = this.convert_data_to_list(this.props.to_buy_list);
        let csvContent = "data:text/csv;charset=utf-8,";
        rows.forEach(function(rowArray){
            let row = rowArray.join(",");
            csvContent += row + "\r\n";
        });
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "follow_ups.csv");
        document.body.appendChild(link); // Required for FF
        link.click();

    }

    render(){
        return <div>
            <Well>
                <h3>Number picked: {this.state.list_len}</h3>
                <h3>Number vectors explored: {this.state.num_vectors}</h3>
                <h3>Number series explored: {this.state.num_series}</h3>
                <h3>Estimated cost: £{this.state.cost}</h3>
            </Well>
            <Button bsStyle="success" onClick={this.handleExport}>Export to CSV</Button>
            <CompoundList/>
        </div>
    }
}
function mapStateToProps(state) {
  return {
      to_buy_list: state.selectionReducers.to_buy_list,
      to_select: state.selectionReducers.to_select,
      this_vector_list: state.selectionReducers.this_vector_list,
      querying: state.selectionReducers.querying,
      to_query: state.selectionReducers.to_query
  }
}
const mapDispatchToProps = {
    selectVector: selectionActions.selectVector
}

export default connect(mapStateToProps, mapDispatchToProps)(SummaryView);