/**
 * Created by abradley on 15/03/2018.
 */
import React from 'react';
import JSZip from 'jszip';
import { connect } from 'react-redux'
import { Button, Well, Col, Row } from 'react-bootstrap'
import * as selectionActions from '../actions/selectionActions'
import * as nglLoadActions from '../actions/nglLoadActions'
import CompoundList from './compoundList';
import SummaryCmpd from './SummaryCmpd';
import fetch from 'cross-fetch';
import FileSaver from 'file-saver';

class SummaryView extends React.Component{
    constructor(props) {
        super(props);
        this.list_len;
        this.update = this.update.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.loadVectors = this.loadVectors.bind(this);
        this.handleDocking = this.handleDocking.bind(this);
        this.handleYankDuck = this.handleYankDuck.bind(this);
        this.getColour = this.getColour.bind(this);
        this.selectAll = this.selectAll.bind(this);
        this.vector_list;
        // Number vectors and series to be incorporated later
        this.state = {list_len: 0, cost: 0, num_vectors: 0, num_series: 0, smiles: "", interaction_select: undefined}
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
        var headerArray = ["smiles","mol","vector"];
        outArray.push(headerArray)
        var reg_ex = new RegExp("Xe", 'g')
        for(var item in input_list){
            var newArray = [];
            newArray.push(input_list[item].smiles)
            newArray.push(input_list[item].mol)
            newArray.push(input_list[item].vector.replace(reg_ex,"*"))
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

    handleExport() {
        var csvContent = this.generate_smiles("data:text/csv;charset=utf-8,",this.props.to_buy_list,",");
        this.download_file(csvContent,"follow_ups.csv");
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
        var duck_yaml = 'prot_code: "'+prot_code+'"\n' +
        'prot_int: "'+interaction+'"\n' +
        'cutoff: 9\n' +
        'md_len: 0.5\n' +
        'init_velocity: 0.00001\n' +
        'num_smd_cycles: 2\n' +
            'distance: 2.5\n' +
        'gpu_id: "0"\n' +
        'apo_pdb_file: '+prot_code+'_apo.pdb\n' +
        'mol_file: '+prot_code+'.mol'
        var yank_yaml = "options:\n  minimize: yes\n  verbose: no\n  output_dir: sams-twostage-harmonic-dense\n  temperature: 300*kelvin\n  pressure: 1*atmosphere\n  switch_experiment_interval: 50\n  resume_setup: yes\n  resume_simulation: yes\n  processes_per_experiment: 1\n  hydrogen_mass: 3.0 * amu\n  checkpoint_interval: 50\n  alchemical_pme_treatment: exact \n\nmolecules:\n  prot:\n    filepath: no_buffer_altlocs.pdb\n  lig:\n    filepath: "+prot_code+"_params.mol2 \n    antechamber:\n      charge_method: bcc\n\nmcmc_moves:\n    langevin:\n        type: LangevinSplittingDynamicsMove\n        timestep: 4.0*femtosecond\n        splitting: 'V R R R O R R R V'\n        n_steps: 1250\n\nsamplers:\n    sams:\n        type: SAMSSampler\n        mcmc_moves: langevin\n        state_update_scheme: global-jump\n        flatness_threshold: 10.0\n        number_of_iterations: 200000\n        gamma0: 10.0\n        online_analysis_interval: null\n\nsolvents:\n  pme:\n    nonbonded_method: PME\n    switch_distance: 9*angstroms\n    nonbonded_cutoff: 10*angstroms\n    ewald_error_tolerance: 1.0e-4\n    clearance: 9*angstroms\n    positive_ion: Na+\n    negative_ion: Cl-\n    solvent_model: tip3p\n\nsystems:\n  prot-lig:\n    receptor: prot\n    ligand: lig\n    solvent: pme\n    leap:\n      parameters: [leaprc.protein.ff14SB, leaprc.gaff2, leaprc.water.tip3p]\n\nprotocols:\n  dense-protocol:\n    complex:\n      alchemical_path:\n        lambda_restraints:     [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.000, 1.00, 1.000, 1.00, 1.000, 1.00, 1.000, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]\n        lambda_electrostatics: [1.00, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60, 0.55, 0.50, 0.45, 0.40, 0.35, 0.30, 0.25, 0.20, 0.15, 0.10, 0.05, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.000, 0.00, 0.000, 0.00, 0.000, 0.00, 0.000, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]\n        lambda_sterics:        [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.90, 0.89, 0.88, 0.87, 0.86, 0.85, 0.84, 0.83, 0.82, 0.81, 0.80, 0.79, 0.78, 0.77, 0.76, 0.75, 0.74, 0.73, 0.72, 0.71, 0.70, 0.69, 0.68, 0.67, 0.66, 0.65, 0.64, 0.63, 0.62, 0.61, 0.60, 0.59, 0.58, 0.57, 0.56, 0.55, 0.54, 0.53, 0.52, 0.51, 0.50, 0.49, 0.48, 0.47, 0.46, 0.45, 0.44, 0.43, 0.42, 0.41, 0.40, 0.39, 0.38, 0.37, 0.36, 0.35, 0.34, 0.33, 0.32, 0.31, 0.30, 0.29, 0.28, 0.27, 0.26, 0.25, 0.24, 0.23, 0.22, 0.21, 0.20, 0.19, 0.18, 0.17, 0.16, 0.15, 0.14, 0.13, 0.12, 0.11, 0.10, 0.095, 0.09, 0.085, 0.08, 0.075, 0.07, 0.065, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.00]\n    solvent:\n      alchemical_path:\n        lambda_electrostatics: [1.00, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60, 0.55, 0.50, 0.45, 0.40, 0.35, 0.30, 0.25, 0.20, 0.15, 0.10, 0.05, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.000, 0.00, 0.000, 0.00, 0.000, 0.00, 0.000, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]\n        lambda_sterics:        [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.90, 0.89, 0.88, 0.87, 0.86, 0.85, 0.84, 0.83, 0.82, 0.81, 0.80, 0.79, 0.78, 0.77, 0.76, 0.75, 0.74, 0.73, 0.72, 0.71, 0.70, 0.69, 0.68, 0.67, 0.66, 0.65, 0.64, 0.63, 0.62, 0.61, 0.60, 0.59, 0.58, 0.57, 0.56, 0.55, 0.54, 0.53, 0.52, 0.51, 0.50, 0.49, 0.48, 0.47, 0.46, 0.45, 0.44, 0.43, 0.42, 0.41, 0.40, 0.39, 0.38, 0.37, 0.36, 0.35, 0.34, 0.33, 0.32, 0.31, 0.30, 0.29, 0.28, 0.27, 0.26, 0.25, 0.24, 0.23, 0.22, 0.21, 0.20, 0.19, 0.18, 0.17, 0.16, 0.15, 0.14, 0.13, 0.12, 0.11, 0.10, 0.095, 0.09, 0.085, 0.08, 0.075, 0.07, 0.065, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.00]\n\nexperiments:\n  sampler: sams\n  system: prot-lig\n  protocol: dense-protocol\n  restraint:\n    type: Harmonic"
        var f_name = prot_code + "_duck_yank";
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
                var dock_name = f_name;
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
                    const docking_script = "/usr/bin/obabel -imol /data/reference.sdf -h -O /data/reference_hydrogens.sdf\n" +
                        "/usr/bin/obabel -ismi /data/input.smi -h --gen3D -O /data/input_hydrogens.sdf\n" +
                        "/usr/bin/obabel -ipdb /data/receptor.pdb -O /data/receptor.mol2\n" +
                        '/rDock_2013.1_src/bin/sdtether /data/reference_hydrogens.sdf  /data/input_hydrogens.sdf /data/output.sdf "' + constrain_smiles + '"\n' +
                        "/rDock_2013.1_src/bin/rbcavity -was -d -r /data/recep.prm\n" +
                        "/rDock_2013.1_src/bin/rbdock -i /data/output.sdf -o /data/docked -r /data/recep.prm -p dock.prm -n 9"
                    const prm_file = "RBT_PARAMETER_FILE_V1.00\n" +
                        "TITLE "+dock_name+"\n" +
                        "RECEPTOR_FILE /data/receptor.mol2\n" +
                        "SECTION MAPPER\n" +
                        "\tSITE_MAPPER RbtLigandSiteMapper\n" +
                        "\tREF_MOL /data/reference_hydrogens.sdf\n" +
                        "\tRADIUS 6.0\n" +
                        "\tSMALL_SPHERE 1.0\n" +
                        "\tMIN_VOLUME 100\n" +
                        "\tMAX_CAVITIES 1\n" +
                        "\tVOL_INCR 0.0\n" +
                        "\tGRIDSTEP 0.5\n" +
                        "END_SECTION\n" +
                        "SECTION CAVITY\n" +
                        "\tSCORING_FUNCTION RbtCavityGridSF\n" +
                        "\tWEIGHT 1.0\n" +
                        "END_SECTION\n" +
                        "SECTION LIGAND\n" +
                        "\tTRANS_MODE TETHERED\n" +
                        "\tROT_MODE TETHERED\n" +
                        "\tDIHEDRAL_MODE FREE\n" +
                        "\tMAX_TRANS 1.0\n" +
                        "\tMAX_ROT 20.0\n" +
                        "END_SECTION"
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

        var interaction_select = this.state.interaction_select == undefined ? "Not selected" : this.state.interaction_select

        return <div>
            <Well>
                <Row>
                <Col xs={6} md={6}>
                    <h3>Number picked: <b>{this.state.list_len}</b></h3>
                    <h3>Number vectors explored: <b>{this.state.num_vectors}</b></h3>
                    <h3>Number series explored: <b>{this.state.num_series}</b></h3>
                    <h3>Estimated cost: <b>£{this.state.cost}</b></h3>
                    <Button bsSize="large" bsStyle="success" onClick={this.handleExport}>Export to CSV</Button>
                    <Button bsSize="large" bsStyle="success" onClick={this.handleDocking}>Download Docking</Button>
                    <h3>Selected Interaction: <b>{interaction_select}</b></h3>
                    <Button bsSize="large" bsStyle="success" onClick={this.handleYankDuck}>Download Yank/Duck</Button>
                </Col>
                <Col xs={6} md={6}>
                    <SummaryCmpd height={150} width={150} key={"QUERY"} />
                </Col>
                </Row>
            </Well>
            <Well>
                <h1><b>{this.props.querying ? "Loading...." : mol_string }</b></h1>
                <Button bsSize="large" bsStyle="success" onClick={this.selectAll}>Select All</Button>
                <CompoundList />
            </Well>
        </div>
    }
}


function mapStateToProps(state) {
  return {
      target_on_name: state.apiReducers.target_on_name,
      duck_yank_data: state.apiReducers.duck_yank_data,
      to_query_pk: state.selectionReducers.to_query_pk,
      to_query_sdf_info: state.selectionReducers.to_query_sdf_info,
      to_query_prot: state.selectionReducers.to_query_prot,
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