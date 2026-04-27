/**
 * Row in Hit navigator
 */

import React, { memo, forwardRef } from 'react';
import { makeStyles, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import ObservationUnifiedView from './observationUnifiedView';
import { useColumns } from './hooks/useColumns';
import { useFilters } from './hooks';
import { TableResizer } from './table/tableResizer';
import { jsmeSetup } from '@loschmidt/jsme-react';
import RichTooltip from '../../../tooltip/RichTooltip';
import { TooltipPathProvider } from '../../../tooltip/TooltipPathContext';
import { LHS_OBSERVATION_VIEW_CONFIG } from './viewConfigs';
import { COLUMN_TYPES } from './table';

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
        viewConfig = LHS_OBSERVATION_VIEW_CONFIG,
        ligandRepresentations = undefined,
        fragmentDisplayList,
        proteinList,
        complexList,
        surfaceList,
        densityList,
        qualityList,
        vectorOnList,
        informationList,
        items,
        allSelectedMolecules,
        addMoleculeViewRef,
        onPoseVisuallyReady,
        handleSetTagEditorAnchorEl,
        getComputedInspirations = undefined
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
          if (list?.includes(mol.id)) {
            return true;
          }
        }

        return false;
      };
      const { columns, handleColumnResize, getColumnWidth } = useColumns(50, viewConfig);
      const { filteredItems, getColumnFilter } = useFilters(items, columns, viewConfig);
      const waitsForMoleculeImage = columns?.some(
        column => column.visible && column.type === COLUMN_TYPES.MOLECULE
      );

      return (
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              {columns?.map(({ name, displayName, type, resizable, visible }) => {
                return (
                  visible && (
                    <TableCell
                      key={name}
                      width={getColumnWidth(name)}
                      style={{ maxWidth: getColumnWidth(name) }}
                      className={classes.headerCell}
                    >
                      <RichTooltip path="propertyDisplayName" values={{ displayName: displayName }}>
                        <div className={classes.resizerParent}>
                          {displayName}
                          <TooltipPathProvider path="filters">{getColumnFilter(type, name)}</TooltipPathProvider>
                          {resizable && (
                            <TableResizer
                              className={classes.resizer}
                              onResize={width => handleColumnResize(name, width)}
                            />
                          )}
                        </div>
                      </RichTooltip>
                    </TableCell>
                  )
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredItems?.map((data, index) => {
              const molsForCmp = data.associatedObs;
              const selected = allSelectedMolecules?.some(molecule =>
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
                  Q={containsAtLeastOne(qualityList, molsForCmp)}
                  V={containsAtLeastOne(vectorOnList, molsForCmp)}
                  I={containsAtLeastOne(informationList, molsForCmp)}
                  selected={selected}
                  disableL={false}
                  disableP={false}
                  disableC={false}
                  observations={molsForCmp}
                  ligandRepresentations={ligandRepresentations}
                  onVisualReady={onPoseVisuallyReady}
                  waitForVisualCompletion={waitsForMoleculeImage}
                  columns={columns}
                  getColumnWidth={getColumnWidth}
                  viewConfig={viewConfig}
                  getComputedInspirations={getComputedInspirations}
                />
              );
            })}
          </TableBody>
        </Table>
      );
    }
  )
);

ObservationUnifiedViewWrapper.displayName = 'ObservationUnifiedViewWrapper';
export default ObservationUnifiedViewWrapper;
