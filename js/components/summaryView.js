/**
 * Created by abradley on 15/03/2018.
 */
import React from "react";
import JSZip from "jszip";
import {connect} from "react-redux";
import {Button, ButtonToolbar, Well, Col, Row} from "react-bootstrap";
import * as selectionActions from "../actions/selectionActions";
import * as nglLoadActions from "../actions/nglLoadActions";
import SummaryCmpd from "./SummaryCmpd";
import fetch from "cross-fetch";
import FileSaver from "file-saver";
import {DockingScripts} from "../utils/script_utils";

class SummaryView extends React.Component{
    constructor(props) {
        super(props);
        this.update = this.update.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.loadVectors = this.loadVectors.bind(this);
        this.handleDocking = this.handleDocking.bind(this);
        this.handleYankDuck = this.handleYankDuck.bind(this);
        this.getColour = this.getColour.bind(this);
        this.dockingScripts = new DockingScripts();
        // Number vectors and series to be incorporated later
        // this.vector_list;
        this.state = {list_len: 0, cost: 0, num_vectors: 0, num_series: 0, smiles: "", interaction_select: undefined}
    }

    update() {
        var old_state = this.state
        old_state.list_len = this.props.to_buy_list.length
        if (this.props.to_buy_list.length>0){
            old_state.cost = this.props.to_buy_list.length * 150.0 + 500.0
        }
        else{
            old_state.cost = 0.0
        }
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
        old_state.interaction_select = this.props.duck_yank_data["interaction"]
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
                counter+=this.props.to_select[key]["addition"].length
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
        var classColors = {1: "blue", 2: "red", 3: "green", 4: "purple", 5: "apricot"}
        var compoundClasses = this.props.compoundClasses;
        var outArray = [];
        var headerArray = ["smiles","mol","vector","classNumber","class","classColors"];
        outArray.push(headerArray)
        var reg_ex = new RegExp("Xe", 'g')
        for(var item in input_list){
            var newArray = [];
            newArray.push(input_list[item].smiles)
            newArray.push(input_list[item].mol)
            newArray.push(input_list[item].vector.replace(reg_ex,"*"))
            newArray.push(input_list[item].class)
            newArray.push(compoundClasses[input_list[item].class])
            newArray.push(classColors[input_list[item].class])
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

    generate_smiles(csvContent,input_list,delimiter){
        const rows = this.convert_data_to_list(input_list);
        rows.forEach(function(rowArray){
            let row = rowArray.join(delimiter);
            csvContent += row + "\n";
        });
        return csvContent;
    }

    // handleExport() {
    //     var csvContent = this.generate_smiles("data:text/csv;charset=utf-8,",this.props.to_buy_list,",");
    //     this.download_file(csvContent,"follow_ups.csv");
    // }

    async handleExport() {
        var zip = new JSZip();
        var dirName = this.props.targetOnName + "_follow_up_" + new Intl.DateTimeFormat('en-GB', timeOptions).format(Date.now()).replace(/\s/g, '-');
        var csvDir = zip.folder(dirName);
        var csvContent = this.generate_smiles("data:text/csv;charset=utf-8,",this.props.to_buy_list,",");
        csvDir.file("follow_ups.csv", csvContent)
        const content = await zip.generateAsync({type: "blob"});
        FileSaver.saveAs(content, dirName + ".zip");
    }

    getToBuyByVect(input_dict){
        var output_dict = {}
        for(var key in input_dict){
            var vector = input_dict[key].vector;
            var smiles = input_dict[key].smiles;
            var mol = input_dict[key].mol;

            if (mol in output_dict){

            }
            else{
                output_dict[mol] = {}
            }

            if(vector in output_dict[mol]){
                output_dict[mol][vector].push(smiles);
            }
            else{
                output_dict[mol][vector] = new Array();
                output_dict[mol][vector].push(smiles);
            }
        }
        return output_dict;
    }
    
    async handleYankDuck(){
        var interaction = this.props.duck_yank_data["interaction"];
        var complex_id = this.props.duck_yank_data["complex_id"];
        var url = window.location.protocol + "//" + window.location.host + "/api/molecules/" + complex_id.toString() + "/";
        const mol_response = await fetch(url);
        const mol_json = await mol_response.json();
        var prot_id = mol_json["prot_id"]
        var url = window.location.protocol + "//" + window.location.host + "/api/protpdb/" + prot_id + "/";
        const prot_response = await fetch(url);
        const prot_json = await prot_response.json();
        var url = window.location.protocol + "//" + window.location.host + "/api/proteins/" + prot_id + "/";
        const prot_data_response = await fetch(url);
        const prot_data_json = await prot_data_response.json();
        const prot_code = prot_data_json["code"];
        const pdb_data = prot_json["pdb_data"];
        const mol_data = mol_json["sdf_info"];
        // Turn these into server side
        var duck_yaml = this.dockingScripts.getDuckYaml(prot_code, interaction)
        var yank_yaml = this.dockingScripts.getYankYaml(prot_code)
        var f_name = prot_code + "_" + interaction + "_duck_yank";
        var zip = new JSZip();
        var tot_folder = zip.folder(f_name);
        tot_folder.file("duck.yaml",duck_yaml);
        tot_folder.file("yank.yaml",yank_yaml);
        tot_folder.file(prot_code + ".mol",mol_data);
        tot_folder.file(prot_code + "_apo.pdb",pdb_data);
        const content = await zip.generateAsync({type: "blob"});
        FileSaver.saveAs(content, f_name + ".zip");
    }

    async handleDocking() {
        // Url of the current molecule
        var url = window.location.protocol + "//" + window.location.host
            + "/api/protpdb/" + this.props.to_query_prot.toString() + "/";
        const response = await fetch(url);
        const json = await response.json();
        const pdb_data = json["pdb_data"];
        var reg_ex = new RegExp("Xe", 'g');
        // Get the Original molecule
        const orig_mol = this.props.to_query_sdf_info;
        // Get the elaborations and the vector(s)
        var to_buy_by_vect = this.getToBuyByVect(this.props.to_buy_list);
        var zip = new JSZip();
        var f_name = "docking_" +  this.props.target_on_name + "_" + new Date().getTime().toString();
        var tot_folder = zip.folder(f_name);
        var mol_counter = 0;
        for(var mol in to_buy_by_vect) {
            var mol_folder = tot_folder.folder("MOL_" + mol_counter.toString());
            mol_folder.file("SMILES",mol)
            mol_counter++;
            var vector_counter = 0;
            for (var vector in to_buy_by_vect[mol]) {
                // TODO - something more meaningful for this name
                // var dock_name = f_name;
                var smiles = to_buy_by_vect[mol][vector];
                var csvContent = ""
                smiles.forEach(function(smiles){
                        let row = [smiles,mol,vector].join("\t");
                        csvContent += row + "\n";
                    });
                var constraints = vector.split(".")
                for (var constraint_index in constraints) {
                    var constraint = constraints[constraint_index];
                    if (constraint.length < 8) {
                        continue;
                    }
                    var folder = mol_folder.folder("VECTOR_"+ vector_counter.toString());
                    var constrain_smiles = constraint.replace(reg_ex,"*")
                    folder.file("SMILES",constrain_smiles);
                    // Get the docking script
                    var prm_file = this.dockingScripts.getPrmFile();
                    var docking_script = this.dockingScripts.getDockingScript();
                    // Save as a zip
                    folder.file("recep.prm",prm_file);
                    folder.file("run.sh", docking_script);
                    folder.file("input.smi", csvContent);
                    folder.file("receptor.pdb", pdb_data);
                    folder.file("reference.sdf", orig_mol);
                }
                vector_counter++;
            }
        }
        const content = await zip.generateAsync({type: "blob"});
        FileSaver.saveAs(content, f_name + ".zip");
    }

    render() {
        var interaction_select = this.state.interaction_select == undefined ? "Not selected" : this.state.interaction_select

        return <div>
            <Well>
                <Row>
                <Col xs={6} md={6}>
                    <h5>Number picked: <b>{this.state.list_len}</b></h5>
                    <h5>Number vectors explored: <b>{this.state.num_vectors}</b></h5>
                    <h5>Number series explored: <b>{this.state.num_series}</b></h5>
                    <h5>Estimated cost: <b>£{this.state.cost}</b></h5>
                    <ButtonToolbar>
                        <Button bsSize="sm" bsStyle="success" onClick={this.handleExport}>Download CSV</Button>
                        <Button bsSize="sm" bsStyle="success" onClick={this.handleYankDuck}>Download Yank/Duck</Button>
                    </ButtonToolbar>
                    <h5>Selected Interaction: <b>{interaction_select}</b></h5>
                </Col>
                <Col xs={6} md={6}>
                    <SummaryCmpd height={150} width={150} key={"QUERY"} />
                </Col>
                </Row>
            </Well>
        </div>
    }
}


function mapStateToProps(state) {
  return {
      target_on_name: state.apiReducers.present.target_on_name,
      duck_yank_data: state.apiReducers.present.duck_yank_data,
      to_query_pk: state.selectionReducers.present.to_query_pk,
      to_query_sdf_info: state.selectionReducers.present.to_query_sdf_info,
      to_query_prot: state.selectionReducers.present.to_query_prot,
      to_buy_list: state.selectionReducers.present.to_buy_list,
      to_select: state.selectionReducers.present.to_select,
      this_vector_list: state.selectionReducers.present.this_vector_list,
      vector_list: state.selectionReducers.present.vector_list,
      querying: state.selectionReducers.present.querying,
      to_query: state.selectionReducers.present.to_query,
      compoundClasses: state.selectionReducers.present.compoundClasses,
  }
}

const mapDispatchToProps = {
    appendToBuyList: selectionActions.appendToBuyList,
    selectVector: selectionActions.selectVector,
    loadObject: nglLoadActions.loadObject
}

export default connect(mapStateToProps, mapDispatchToProps)(SummaryView);