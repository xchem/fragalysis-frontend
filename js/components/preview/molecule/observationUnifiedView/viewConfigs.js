import { COLUMNS, RHS_COLUMNS } from './table';
import { filterCompoundsByStructure } from './api';
import { getAllDisplayedObservationIds } from '../redux/selectors';

const cloneColumns = columns => columns.map(column => ({ ...column }));

const withDefaultDetailWidth = columns =>
  columns.map(column => {
    if (column.name === 'detail') {
      return { ...column, width: 230 };
    }

    return column;
  });

const getMainObservation = item =>
  item?.associatedObs?.find(observation => observation.id === item?.main_site_observation) || item?.associatedObs?.[0] || null;

const getObservationIds = item =>
  (item?.associatedObs || []).map(observation => observation.id).filter(id => id !== undefined && id !== null);

const normalizeFilterMatchId = value => {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value);
};

const getObservationCode = item => getMainObservation(item)?.code || item?.display_name || '';

const getCompoundCode = item => item?.main_site_observation_cmpd_code || '';

const getCompoundAliases = item => {
  const mainObservation = getMainObservation(item);
  const aliases = mainObservation?.identifiers?.map(identifier => identifier.name) || [];
  return [getCompoundCode(item), ...aliases].filter(Boolean);
};

const matchesDisplayedObservations = (item, displayedObservationIds = []) =>
  getObservationIds(item).some(observationId => displayedObservationIds.includes(observationId));

const matchesMoleculeFilter = (item, filterSettings = {}) => {
  const filteredCompounds = filterSettings.filteredCompounds;

  if (filteredCompounds === null || filteredCompounds === undefined) {
    return true;
  }

  if (!Array.isArray(filteredCompounds) || filteredCompounds.length === 0) {
    return false;
  }

  const normalizedFilteredCompounds = new Set(filteredCompounds.map(normalizeFilterMatchId).filter(Boolean));

  if (filterSettings.structureType === 'compound') {
    const compoundIds = [item?.compound, getMainObservation(item)?.cmpd].map(normalizeFilterMatchId).filter(Boolean);
    return compoundIds.some(compoundId => normalizedFilteredCompounds.has(compoundId));
  }

  return getObservationIds(item)
    .map(normalizeFilterMatchId)
    .filter(Boolean)
    .some(observationId => normalizedFilteredCompounds.has(observationId));
};

export const buildObservationViewConfig = (baseConfig, overrides = {}) => ({
  getDisplayedObservationIds: state => getAllDisplayedObservationIds(state),
  getShowDisplayedMolecules: state =>
    baseConfig.kind === 'rhs'
      ? (state.selectionReducers.showDisplayedMoleculesRHS ?? true)
      : (state.selectionReducers.showDisplayedMoleculesLHS ?? state.selectionReducers.showDisplayedMolecules),
  getIsCoordinateFilterApplied: state =>
    baseConfig.kind === 'rhs'
      ? (state.selectionReducers.isCoordinateFilterAppliedRHS ?? state.selectionReducers.isCoordinateFilterApplied)
      : (state.selectionReducers.isCoordinateFilterAppliedLHS ?? state.selectionReducers.isCoordinateFilterApplied),
  getObservationFilterKey: () => (baseConfig.kind === 'rhs' ? 'detailRHS' : 'detail'),
  getObservationCode,
  getCompoundCode,
  getCompoundAliases,
  matchesDisplayedObservations,
  matchesMoleculeFilter,
  applyMoleculeFilter: filterCompoundsByStructure,
  ...baseConfig,
  ...overrides
});

export const LHS_OBSERVATION_VIEW_CONFIG = {
  kind: 'lhs',
  getBaseColumns: () => cloneColumns(COLUMNS),
  getColumnsWithoutExtras: () => withDefaultDetailWidth(cloneColumns(COLUMNS)),
  getDetailDefaultName: mainObservation => mainObservation?.compound_code,
  getDetailTitle: ({ mainObservation, targetName }) => mainObservation?.code?.replaceAll(`${targetName}-`, ''),
  shouldRenderDetailTrailingButtons: () => true
};

export const RHS_OBSERVATION_VIEW_CONFIG = {
  kind: 'rhs',
  getBaseColumns: () => cloneColumns(RHS_COLUMNS),
  getColumnsWithoutExtras: () => withDefaultDetailWidth(cloneColumns(RHS_COLUMNS)),
  getObservationCode: item => item?.code || item?.display_name || getMainObservation(item)?.code || '',
  getDetailDefaultName: mainObservation => mainObservation?.virtual_name,
  getDetailTitle: ({ mainObservation }) => mainObservation?.virtual_identifier,
  shouldRenderDetailTrailingButtons: () => false
};
