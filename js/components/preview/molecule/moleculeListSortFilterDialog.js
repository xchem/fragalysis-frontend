import { MOL_ATTRIBUTES } from './redux/constants';
import { moleculeProperty } from './helperConstants';

export const getFilteredMoleculesCount = (molecules, filter) => {
  let count = 0;
  for (let molecule of molecules) {
    let add = true; // By default molecule passes filter
    for (let attr of MOL_ATTRIBUTES) {
      if (!attr.filter) continue;
      const lowAttr = attr.key.toLowerCase();
      const attrValue = molecule[lowAttr];
      if (attrValue < filter.filter[attr.key].minValue || attrValue > filter.filter[attr.key].maxValue) {
        add = false;
        break; // Do not loop over other attributes
      }
    }
    if (add) {
      count = count + 1;
    }
  }
  return count;
};

export const getAttrDefinition = attr => {
  return MOL_ATTRIBUTES.find(molAttr => molAttr.key === attr);
};

export const filterMolecules = (molecules, filter) => {
  // 1. Filter
  let filteredMolecules = [];
  for (let molecule of molecules) {
    let add = true; // By default molecule passes filter
    for (let attr of MOL_ATTRIBUTES) {
      if (!attr.filter) continue;
      const lowAttr = attr.key.toLowerCase();
      const attrValue = molecule[lowAttr];
      if (attrValue < filter.filter[attr.key].minValue || attrValue > filter.filter[attr.key].maxValue) {
        add = false;
        break; // Do not loop over other attributes
      }
    }
    if (add) {
      filteredMolecules.push(molecule);
    }
  }

  // 2. Sort
  let sortedAttributes = filter.priorityOrder.map(attr => attr);

  return filteredMolecules.sort((a, b) => {
    for (let prioAttr of sortedAttributes) {
      const order = filter.filter[prioAttr].order;

      const attrLo = prioAttr.toLowerCase();
      let aVal;
      let bVal;
      if (prioAttr === moleculeProperty.mw || prioAttr === moleculeProperty.tpsa) {
        aVal = Math.round(a[attrLo]);
        bVal = Math.round(b[attrLo]);
      } else if (prioAttr === moleculeProperty.logP) {
        aVal = Math.round(a[attrLo]) /*.toPrecision(1)*/;
        bVal = Math.round(b[attrLo]) /*.toPrecision(1)*/;
      } else {
        aVal = a[attrLo];
        bVal = b[attrLo];
      }
      let diff = order * (aVal - bVal);
      if (diff !== 0) {
        return diff;
      }
    }
  });
};
