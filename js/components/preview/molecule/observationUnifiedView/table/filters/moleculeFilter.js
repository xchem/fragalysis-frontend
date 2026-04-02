import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  makeStyles,
  Radio,
  RadioGroup,
  TextField
} from '@material-ui/core';
import { FilterWrapper } from './filterWrapper';
import { Search, SwitchAccessShortcut } from '@mui/icons-material';
import { Jsme } from '@loschmidt/jsme-react';
import { Button } from '@mui/material';
import { filterLHSCompounds } from '../../api';
import { useDispatch, useSelector } from 'react-redux';
import { setUnifiedFilterItem } from '../../../../../../reducers/selection/actions';
import { useRDKit } from '../../../../../rdkit/RDKitContext';
import { getFilterSmileQuery } from '../../../../../../reducers/selection/selectors';
import RichTooltip from '../../../../../tooltip/RichTooltip';
// import { Editor } from "ketcher-react";

const useStyles = makeStyles(theme => ({
  row: {
    padding: 2
  },
  smilesInput: {
    paddingLeft: 9
  },
  smilesLabel: {
    marginLeft: 7,
    fontSize: 12
  }
}));

export const MoleculeFilter = memo(({ onFilterChange }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { RDKitModule } = useRDKit();

  const SUBSTRUCTURE = 'substructure';
  const EXACT = 'exact';

  const targetOnName = useSelector(state => state.apiReducers.target_on_name);
  const targetOnId = useSelector(state => state.apiReducers.target_on);
  const targetList = useSelector(state => state.apiReducers.target_id_list);
  const targetAccessString = useSelector(state => state.targetReducers.currentProject?.target_access_string);
  const unifiedFilter = useSelector(state => state.selectionReducers.unifiedFilter);
  const filteredSmilesQuery = useSelector(state => getFilterSmileQuery(state));

  const targetOnTitle = useMemo(() => {
    const target = targetList.find(t => t.id === targetOnId);
    return target ? target.title : '';
  }, [targetList, targetOnId]);

  const initFilterValue = {
    matchType: 'exact',
    smarts: false,
    distinct: false,
    smiles: '',
    filteredCompounds: null,
    structureType: 'compound' // 'compound' | 'site_observation'
  };

  const [filterValue, setFilterValue] = useState(initFilterValue);
  const [editorSmiles, setEditorSmiles] = useState('');
  const [inputSmiles, setInputSmiles] = useState('');

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      if (unifiedFilter?.molecule) {
        setFilterValue(unifiedFilter.molecule);
        setEditorSmiles(unifiedFilter.molecule.smiles);
        setInputSmiles(unifiedFilter.molecule.smiles);
      } else {
        setFilterValue(initFilterValue);
        setEditorSmiles('');
        setInputSmiles('');
      }
      setInitialized(true);
    }
  }, [unifiedFilter.molecule, initFilterValue, initialized]);

  const handleFilterChange = (property, value) => {
    const newFilterValue = {
      ...filterValue,
      [property]: value
    };
    setFilterValue(newFilterValue);
    // onFilterChange(newFilterValue);
    return newFilterValue;
  };

  const handleApplyFilter = () => {
    filterLHSCompounds({
      target: targetOnTitle,
      target_access_string: targetAccessString,
      query: filterValue.smiles,
      structure_type: filterValue.structureType,
      is_substructure: filterValue.matchType === SUBSTRUCTURE,
      is_smarts: filterValue.smarts,
      use_chirality: filterValue.distinct
    })
      .then(filteredCompounds => {
        console.log(filteredCompounds);
        if (filteredCompounds) {
          const updatedFilter = handleFilterChange('filteredCompounds', filteredCompounds);
          onFilterChange(updatedFilter);
          dispatch(setUnifiedFilterItem('molecule', updatedFilter));
        }
      })
      .catch(err => console.log(err));
  };

  const handleSmilesChange = smiles => {
    console.log(smiles);
    if (smiles !== null) {
      handleFilterChange('smiles', smiles);
      setInputSmiles(smiles);
    } else {
      handleFilterChange('smiles', '');
      setInputSmiles('');
    }
  };

  const handleApplyInputSmiles = () => {
    handleFilterChange('smiles', inputSmiles);
    setEditorSmiles(inputSmiles);
  };

  const getOnHoverComponent = useCallback(() => {
    if (!RDKitModule || !filteredSmilesQuery) return null;
    const mol = RDKitModule.get_mol(filteredSmilesQuery);
    if (!mol) return null;
    const height = 120;
    const width = 150;
    const svg = mol.get_svg_with_highlights(JSON.stringify({ width, height }));
    mol.delete();
    return <div style={{ width, height }} dangerouslySetInnerHTML={{ __html: svg }}></div>;
  }, [RDKitModule, filteredSmilesQuery]);

  const [options, setOptions] = useState(['query,fullScreenIcon']);

  return (
    <FilterWrapper
      title="Filter (Molecule)"
      handleReset={() => {
        setEditorSmiles('');
        setInputSmiles('');
        setFilterValue(initFilterValue);
        onFilterChange(initFilterValue);
        dispatch(setUnifiedFilterItem('molecule', initFilterValue));
      }}
      isActive={filterValue.filteredCompounds !== null}
      onHoverComponent={getOnHoverComponent()}
    >
      {/** Options */}
      <Grid container direction="column">
        <Grid item xs>
          <FormControl>
            <RadioGroup value={filterValue.matchType} onChange={e => handleFilterChange('matchType', e.target.value)}>
              <FormControlLabel control={<Radio value={SUBSTRUCTURE} />} label="Substructure match" />
              <FormControlLabel control={<Radio value={EXACT} />} label="Exact match" />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs>
          <FormControlLabel
            control={
              <Checkbox checked={filterValue.smarts} onChange={e => handleFilterChange('smarts', e.target.checked)} />
            }
            label="SMARTs query"
          />
        </Grid>
        <Grid item xs>
          <FormControlLabel
            control={
              <Checkbox
                checked={filterValue.distinct}
                onChange={e => handleFilterChange('distinct', e.target.checked)}
              />
            }
            label="Treat stereoisomers as distinct"
          />
        </Grid>
        {/* <Grid item xs><Editor
                // ...rest of the properties
                disableMacromoleculesEditor
            /></Grid> */}
        <Grid item xs>
          {/* https://jsme-editor.github.io/dist/doc.html#OPTIONS */}
          {/* <Jsme height={320} width={370} /> */}
          <Jsme
            height={320}
            width={370}
            smiles={editorSmiles}
            options={options}
            onChange={smiles => handleSmilesChange(smiles)}
          />
          {/* <Jsme height={300} width={350} smiles="CC=O" onChange={handleEditorChange} /> */}
        </Grid>
        <Grid item xs>
          {/* <TextField value={options} placeholder="Enter options & re-open filter" onChange={(e) => setOptions(e.target.value)} /> */}
          {/* <a href={`https://jsme-editor.github.io/dist/doc.html#OPTIONS`} target="_blank" rel="noopener noreferrer">JSME Options</a>
                |
                <a href={`https://jsme-editor.github.io/help.html`} target="_blank" rel="noopener noreferrer">JSME Help</a> */}
          <FormControlLabel
            control={
              <TextField
                className={classes.smilesInput}
                value={inputSmiles}
                onChange={e => handleSmilesChange(e.target.value)}
              />
            }
            label="SMILES/SMARTs query"
            labelPlacement="start"
          />
          {/* <FormControlLabel control={<TextField value={smiles} />} label="SMILES/SMARTs query" labelPlacement="start" /> */}
          <RichTooltip path="moleculeFilter.updateEditor">
            <IconButton color="primary" onClick={handleApplyInputSmiles}>
              <SwitchAccessShortcut />
            </IconButton>
          </RichTooltip>
        </Grid>
        <Grid item xs>
          <RichTooltip path="moleculeFilter.applyFilter">
            <Button
              color="primary"
              // disabled={false}
              onClick={handleApplyFilter}
              startIcon={<Search />}
              variant="outlined"
              size="small"
            >
              Apply filter
            </Button>
          </RichTooltip>
          {filterValue.smiles && <span className={classes.smilesLabel}>for {filterValue.smiles}</span>}
        </Grid>
      </Grid>
    </FilterWrapper>
  );
});
