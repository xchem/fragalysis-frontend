import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import MoleculeListSortFilterItem from './moleculeListSortFilterItem';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  button: {
    fontSize: 10,
  },
  title: {
    fontSize: 22,
  },
  applyButton: {
    borderColor: '#009000',
    color: '#009000',
    '&:hover': {
      backgroundColor: '#E3EEDA',
      borderColor: '#003f00',
      color: '#003f00',
    }
  },
  numberOfHits: {
    flexGrow: 1,
  },
  gridItemHeader: {
    height: '32px',
    fontSize: '12px',
    lineHeight: 1,
    color: '#7B7B7B',
    fontWeight: 'bold',
  },
  centered: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  property: {
    fontSize: '10px',
    color: '#000',
  },
  min: {
    fontSize: '10px',
    color: '#7B7B7B',
  },
});

const widthPrio = 50;
const widthOrder = 60;
const widthProperty = 200;
const widthMin = 30;
const widthSlider = 170;

const MOL_ATTR = {
  MW: { key: 'MW', name: 'Molecular weight (MW)', isFloat: true},
  LOGP: { key: 'logP', name: 'logP', isFloat: true },
  TPSA: { key: 'TPSA', name: 'Topological polar surface area (TPSA)', isFloat: true },
  HA: { key: 'HA', name: 'Heavy atom count', isFloat: false },
  HACC: { key: 'Hacc', name: '# H-bond acceptors (Hacc)', isFloat: false },
  HDON: { key: 'Hdon', name: '# H-bond donors (Hdon)', isFloat: false },
  ROTS: { key: 'Rots', name: '# Rotatable bonds (Rots)', isFloat: false },
  RINGS: { key: 'Rings', name: '# rings (rings)', isFloat: false },
  VELEC: { key: 'Velec', name: '# valence electrons (velec)', isFloat: false },
  NCPD: { key: '#cpd', name: '# available follow-up cmpds. (#cpd)', isFloat: false },
}

const getFilteredMoleculesCount = (molecules, filterSettings) => {
  let count = 0;
  for (let molecule of molecules) {
    let add = true; // By default molecule passes filter
    for (let attr of Object.values(MOL_ATTR)) {
      const lowAttr = attr.key.toLowerCase();
      const attrValue = molecule[lowAttr];
      if(attrValue < filterSettings[attr.key].minValue || attrValue > filterSettings[attr.key].maxValue) {
        add = false;
        break; // Do not loop over other attributes
      }
    }
    if (add) {
      count = count + 1;
    }
  }
  return count;
}

const filterMolecules = (molecules, filterSettings) => {
  // 1. Filter
  let filteredMolecules = [];
  for (let molecule of molecules) {
    let add = true; // By default molecule passes filter
    for (let attr of Object.values(MOL_ATTR)) {
      const lowAttr = attr.key.toLowerCase();
      const attrValue = molecule[lowAttr];
      if(attrValue < filterSettings[attr.key].minValue || attrValue > filterSettings[attr.key].maxValue) {
        add = false;
        break; // Do not loop over other attributes
      }
    }
    if (add) {
      filteredMolecules.push(molecule);
    }
  }

  // 2. Sort

  return filteredMolecules;
}

exports.filterMolecules = filterMolecules;

export default function MoleculeListSortFilterDialog(props) {
  const { handleClose, molGroupSelection, cachedMolList, filterSettings, handleFilterActive } = props;
  let classes = useStyles();

  const getListedMolecules = () => {
    let molecules = [];
    for ( let molgroupId of molGroupSelection) {
      // Selected molecule groups
      const molGroup = cachedMolList[molgroupId];
      if (molGroup) { 
        molecules = molecules.concat(molGroup.results);
      } else {
        console.log(`Molecule group ${molgroupId} not found in cached list`);
      }
    }

    return molecules;
  }

  const initialize = () => {
    let initObject = {};
    for (let attr of Object.values(MOL_ATTR)) {
      const lowAttr = attr.key.toLowerCase();
      let minValue = -999999;
      let maxValue  = 0;
      for (let molecule of getListedMolecules()) {
        const attrValue = molecule[lowAttr];
        if (attrValue > maxValue) maxValue = attrValue;
        if (minValue === -999999) minValue = maxValue;
        if (attrValue < minValue) minValue = attrValue;
      }

      initObject[attr.key] = { priority: 0, order: 1, minValue: minValue, maxValue: maxValue, isFloat: attr.isFloat }
    }
    return initObject;
  }

  const handleItemChange = (key) => (setting) => {
    handleFilterActive(true);
    let newFilter = Object.assign({}, filter);
    newFilter[key] = setting;
    setFilter(newFilter);
    setFilteredCount(getFilteredMoleculesCount(getListedMolecules(), newFilter));
  }

  const handleClear = () => {
    const resetFilter = initialize();
    setFilter(resetFilter);
    setFilteredCount(getFilteredMoleculesCount(getListedMolecules(), resetFilter));
    handleFilterActive(false);
  }

  const [filter, setFilter] = useState(!!filterSettings ? filterSettings : initialize());
  const [initState] = useState(initialize());
  const [filteredCount, setFilteredCount] = useState(getFilteredMoleculesCount(getListedMolecules(), filter));

  return (
    <Dialog open={true} aria-labelledby="form-dialog-title">
      <DialogTitle classes={{root: classes.title}} disableTypography id="form-dialog-title"><h4>Sort and filter</h4></DialogTitle>
      <DialogContent>
        <Grid container>
          <Grid container item className={classes.gridItemHeader}>
            <Grid item className={classes.centered} style={{width: widthPrio}}>priority</Grid>
            <Grid item className={classes.centered} style={{width: widthOrder}}><div style={{textAlign: 'center'}}>order<br/><span style={{fontSize: 'smaller'}}>(up/down)</span></div></Grid>
            <Grid item className={classes.centered} style={{width: widthProperty}}>property</Grid>
            <Grid item className={classes.centered} style={{width: widthMin}}>min</Grid>
            <Grid item className={classes.centered} style={{width: widthSlider}}></Grid>
            <Grid item className={classes.centered} style={{width: widthMin}}>max</Grid>
          </Grid>

          {
            Object.values(MOL_ATTR).map((attr) => 
              <MoleculeListSortFilterItem 
                key={attr.key}
                property={attr.name} 
                priority={filter[attr.key].priority}
                order={filter[attr.key].order}
                minValue={filter[attr.key].minValue}
                maxValue={filter[attr.key].maxValue}
                min={initState[attr.key].minValue} 
                max={initState[attr.key].maxValue} 
                isFloat={initState[attr.key].isFloat}
                onChange={handleItemChange(attr.key)}/>
            )
          }
        </Grid>

      </DialogContent>
      <DialogActions>
        <div className={classes.numberOfHits}>
          # of hits matching selection: <b>{filteredCount}</b>
        </div>
        <Button classes={{root: classes.button}} onClick={handleClear} color="secondary" variant="outlined">
          Clear
        </Button>
        <Button classes={{root: classes.button}} className={classes.applyButton} onClick={handleClose(filter)} color="primary" variant="outlined">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}

MoleculeListSortFilterDialog.propTypes = {
  handleClose: PropTypes.func.isRequired,
  handleFilterActive: PropTypes.func.isRequired,
  molGroupSelection: PropTypes.arrayOf(PropTypes.number).isRequired,
  cachedMolList: PropTypes.object.isRequired,
  filterSettings: PropTypes.object
};