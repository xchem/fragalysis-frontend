/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { connect } from 'react-redux';
import * as nglLoadActions from '../reducers/ngl/nglActions';
import SummaryCmpd from './SummaryCmpd';
import FileSaver from 'file-saver';
import { DockingScripts } from '../utils/script_utils';
import { VIEWS } from '../constants/constants';
import { api } from '../utils/api';
import { Button } from './common/Inputs/Button';
import { Panel } from './common/Surfaces/Panel';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { CloudDownload } from '@material-ui/icons';
import { ComputeHeight } from '../utils/computeHeight';

const useStyles = makeStyles(theme => ({
  widthFitContent: {
    width: 'fit-content'
  }
}));

const SummaryView = memo(
  ({
    duck_yank_data,
    to_buy_list,
    to_select,
    vector_list,
    querying,
    to_query,
    compoundClasses,
    loadObject,
    setSummaryViewHeight,
    summaryViewHeight
  }) => {
    const classes = useStyles();
    const panelRef = useRef(undefined);
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
      <Panel ref={panelRef}>
        <ComputeHeight componentRef={panelRef.current} setHeight={setSummaryViewHeight} height={summaryViewHeight}>
          <Grid container justify="space-between">
            <Grid
              item
              container
              direction="column"
              justify="flex-start"
              alignItems="flex-start"
              className={classes.widthFitContent}
            >
              <Grid item>
                <Typography variant="subtitle2">Number picked: {list_len}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle2">Number vectors explored: {num_vectors}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle2">Number series explored: {num_series}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle2">Estimated cost: £{cost}</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle2">Selected Interaction: {interaction_selectComponent}</Typography>
              </Grid>
            </Grid>
            <Grid item>
              <SummaryCmpd height={150} width={150} key={'QUERY'} />
            </Grid>
          </Grid>
          <Button color="primary" onClick={handleExport} startIcon={<CloudDownload />}>
            Download CSV (Chrome)
          </Button>
          <Button color="primary" onClick={handleYankDuck} startIcon={<CloudDownload />}>
            Download Yank/Duck
          </Button>
        </ComputeHeight>
      </Panel>
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
