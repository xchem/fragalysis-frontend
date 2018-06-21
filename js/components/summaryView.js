/**
 * Created by abradley on 15/03/2018.
 */
import React from 'react';
import { connect } from 'react-redux'
import { Button, Well, Col, Row } from 'react-bootstrap'
import * as selectionActions from '../actions/selectionActions'
import * as nglLoadActions from '../actions/nglLoadActions'
import CompoundList from './compoundList';
import SummaryCmpd from './SummaryCmpd';
import UpdateOrientation from './updateOrientation';
import fetch from 'cross-fetch';

class SummaryView extends React.Component{
    constructor(props) {
        super(props);
        this.list_len;
        this.update = this.update.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.loadVectors = this.loadVectors.bind(this);
        this.getColour = this.getColour.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.vector_list;
        // Number vectors and series to be incorporated later
        this.state = {list_len: 0, cost: 0, num_vectors: 0, num_series: 0, smiles: ""}
    }

    update() {
        var old_state = this.state
        old_state.list_len = this.props.to_buy_list.length
        old_state.cost = this.props.to_buy_list.length * 150.0 + 500.0
        var vector_list = []
        var mol_list = []
        for(var index in this.props.to_buy_list){
            var item = this.props.to_buy_list[index];
            vector_list.push(item.vector)
            mol_list.push(item.mol)
        }
        old_state.num_vectors = new Set(vector_list).size;
        old_state.num_series = new Set(mol_list).size;
        old_state.smiles = this.props.to_query;
        this.setState({ state: old_state});
        if(this.props.vector_list!=this.vector_list && this.props.querying==false){
            this.loadVectors();
            this.vector_list = this.props.vector_list;
        }

    }
    
    getColour(item) {
        var thisSmi = item.name.split("VECTOR_")[1]
        var counter = 0
        for(var key in this.props.to_select){
            var smi = key.split("_")[0]
            if(smi==thisSmi){
                counter+=this.props.to_select[key].length
            }
        }
        var colour = [1,0,0]

        if (counter >50) {
            colour = [0, 1, 0]
            return {"colour": colour, "radius": 0.8}
        }

        if (counter >10) {
            colour = [0.5,1, 0]
            return {"colour": colour, "radius": 0.6}
        }

        if (counter>0){
            colour = [1,1,0]
            return {"colour": colour,"radius": 0.5}
        }
        return {"colour": colour,"radius": 0.3}
    }

    loadVectors() {
        // Colour and then load the vectors in
        if(this.props.to_query!="") {
            this.props.vector_list.forEach(item => this.props.loadObject(Object.assign({display_div: "major_view"}, item, this.getColour(item))));
        }
    }

    componentDidMount() {
        this.update();
        setInterval(this.update,50);
    }

    convert_data_to_list(input_list) {
        var outArray = [];
        var headerArray = ["mol","vector","smiles"];
        outArray.push(headerArray)
        var reg_ex = new RegExp("Xe", 'g')
        for(var item in input_list){
            var newArray = [];
            newArray.push(input_list[item].mol)
            newArray.push(input_list[item].vector.replace(reg_ex,"*"))
            newArray.push(input_list[item].smiles)
            outArray.push(newArray)
        }
        return outArray;
    }

    download_file(file_data, file_name) {
        var encodedUri = encodeURI(file_data);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", file_name);
        document.body.appendChild(link); // Required for FF
        link.click();
    }
    handleExport() {
        const rows = this.convert_data_to_list(this.props.to_buy_list);
        let csvContent = "data:text/csv;charset=utf-8,";
        rows.forEach(function(rowArray){
            let row = rowArray.join(",");
            csvContent += row + "\r\n";
        });
        this.download_file(csvContent,"follow_ups.csv")
    }

    handleDocking() {
        // Get the APO protein
        this.props.to_query_prot_id;
        // Get the Original molecule
        this.props.to_query_sdf_info;
        // Get the elaborations and the vector(s)
        this.props.to_buy_list;
        // Get the docking script
        const docking_script = "/usr/bin/obabel -imol /data/reference.sdf -h -O /data/reference_hydrogens.sdf\n" +
        "/usr/bin/obabel -imol /data/input.sdf -h --gen3D -O /data/input_hydrogens.sdf\n" +
        "/usr/bin/obabel -ipdb /data/receptor.pdb -O /data/receptor.mol2\n" +
        '/rDock_2013.1_src/bin/sdtether /data/reference_hydrogens.sdf  /data/input_hydrogens.sdf /data/output.sdf "ncs"\n' +
        "/rDock_2013.1_src/bin/rbcavity -was -d -r /data/recep.prm\n" +
        "/rDock_2013.1_src/bin/rbdock -i /data/output.sdf -o /data/docked.sdf -r /data/recep.prm -p dock.prm -n 9"
        // Save as a zip
        this.download_file(tot_content,"follow_ups.zip")
    }

    getNum() {
        var tot_num=0;
        for(var key in this.props.to_select){
            tot_num+=this.props.to_select[key].length;
        }
        return tot_num;
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

    render() {
        var numMols = this.getNum();
        var mol_string = "No mols found!!!";
        if(numMols){
            mol_string = "Compounds to pick. Mol total: " + numMols
        }
        if(this.props.to_query=="" || this.props.to_query==undefined) {
            mol_string = ""
        }
        return <div>
            <Well>
                <Row>
                <Col xs={6} md={6}>
                    <h3>Number picked: <b>{this.state.list_len}</b></h3>
                    <h3>Number vectors explored: <b>{this.state.num_vectors}</b></h3>
                    <h3>Number series explored: <b>{this.state.num_series}</b></h3>
                    <h3>Estimated cost: <b>£{this.state.cost}</b></h3>
                    <Button bsSize="large" bsStyle="success" onClick={this.handleExport}>Export to CSV</Button>
                </Col>
                <Col xs={6} md={6}>
                    <SummaryCmpd height={150} width={150} key={"QUERY"} />
                </Col>
                </Row>
            </Well>
            <Well>
                <h1><b>{this.props.querying ? "Loading...." : mol_string }</b></h1>
                <Button bsSize="large" bsStyle="success" onClick={this.selectAll}>Select All</Button>
                <UpdateOrientation />
                <CompoundList />
            </Well>
        </div>
    }
}
function mapStateToProps(state) {
  return {
      to_query_pk: state.selectionReducers.to_query_pk,
      to_query_sdf_info: state.selectionReducers.to_query_sdf_info,
      to_query_prot_id: state.selectionReducers.to_query_prot_id,
      to_buy_list: state.selectionReducers.to_buy_list,
      to_select: state.selectionReducers.to_select,
      this_vector_list: state.selectionReducers.this_vector_list,
      vector_list: state.selectionReducers.vector_list,
      querying: state.selectionReducers.querying,
      to_query: state.selectionReducers.to_query
  }
}

const mapDispatchToProps = {
    appendToBuyList: selectionActions.appendToBuyList,
    selectVector: selectionActions.selectVector,
    loadObject: nglLoadActions.loadObject
}

export default connect(mapStateToProps, mapDispatchToProps)(SummaryView);