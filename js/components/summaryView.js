/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { connect } from 'react-redux';
import * as nglLoadActions from '../reducers/ngl/nglLoadActions';
import SummaryCmpd from './SummaryCmpd';
import FileSaver from 'file-saver';
import { DockingScripts } from '../utils/script_utils';
import { VIEWS } from '../constants/constants';
import { api } from '../utils/api';
import { Button } from './common/inputs/button';
import { Paper } from './common/surfaces/paper';
import { Grid } from '@material-ui/core';

const SummaryView = memo(
  ({ duck_yank_data, to_buy_list, to_select, vector_list, querying, to_query, compoundClasses, loadObject }) => {
    const dockingScripts = new DockingScripts();
    // Number vectors and series to be incorporated later
    const ref_vector_list = useRef();
    const [list_len, setList_len] = useState(0);
    const [cost, setCost] = useState(0);
    const [num_vectors, setNum_vectors] = useState(0);
    const [num_series, setNum_series] = useState(0);
    const [smiles, setSmiles] = useState('');
    const [interaction_select, setInteraction_select] = useState('');
    const [state, setState] = useState();

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

    const handleYankDuck = async () => {
      var interaction = duck_yank_data['interaction'];
      var complex_id = duck_yank_data['complex_id'];
      let url =
        window.location.protocol + '//' + window.location.host + '/api/molecules/' + complex_id.toString() + '/';
      const mol_response = await api({ url }).catch(error => {
        setState(() => {
          throw error;
        });
      });
      const mol_json = await mol_response.data;
      var prot_id = mol_json['prot_id'];
      url = window.location.protocol + '//' + window.location.host + '/api/protpdb/' + prot_id + '/';
      const prot_response = await api({ url }).catch(error => {
        setState(() => {
          throw error;
        });
      });
      const prot_json = await prot_response.data;
      url = window.location.protocol + '//' + window.location.host + '/api/proteins/' + prot_id + '/';
      const prot_data_response = await api({ url }).catch(error => {
        setState(() => {
          throw error;
        });
      });
      const prot_data_json = await prot_data_response.data;
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

    var interaction_selectComponent = interaction_select === undefined ? 'Not selected' : interaction_select;

    return (
      <Paper>
        <Grid container>
          <Grid item xs={12} md={6}>
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
            <h5>
              Selected Interaction: <b>{interaction_selectComponent}</b>
            </h5>
          </Grid>
          <Grid item xs={12} md={6}>
            <SummaryCmpd height={150} width={150} key={'QUERY'} />
          </Grid>
        </Grid>
        <Grid container direction="row" justify="space-evenly" alignItems="center">
          <Grid item xs={12} md={6}>
            <Button color="primary" onClick={handleExport}>
              Download CSV (Chrome)
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button color="primary" onClick={handleYankDuck}>
              Download Yank/Duck
            </Button>
          </Grid>
        </Grid>
      </Paper>
    );
  }
);

function mapStateToProps(state) {
  return {
    duck_yank_data: state.apiReducers.present.duck_yank_data,
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

export default connect(mapStateToProps, mapDispatchToProps)(SummaryView);
