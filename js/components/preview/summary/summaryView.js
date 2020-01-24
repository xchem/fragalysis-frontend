/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CmpdSummaryImage } from './CmpdSummaryImage';
import { Button } from '../../common/Inputs/Button';
import { Panel } from '../../common/Surfaces/Panel';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { CloudDownload } from '@material-ui/icons';
import { ComputeSize } from '../../../utils/computeSize';
import { downloadAsYankDuck } from './redux/dispatchAction';
import { isEmpty } from 'lodash';

const useStyles = makeStyles(theme => ({
  widthFitContent: {
    width: 'fit-content'
  }
}));

export const SummaryView = memo(({ setSummaryViewHeight, summaryViewHeight }) => {
  const classes = useStyles();
  const panelRef = useRef(undefined);
  const dispatch = useDispatch();
  const duck_yank_data = useSelector(state => state.apiReducers.present.duck_yank_data);
  const to_buy_list = useSelector(state => state.selectionReducers.present.to_buy_list);
  const to_query = useSelector(state => state.selectionReducers.present.to_query);
  const compoundClasses = useSelector(state => state.selectionReducers.present.compoundClasses);

  // Number vectors and series to be incorporated later
  const [list_len, setList_len] = useState(0);
  const [cost, setCost] = useState(0);
  const [num_vectors, setNum_vectors] = useState(0);
  const [num_series, setNum_series] = useState(0);
  const [smiles, setSmiles] = useState('');
  const [interaction_select, setInteraction_select] = useState('');
  const [state, setState] = useState();

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
  }, [duck_yank_data, to_buy_list, to_query]);

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

  const interaction_selectComponent = interaction_select === undefined ? 'Not selected' : interaction_select;

  return (
    <Panel ref={panelRef}>
      <ComputeSize componentRef={panelRef.current} setHeight={setSummaryViewHeight} height={summaryViewHeight}>
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
            <CmpdSummaryImage />
          </Grid>
        </Grid>
        <Button color="primary" onClick={handleExport} startIcon={<CloudDownload />}>
          Download CSV (Chrome)
        </Button>
        <Button
          color="primary"
          onClick={() =>
            dispatch(downloadAsYankDuck()).catch(error => {
              setState(() => {
                throw error;
              });
            })
          }
          startIcon={<CloudDownload />}
          disabled={isEmpty(duck_yank_data)}
        >
          Download Yank/Duck
        </Button>
      </ComputeSize>
    </Panel>
  );
});
