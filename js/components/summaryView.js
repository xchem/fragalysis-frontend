/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { connect } from 'react-redux';
import { Button, ButtonToolbar, Well, Col, Row } from 'react-bootstrap';
import * as nglLoadActions from '../actions/nglLoadActions';
import SummaryCmpd from './SummaryCmpd';
import fetch from 'cross-fetch';
import FileSaver from 'file-saver';
import { DockingScripts } from '../utils/script_utils';
import { VIEWS } from '../constants/constants';

const SummaryView = memo(
  ({
    target_on_name,
    duck_yank_data,
    to_query_sdf_info,
    to_query_prot,
    to_buy_list,
    to_select,
    vector_list,
    querying,
    to_query,
    compoundClasses,
    loadObject
  }) => {
    const dockingScripts = new DockingScripts();
    // Number vectors and series to be incorporated later
    const ref_vector_list = useRef();
    const [list_len, setList_len] = useState(0);
    const [cost, setCost] = useState(0);
    const [num_vectors, setNum_vectors] = useState(0);
    const [num_series, setNum_series] = useState(0);
    const [smiles, setSmiles] = useState('');
    const [interaction_select, setInteraction_select] = useState('');

    const getColour = useCallback(
      item => {
        var thisSmi = item.name.split('VECTOR_')[1];
        var counter = 0;
        for (var key in to_select) {
          var smi = key.split('_')[0];
          if (smi === thisSmi) {
            counter += to_select[key]['addition'].length;
          }
        }
        var colour = [1, 0, 0];

        if (counter > 50) {
          colour = [0, 1, 0];
          return { colour: colour, radius: 0.8 };
        }

        if (counter > 10) {
          colour = [0.5, 1, 0];
          return { colour: colour, radius: 0.6 };
        }

        if (counter > 0) {
          colour = [1, 1, 0];
          return { colour: colour, radius: 0.5 };
        }
        return { colour: colour, radius: 0.3 };
      },
      [to_select]
    );

    const loadVectors = useCallback(() => {
      // Colour and then load the vectors in
      if (to_query !== '') {
        vector_list.forEach(item =>
          loadObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, item, getColour(item)))
        );
      }
    }, [getColour, loadObject, to_query, vector_list]);

    const update = useCallback(() => {
      setList_len(to_buy_list.length);
      if (to_buy_list.length > 0) {
        setCost(to_buy_list.length * 150.0 + 500.0);
      } else {
        setCost(0.0);
      }

      let vector_list_temp = [];
      let mol_list_temp = [];
      for (var index in to_buy_list) {
        const item = to_buy_list[index];
        vector_list_temp.push(item.vector);
        mol_list_temp.push(item.mol);
      }
      setNum_vectors(new Set(vector_list_temp).size);
      setNum_series(new Set(mol_list_temp).size);
      setSmiles(to_query);
      setInteraction_select(duck_yank_data['interaction']);

      if (vector_list !== ref_vector_list.current && querying === false) {
        loadVectors();
        ref_vector_list.current = vector_list;
      }
    }, [duck_yank_data, loadVectors, querying, to_buy_list, to_query, vector_list]);

    useEffect(() => {
      update();
    }, [update]);

    const convert_data_to_list = input_list => {
      const classColors = {
        1: 'blue',
        2: 'red',
        3: 'green',
        4: 'purple',
        5: 'apricot'
      };
      const compoundClassesTemp = compoundClasses;
      let outArray = [];
      const headerArray = ['smiles', 'mol', 'vector', 'classNumber', 'class', 'classColors'];
      outArray.push(headerArray);
      const reg_ex = new RegExp('Xe', 'g');
      for (var item in input_list) {
        var newArray = [];
        newArray.push(input_list[item].smiles);
        newArray.push(input_list[item].mol);
        newArray.push(input_list[item].vector.replace(reg_ex, '*'));
        newArray.push(input_list[item].class);
        newArray.push(compoundClassesTemp[input_list[item].class]);
        newArray.push(classColors[input_list[item].class]);
        outArray.push(newArray);
      }
      return outArray;
    };

    const download_file = (file_data, file_name) => {
      var encodedUri = encodeURI(file_data);
      var link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', file_name);
      document.body.appendChild(link); // Required for FF
      link.click();
    };

    const generate_smiles = (csvContent, input_list, delimiter) => {
      const rows = convert_data_to_list(input_list);
      rows.forEach(function(rowArray) {
        let row = rowArray.join(delimiter);
        csvContent += row + '\n';
      });
      return csvContent;
    };

    const handleExport = () => {
      var csvContent = generate_smiles('data:text/csv;charset=utf-8,', to_buy_list, ',');
      download_file(csvContent, 'follow_ups.csv');
    };

    const getToBuyByVect = input_dict => {
      var output_dict = {};
      for (var key in input_dict) {
        var vector = input_dict[key].vector;
        var smilesTemp = input_dict[key].smiles;
        var mol = input_dict[key].mol;

        if (mol in output_dict) {
        } else {
          output_dict[mol] = {};
        }

        if (vector in output_dict[mol]) {
          output_dict[mol][vector].push(smilesTemp);
        } else {
          output_dict[mol][vector] = new Array();
          output_dict[mol][vector].push(smilesTemp);
        }
      }
      return output_dict;
    };

    const handleYankDuck = async () => {
      var interaction = duck_yank_data['interaction'];
      var complex_id = duck_yank_data['complex_id'];
      let url =
        window.location.protocol + '//' + window.location.host + '/api/molecules/' + complex_id.toString() + '/';
      const mol_response = await fetch(url);
      const mol_json = await mol_response.json();
      var prot_id = mol_json['prot_id'];
      url = window.location.protocol + '//' + window.location.host + '/api/protpdb/' + prot_id + '/';
      const prot_response = await fetch(url);
      const prot_json = await prot_response.json();
      url = window.location.protocol + '//' + window.location.host + '/api/proteins/' + prot_id + '/';
      const prot_data_response = await fetch(url);
      const prot_data_json = await prot_data_response.json();
      const prot_code = prot_data_json['code'];
      const pdb_data = prot_json['pdb_data'];
      const mol_data = mol_json['sdf_info'];
      // Turn these into server side
      var duck_yaml = dockingScripts.getDuckYaml(prot_code, interaction);
      var yank_yaml = dockingScripts.getYankYaml(prot_code);
      var f_name = prot_code + '_' + interaction + '_duck_yank';
      var zip = new JSZip();
      var tot_folder = zip.folder(f_name);
      tot_folder.file('duck.yaml', duck_yaml);
      tot_folder.file('yank.yaml', yank_yaml);
      tot_folder.file(prot_code + '.mol', mol_data);
      tot_folder.file(prot_code + '_apo.pdb', pdb_data);
      const content = await zip.generateAsync({ type: 'blob' });
      FileSaver.saveAs(content, f_name + '.zip');
    };

    const handleDocking = async () => {
      // Url of the current molecule
      var url =
        window.location.protocol + '//' + window.location.host + '/api/protpdb/' + to_query_prot.toString() + '/';
      const response = await fetch(url);
      const json = await response.json();
      const pdb_data = json['pdb_data'];
      var reg_ex = new RegExp('Xe', 'g');
      // Get the Original molecule
      const orig_mol = to_query_sdf_info;
      // Get the elaborations and the vector(s)
      var to_buy_by_vect = getToBuyByVect(to_buy_list);
      var zip = new JSZip();
      var f_name = 'docking_' + target_on_name + '_' + new Date().getTime().toString();
      var tot_folder = zip.folder(f_name);
      var mol_counter = 0;
      for (var mol in to_buy_by_vect) {
        var mol_folder = tot_folder.folder('MOL_' + mol_counter.toString());
        mol_folder.file('SMILES', mol);
        mol_counter++;
        var vector_counter = 0;
        for (var vector in to_buy_by_vect[mol]) {
          // TODO - something more meaningful for this name
          // var dock_name = f_name;
          const smilesTemp = to_buy_by_vect[mol][vector];
          var csvContent = '';
          smilesTemp.forEach(smilesItem => {
            let row = [smilesItem, mol, vector].join('\t');
            csvContent += row + '\n';
          });
          var constraints = vector.split('.');
          for (var constraint_index in constraints) {
            var constraint = constraints[constraint_index];
            if (constraint.length < 8) {
              continue;
            }
            var folder = mol_folder.folder('VECTOR_' + vector_counter.toString());
            var constrain_smiles = constraint.replace(reg_ex, '*');
            folder.file('SMILES', constrain_smiles);
            // Get the docking script
            var prm_file = dockingScripts.getPrmFile();
            var docking_script = dockingScripts.getDockingScript();
            // Save as a zip
            folder.file('recep.prm', prm_file);
            folder.file('run.sh', docking_script);
            folder.file('input.smi', csvContent);
            folder.file('receptor.pdb', pdb_data);
            folder.file('reference.sdf', orig_mol);
          }
          vector_counter++;
        }
      }
      const content = await zip.generateAsync({ type: 'blob' });
      FileSaver.saveAs(content, f_name + '.zip');
    };

    var interaction_selectComponent = interaction_select === undefined ? 'Not selected' : interaction_select;

    return (
      <div>
        <Well>
          <Row>
            <Col xs={6} md={6}>
              <h5>
                Number picked: <b>{list_len}</b>
              </h5>
              <h5>
                Number vectors explored: <b>{num_vectors}</b>
              </h5>
              <h5>
                Number series explored: <b>{num_series}</b>
              </h5>
              <h5>
                Estimated cost: <b>£{cost}</b>
              </h5>
              <ButtonToolbar>
                <Button bsSize="sm" bsStyle="success" onClick={handleExport}>
                  Download CSV (Chrome)
                </Button>
                <Button bsSize="sm" bsStyle="success" onClick={handleYankDuck}>
                  Download Yank/Duck
                </Button>
              </ButtonToolbar>
              <h5>
                Selected Interaction: <b>{interaction_selectComponent}</b>
              </h5>
            </Col>
            <Col xs={6} md={6}>
              <SummaryCmpd height={150} width={150} key={'QUERY'} />
            </Col>
          </Row>
        </Well>
      </div>
    );
  }
);

function mapStateToProps(state) {
  return {
    target_on_name: state.apiReducers.present.target_on_name,
    duck_yank_data: state.apiReducers.present.duck_yank_data,
    to_query_sdf_info: state.selectionReducers.present.to_query_sdf_info,
    to_query_prot: state.selectionReducers.present.to_query_prot,
    to_buy_list: state.selectionReducers.present.to_buy_list,
    to_select: state.selectionReducers.present.to_select,
    vector_list: state.selectionReducers.present.vector_list,
    querying: state.selectionReducers.present.querying,
    to_query: state.selectionReducers.present.to_query,
    compoundClasses: state.selectionReducers.present.compoundClasses
  };
}

const mapDispatchToProps = {
  loadObject: nglLoadActions.loadObject
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SummaryView);
