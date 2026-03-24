import { COLUMNS, RHS_COLUMNS } from './table';

const cloneColumns = columns => columns.map(column => ({ ...column }));

const withDefaultDetailWidth = columns =>
  columns.map(column => {
    if (column.name === 'detail') {
      return { ...column, width: 230 };
    }

    return column;
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
  getDetailDefaultName: mainObservation => mainObservation?.virtual_name,
  getDetailTitle: ({ mainObservation }) => mainObservation?.virtual_identifier,
  shouldRenderDetailTrailingButtons: () => false
};
