import { useCallback, useEffect, useState } from 'react';
import { COLUMN_TYPES } from '../table';
import { useSelector } from 'react-redux';
import { LHS_OBSERVATION_VIEW_CONFIG } from '../viewConfigs';

export const useColumns = (defaultWidth, viewConfig = LHS_OBSERVATION_VIEW_CONFIG) => {
  const [columns, setColumns] = useState([]);
  const extraColumns = useSelector(state => state.apiReducers.lhs_extra_columns);

  const getColumnType = useCallback(name => {
    switch (name) {
      case 'text':
        return COLUMN_TYPES.TEXT;
      case 'float':
      case 'integer':
        return COLUMN_TYPES.NUMBER;
      default:
        return COLUMN_TYPES.CUSTOM;
    }
  }, []);

  useEffect(() => {
    const baseColumns = viewConfig.getBaseColumns();

    if (extraColumns && extraColumns.length > 0) {
      const newColumns = [...baseColumns];
      extraColumns.forEach(column => {
        if (!newColumns.some(col => col.name === column.name)) {
          newColumns.push({
            name: column.result_property,
            displayName: column.result_property,
            type: getColumnType(column.data_type),
            visible: column.visible,
            minWidth: 50,
            width: 54,
            resizable: true,
            data_type: column.data_type
          });
        }
      });
      setColumns(newColumns);
    } else {
      setColumns(viewConfig.getColumnsWithoutExtras());
    }
  }, [extraColumns, getColumnType, viewConfig]);

  const handleColumnResize = (name, widthChange) => {
    widthChange = Math.floor(widthChange);
    const updateColumns = [...columns];

    const foundColumnIndex = updateColumns.findIndex(column => column.name === name);
    if (foundColumnIndex === -1) {
      return;
    }

    if (updateColumns[foundColumnIndex].width + widthChange < updateColumns[foundColumnIndex].minWidth) {
      widthChange = updateColumns[foundColumnIndex].minWidth - updateColumns[foundColumnIndex].width;
    }

    updateColumns[foundColumnIndex].width += widthChange;
    setColumns(updateColumns);
  };

  const getColumnWidth = name => {
    const foundColumn = columns.find(column => column.name === name);

    if (foundColumn) {
      return foundColumn.width;
    } else {
      return defaultWidth;
    }
  };

  return { columns, setColumns, handleColumnResize, getColumnWidth };
};
