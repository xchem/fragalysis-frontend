/**
 * Row in Hit navigator
 */

import React, { memo, forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { makeStyles, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { useSelector } from 'react-redux';
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

const DETAIL_WIDTH_BUFFER = 6;
const DETAIL_TEXT_ACTION_BUFFER = 28;
const TABLE_WIDTH_RESERVE = 10;
const DETAIL_CONTROLS_WIDTH = {
  lhs: 116,
  rhs: 100
};
const BASE_ROW_HEIGHT = 54;

let textMeasureCanvas = null;

const getTextMeasureContext = () => {
  if (typeof document === 'undefined') {
    return null;
  }

  if (!textMeasureCanvas) {
    textMeasureCanvas = document.createElement('canvas');
  }

  return textMeasureCanvas.getContext('2d');
};

const measureTextWidth = (text, font) => {
  if (!text) {
    return 0;
  }

  const context = getTextMeasureContext();

  if (!context) {
    return String(text).length * 8;
  }

  context.font = font;
  return context.measureText(String(text)).width;
};

const getMainObservation = item =>
  item?.associatedObs?.find(observation => observation.id === item?.main_site_observation) ||
  item?.associatedObs?.[0] ||
  null;

const getDisplayName = (mainObservation, viewConfig, aliasOrder) => {
  const defaultName = viewConfig.getDetailDefaultName?.(mainObservation) ?? mainObservation?.compound_code;

  if (aliasOrder) {
    for (let index = 0; index < aliasOrder.length; index++) {
      const preferredIdentifierType = aliasOrder[index];

      if (preferredIdentifierType === 'compound_code') {
        return defaultName || '';
      }

      const searchedIdentifier = mainObservation?.identifiers?.find(
        identifier => identifier.type === preferredIdentifierType
      );

      if (searchedIdentifier) {
        return searchedIdentifier.name || '';
      }
    }
  }

  return defaultName || '';
};

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
        availableWidth = 0,
        getComputedInspirations = undefined
      },
      outsideRef
    ) => {
      const imgHeight = 49;
      const imgWidth = 150;

      const classes = useStyles();
      const aliasOrder = useSelector(state => state.apiReducers.target_on_aliases);
      const [detailHeightsByRowId, setDetailHeightsByRowId] = useState({});

      // setup jsme before to prevent window jumping when molecule filter opens first time
      jsmeSetup();

      const containsAtLeastOne = (list, molsList) => {
        for (const mol of molsList || []) {
          if (list?.includes(mol.id)) {
            return true;
          }
        }

        return false;
      };
      const preferredDetailWidth = useMemo(() => {
        const maxTextWidth = (items || []).reduce((maxWidth, item) => {
          const mainObservation = getMainObservation(item);
          const codeWidth = measureTextWidth(mainObservation?.code || '', '700 14.4px Roboto, Arial, sans-serif');
          const displayNameWidth = measureTextWidth(
            getDisplayName(mainObservation, viewConfig, aliasOrder),
            '400 12.8px Roboto, Arial, sans-serif'
          );

          return Math.max(maxWidth, Math.max(codeWidth, displayNameWidth) + DETAIL_TEXT_ACTION_BUFFER);
        }, 0);
        const controlsWidth = DETAIL_CONTROLS_WIDTH[viewConfig.kind] || DETAIL_CONTROLS_WIDTH.lhs;

        return Math.ceil(maxTextWidth + controlsWidth + DETAIL_WIDTH_BUFFER);
      }, [aliasOrder, items, viewConfig]);

      const { columns, handleColumnResize, getColumnWidth } = useColumns(
        50,
        viewConfig,
        availableWidth,
        preferredDetailWidth
      );
      const { filteredItems, getColumnFilter } = useFilters(items, columns, viewConfig);
      const filteredItemIds = useMemo(() => new Set((filteredItems || []).map(item => item.id)), [filteredItems]);
      const waitsForMoleculeImage = columns?.some(column => column.visible && column.type === COLUMN_TYPES.MOLECULE);
      const handleDetailHeightChange = useCallback((rowId, height) => {
        if (rowId === undefined || rowId === null) {
          return;
        }

        setDetailHeightsByRowId(currentHeights => {
          if (height === null || height === undefined) {
            if (currentHeights[rowId] === undefined) {
              return currentHeights;
            }

            const nextHeights = { ...currentHeights };
            delete nextHeights[rowId];
            return nextHeights;
          }

          const roundedHeight = Math.ceil(height);

          if (currentHeights[rowId] === roundedHeight) {
            return currentHeights;
          }

          return {
            ...currentHeights,
            [rowId]: roundedHeight
          };
        });
      }, []);

      useEffect(() => {
        setDetailHeightsByRowId(currentHeights => {
          const nextHeights = {};
          let changed = false;

          Object.entries(currentHeights).forEach(([rowId, height]) => {
            if (filteredItemIds.has(rowId) || filteredItemIds.has(Number(rowId))) {
              nextHeights[rowId] = height;
            } else {
              changed = true;
            }
          });

          return changed ? nextHeights : currentHeights;
        });
      }, [filteredItemIds]);

      const displayImageSize = useMemo(() => {
        const maxDetailHeight = (filteredItems || []).reduce(
          (maxHeight, item) => Math.max(maxHeight, detailHeightsByRowId[item.id] || 0),
          0
        );
        const displayHeight = maxDetailHeight > BASE_ROW_HEIGHT ? maxDetailHeight : imgHeight;
        const nonMoleculeColumnsWidth = (columns || []).reduce((width, column) => {
          if (!column.visible || column.name === 'molecule') {
            return width;
          }

          return width + getColumnWidth(column.name);
        }, 0);
        const availableImageWidth = availableWidth
          ? availableWidth - nonMoleculeColumnsWidth - TABLE_WIDTH_RESERVE
          : imgWidth;
        const displayWidth = Math.max(1, Math.min(imgWidth, availableImageWidth));

        return {
          height: displayHeight,
          width: Math.round(displayWidth * 100) / 100
        };
      }, [availableWidth, columns, detailHeightsByRowId, filteredItems, getColumnWidth, imgHeight, imgWidth]);

      const getRenderedColumnWidth = useCallback(
        name => {
          if (name === 'molecule') {
            return Math.ceil(displayImageSize.width);
          }

          return getColumnWidth(name);
        },
        [displayImageSize.width, getColumnWidth]
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
                      width={getRenderedColumnWidth(name)}
                      style={{ width: getRenderedColumnWidth(name), maxWidth: getRenderedColumnWidth(name) }}
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
                  getColumnWidth={getRenderedColumnWidth}
                  displayImageHeight={displayImageSize.height}
                  displayImageWidth={displayImageSize.width}
                  onDetailHeightChange={handleDetailHeightChange}
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
