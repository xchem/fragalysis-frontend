/**
 * Created by abradley on 14/03/2018.
 */
import React, { useEffect, memo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearDatasetSettings, getInspirationsForMol, initializeDatasetFilter } from './redux/dispatchActions';
import { setExpandCompoundSets, setDataset, setSelectedDatasetIndex, setUpdatedDatasets } from './redux/actions';
import DatasetMoleculeList from './datasetMoleculeList';
import { makeStyles, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from '@material-ui/core';
import { Panel } from '../common/Surfaces/Panel';
import Radio from '@material-ui/core/Radio';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import SearchField from '../common/Components/SearchField';
import { base_url } from '../routes/constants';
import { METHOD, api } from '../../utils/api';
import { compoundsColors } from '../preview/compounds/redux/constants';

const useStyles = makeStyles(theme => ({
  table: {
    tableLayout: 'auto',
    marginTop: '6px',
    overflow: 'auto'
  },
  tableCell: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    padding: 0
  },
  search: {
    width: 140,
    paddingTop: '5px',
    margin: theme.spacing(1),
    '& .MuiInputBase-root': {
      color: 'white'
    },
    '& .MuiInput-underline:before': {
      borderBottomColor: 'white'
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: 'white'
    }
  },
  chip: {
    margin: theme.spacing(1) / 2
  },
  sortButton: {
    width: '0.75em',
    height: '0.75em',
    padding: '0px'
  },
  downloadIcon: {
    cursor: 'pointer'
  }
}));

export const CompoundSetList = () => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const selectedDatasetIndex = useSelector(state => state.datasetsReducers.selectedDatasetIndex);
  const customDatasets = useSelector(state => state.datasetsReducers.datasets);
  const updatedDatasets = useSelector(state => state.datasetsReducers.updatedDatasets);
  const scoreDatasetMap = useSelector(state => state.datasetsReducers.scoreDatasetMap);
  const moleculeLists = useSelector(state => state.datasetsReducers.moleculeLists);

  const allInspirations = useSelector(state => state.datasetsReducers.allInspirations);
  const compoundColors = useSelector(state => state.datasetsReducers.compoundColorByDataset);

  const blueInput = useSelector(state => state.previewReducers.compounds[compoundsColors.blue.key]);
  const redInput = useSelector(state => state.previewReducers.compounds[compoundsColors.red.key]);
  const greenInput = useSelector(state => state.previewReducers.compounds[compoundsColors.green.key]);
  const purpleInput = useSelector(state => state.previewReducers.compounds[compoundsColors.purple.key]);
  const apricotInput = useSelector(state => state.previewReducers.compounds[compoundsColors.apricot.key]);
  const targetName = useSelector(state => state.apiReducers.target_on_name);

  const inputs = {
    [compoundsColors.blue.key]: blueInput,
    [compoundsColors.red.key]: redInput,
    [compoundsColors.green.key]: greenInput,
    [compoundsColors.purple.key]: purpleInput,
    [compoundsColors.apricot.key]: apricotInput
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const [searchString, setSearchString] = useState(null);
  const [defaultSelectedValue, setDefaultSelectedValue] = useState();

  /**
   * Get common value of score defined in header molecule and not in individual molecule
   *
   * @param {*} datasetID
   * @param {*} scoreName
   * @returns {string}
   */
  const getCommonScore = useCallback(
    (datasetID, scoreName) => {
      let value = '';
      if (
        datasetID &&
        scoreDatasetMap.hasOwnProperty(datasetID) &&
        scoreDatasetMap[datasetID].hasOwnProperty(scoreName)
      ) {
        value = scoreDatasetMap[datasetID][scoreName].description;
      }
      return value;
    },
    [scoreDatasetMap]
  );

  /**
   * Download molecule list of given dataset as CSV file
   *
   * @param {*} datasetID
   */
  const downloadCSV = datasetID => {
    const listOfMols = [];
    const moleculeList = moleculeLists[datasetID] || [];

    let maxNumOfInspirations = 0;
    moleculeList.forEach(cmp => {
      const inspirations = getInspirationsForMol(allInspirations, datasetID, cmp.id);
      if (inspirations?.length > maxNumOfInspirations) {
        maxNumOfInspirations = inspirations.length;
      }
    });

    let colorsTemplate = {};
    moleculeList.forEach(compound => {
      let shoppingCartColors = [];
      const cmpColorsForDataset = compoundColors[datasetID];
      if (cmpColorsForDataset) {
        shoppingCartColors = cmpColorsForDataset[compound.id];
        shoppingCartColors?.forEach(color => {
          if (!colorsTemplate.hasOwnProperty(color)) {
            colorsTemplate[color] = '';
            if (inputs.hasOwnProperty(color) && inputs[color]) {
              colorsTemplate[`${color}-text`] = inputs[color];
            }
          }
        });
      }
    });

    moleculeList.forEach(molecule => {
      let molObj = {};

      molObj['smiles'] = molecule.smiles;
      molObj['name'] = molecule.name;

      if (molecule.hasOwnProperty('numerical_scores')) {
        Object.keys(molecule.numerical_scores).forEach(key => {
          molObj[key] = molecule.numerical_scores[key];
        });
      }
      if (molecule.hasOwnProperty('text_scores')) {
        Object.keys(molecule.text_scores).forEach(key => {
          molObj[key] = molecule.text_scores[key];
        });
      }

      if (maxNumOfInspirations) {
        const inspirations = getInspirationsForMol(allInspirations, datasetID, molecule.id);
        for (let i = 0; i < maxNumOfInspirations; i++) {
          if (inspirations?.[i]) {
            molObj[`inspiration_${i + 1}`] = inspirations[i].code;
          } else {
            molObj[`inspiration_${i + 1}`] = '';
          }
        }
      }

      let shoppingCartColors = [];

      const cmpColorsForDataset = compoundColors[datasetID];
      if (cmpColorsForDataset) {
        shoppingCartColors = cmpColorsForDataset[molecule.id];
        let colorsTemplateCopy = { ...colorsTemplate };
        shoppingCartColors?.forEach(color => {
          colorsTemplateCopy[color] = true;
        });

        Object.keys(colorsTemplateCopy)
          .filter(key => key.includes('-text'))
          .forEach(key => {
            const color = key.split('-')[0];
            if (colorsTemplateCopy.hasOwnProperty(color) && !colorsTemplateCopy[color]) {
              colorsTemplateCopy[key] = '';
            }
          });

        molObj = { ...molObj, ...colorsTemplateCopy };
      }

      listOfMols.push(molObj);
    });

    const fileName = `${datasetID}.csv`;
    const reqObj = { title: datasetID, filename: fileName, dict: listOfMols };
    const jsonString = JSON.stringify(reqObj);

    api({
      url: `${base_url}/api/dicttocsv/`,
      method: METHOD.POST,
      data: jsonString
    }).then(resp => {
      var anchor = document.createElement('a');
      anchor.href = `${base_url}/api/dicttocsv/?file_url=${resp.data['file_url']}`;
      anchor.target = '_blank';
      anchor.download = `${fileName}`; //'download';
      anchor.click();
    });
  };

  useEffect(() => {
    if (selectedDatasetIndex === 0) {
      const filteredDataset = searchString
        ? customDatasets.filter(dataset => dataset.title.toLowerCase().includes(searchString.toLowerCase()))
        : customDatasets;
      const newDataset = filteredDataset.map((dataSet, index) =>
        index === 0 ? { ...dataSet, visibility: true } : { ...dataSet, visibility: false }
      );
      setDefaultSelectedValue(newDataset);
      dispatch(setUpdatedDatasets(newDataset));
    }
  }, [customDatasets, dispatch, selectedDatasetIndex, searchString]);

  const handleExpandedChange = event => {
    if (event) {
      setIsExpanded(true);
      dispatch(setExpandCompoundSets(true));
    } else {
      setIsExpanded(false);
      dispatch(setExpandCompoundSets(false));
    }
  };

  const handleChangeVisibility = index => {
    const filteredDataset = searchString
      ? customDatasets.filter(dataset => dataset.title.toLowerCase().includes(searchString.toLowerCase()))
      : customDatasets;
    const newDataset = filteredDataset.map((dataSetValue, i) =>
      i === index ? { ...dataSetValue, visibility: true } : { ...dataSetValue, visibility: false }
    );

    dispatch(setSelectedDatasetIndex(index, index, index, index));
    dispatch(setUpdatedDatasets(newDataset));
  };

  const actualDataset = updatedDatasets === undefined ? defaultSelectedValue : updatedDatasets;
  return (
    <>
      <Panel
        onExpandChange={useCallback(handleExpandedChange, [dispatch])}
        hasHeader
        hasExpansion
        bodyOverflow
        defaultExpanded
        title="Compound sets"
        style={{ maxHeight: '150px', height: isExpanded === true ? '100%' : '30px', overflow: 'auto' }}
        headerActions={[
          <SearchField
            placeholder={'Search compound'}
            className={classes.search}
            id="search-compounds-sets"
            onChange={setSearchString}
            searchString={searchString ?? ''}
          />
        ]}
      >
        <Table className={classes.table}>
          <TableHead>
            <TableRow style={{ padding: 0 }}>
              <TableCell style={{ width: 25, padding: 0 }}>{/* Select */}</TableCell>
              <TableCell style={{ width: 60, padding: 0 }}>Name</TableCell>
              <TableCell style={{ width: 15, padding: 0 }}>#</TableCell>
              <TableCell style={{ width: 70, padding: 0 }}>Submitter</TableCell>
              <TableCell style={{ width: 55, padding: 0 }}>Institution</TableCell>
              <TableCell style={{ width: 60, padding: 0 }}>Date</TableCell>
              <TableCell style={{ width: 70, padding: 0 }}>Method</TableCell>
              <TableCell style={{ width: 30, padding: 0 }}>CSV</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {actualDataset?.map((dataset, index) => {
              const moleculeList = moleculeLists[dataset.id] || [];
              return (
                <TableRow key={index} style={{ height: 10 }}>
                  <TableCell style={{ padding: 0 }}>
                    <Radio
                      onClick={() => {
                        handleChangeVisibility(index);
                      }}
                      checked={dataset.visibility}
                      value={true}
                      name="radio-button-demo"
                      style={{ width: 25, padding: 0 }}
                    />
                  </TableCell>
                  <Tooltip title={dataset.title}>
                    <TableCell className={classes.tableCell} style={{ maxWidth: 60 }} key={dataset.id}>
                      {/* {dataset.title.length > 13 ? dataset.title.slice(0, 13) + '...' : dataset.title} */}
                      {dataset.title}
                    </TableCell>
                  </Tooltip>
                  <Tooltip title="Number of compounds">
                    <TableCell className={classes.tableCell} style={{ maxWidth: 15 }}>
                      {moleculeList.length}
                    </TableCell>
                  </Tooltip>
                  <Tooltip title={getCommonScore(dataset.id, 'submitter_name')}>
                    <TableCell className={classes.tableCell} style={{ maxWidth: 100 }}>
                      {getCommonScore(dataset.id, 'submitter_name')}
                    </TableCell>
                  </Tooltip>
                  <Tooltip title={getCommonScore(dataset.id, 'submitter_institution')}>
                    <TableCell className={classes.tableCell} style={{ maxWidth: 70 }}>
                      {getCommonScore(dataset.id, 'submitter_institution')}
                    </TableCell>
                  </Tooltip>
                  <Tooltip title={getCommonScore(dataset.id, 'generation_date')}>
                    <TableCell className={classes.tableCell} style={{ maxWidth: 60 }}>
                      {getCommonScore(dataset.id, 'generation_date')}
                    </TableCell>
                  </Tooltip>
                  <Tooltip title={getCommonScore(dataset.id, 'method')}>
                    <TableCell className={classes.tableCell} style={{ maxWidth: 150 }}>
                      {getCommonScore(dataset.id, 'method')}
                    </TableCell>
                  </Tooltip>
                  <TableCell style={{ padding: 0 }}>
                    <Tooltip title="Download as CSV">
                      <CloudDownloadOutlinedIcon
                        className={classes.downloadIcon}
                        onClick={() => downloadCSV(dataset.id)}
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Panel>
    </>
  );
};
