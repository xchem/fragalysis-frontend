/**
 * Row in Hit navigator
 */

import React, { memo, forwardRef } from 'react';
import {
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip
} from '@material-ui/core';
import ObservationUnifiedView from './observationUnifiedView';
import { useColumns } from './hooks/useColumns';
import { useFilters } from './hooks';
import { TableResizer } from './table/tableResizer';
import { jsmeSetup } from '@loschmidt/jsme-react';

const useStyles = makeStyles(theme => ({
  table: {
    // this needs to be so columns has 100% height in chrome..
    height: 1,
    width: 'unset'
  },
  headerCell: {
    padding: 0,
    textAlign: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  resizerParent: {
    textAlign: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    position: 'relative',
    paddingRight: 15,
    minWidth: 20,
    minHeight: 20
  },
  resizer: {
    position: 'absolute',
    right: 0,
    // bottom: 0,
    width: 3,
    height: '100%',
    cursor: 'col-resize',
    backgroundColor: '#cccccc',
    borderRadius: '3px',
    // background: theme.palette.divider,
    '&:hover': {
      background: theme.palette.primary.main
    }
  }
}));

const ObservationUnifiedViewWrapper = memo(
  forwardRef(
    (
      {
        fragmentDisplayList,
        proteinList,
        complexList,
        surfaceList,
        densityList,
        densityListCustom,
        qualityList,
        vectorOnList,
        informationList,
        items,
        allSelectedMolecules,
        addMoleculeViewRef,
        handleSetTagEditorAnchorEl
      },
      outsideRef
    ) => {

      const imgHeight = 49;
      const imgWidth = 150;

      const classes = useStyles();

      // setup jsme before to prevent window jumping when molecule filter opens first time
      jsmeSetup();

      const containsAtLeastOne = (list, molsList) => {
        for (const mol in molsList) {
          if (list.includes(mol.id)) {
            return true;
          }
        }

        return false;
      };

      // const extraColumns = useSelector(state => state.apiReducers.lhs_extra_columns);
      // const [definedColumns, setDefinedColumns] = useState(COLUMNS);

      // const getColumnType = useCallback((name) => {
      //   switch (name) {
      //     case 'text':
      //       return COLUMN_TYPES.TEXT;
      //     case 'float':
      //     case 'integer':
      //       return COLUMN_TYPES.NUMBER;
      //     default:
      //       return COLUMN_TYPES.CUSTOM;
      //   }
      // }, []);

      // useEffect(() => {
      //   console.log('extraColumns', extraColumns);
      //   if (extraColumns && extraColumns.length > 0) {
      //     const newColumns = [...COLUMNS];
      //     extraColumns.forEach(column => {
      //       if (!newColumns.some(col => col.name === column.name)) {
      //         newColumns.push({
      //           name: column.name,
      //           displayName: column.name,
      //           type: getColumnType(column.type),
      //           width: 22,
      //           resizable: true
      //         });
      //       }
      //     });
      //     setDefinedColumns(newColumns);
      //   } else {
      //     setDefinedColumns(COLUMNS);
      //   }
      // }, [extraColumns, getColumnType]);

      const { columns, handleColumnResize, getColumnWidth } = useColumns(50);
      const { filteredItems, getColumnFilter } = useFilters(items, columns);

      return (
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              {columns?.map(({ name, displayName, type, resizable, visible }) => {
                return (visible && <TableCell key={name}
                  width={getColumnWidth(name)}
                  style={{ maxWidth: getColumnWidth(name) }}
                  className={classes.headerCell}
                >
                  <Tooltip title={displayName} placement="top">
                    <div className={classes.resizerParent}>
                      {displayName}
                      {getColumnFilter(type, name)}
                      {resizable &&
                        <TableResizer
                          className={classes.resizer}
                          onResize={width => handleColumnResize(name, width)}
                        />}
                    </div>
                  </Tooltip>
                </TableCell>)
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems?.map((data, index) => {
              const molsForCmp = data.associatedObs;
              const selected = allSelectedMolecules.some(molecule =>
                data.associatedObs.some(obs => obs.id === molecule.id)
              );

              return (
                <ObservationUnifiedView
                  ref={addMoleculeViewRef}
                  key={data.id}
                  imageHeight={imgHeight}
                  imageWidth={imgWidth}
                  data={data}
                  index={index}
                  setRef={handleSetTagEditorAnchorEl}
                  L={containsAtLeastOne(fragmentDisplayList, molsForCmp)}
                  P={containsAtLeastOne(proteinList, molsForCmp)}
                  C={containsAtLeastOne(complexList, molsForCmp)}
                  S={containsAtLeastOne(surfaceList, molsForCmp)}
                  D={containsAtLeastOne(densityList, molsForCmp)}
                  D_C={containsAtLeastOne(densityListCustom, molsForCmp)}
                  Q={containsAtLeastOne(qualityList, molsForCmp)}
                  V={containsAtLeastOne(vectorOnList, molsForCmp)}
                  I={containsAtLeastOne(informationList, molsForCmp)}
                  selected={selected}
                  disableL={false}
                  disableP={false}
                  disableC={false}
                  observations={molsForCmp}
                  columns={columns}
                  getColumnWidth={getColumnWidth}
                />
              );
            })}
          </TableBody>
        </Table >);
    }));

ObservationUnifiedViewWrapper.displayName = 'ObservationUnifiedViewWrapper';
export default ObservationUnifiedViewWrapper;
