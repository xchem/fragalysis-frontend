import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { Panel } from '../common/Surfaces/Panel';
import { CircularProgress, Grid, makeStyles, Typography, Button } from '@material-ui/core';
import { CloudDownload } from '@material-ui/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  getMoleculesObjectIDListOfCompoundsToBuy,
  getListOfSelectedComplexOfAllDatasets,
  getListOfSelectedLigandOfAllDatasets,
  getListOfSelectedProteinOfAllDatasets,
  getListOfSelectedSurfaceOfAllDatasets
} from './redux/selectors';
import InfiniteScroll from 'react-infinite-scroller';
import DatasetMoleculeView from './datasetMoleculeView';
import { InspirationDialog } from './inspirationDialog';
import { setIsOpenInspirationDialog } from './redux/actions';
import { CrossReferenceDialog } from './crossReferenceDialog';
import { autoHideDatasetDialogsOnScroll, resetCrossReferenceDialog } from './redux/dispatchActions';
import { NglContext } from '../nglView/nglProvider';
import FileSaver from 'file-saver';
import JSZip from 'jszip';
import { isCompoundFromVectorSelector } from '../preview/compounds/redux/dispatchActions';
import { saveAndShareSnapshot } from '../snapshot/redux/dispatchActions';
import { setDontShowShareSnapshot, setSharedSnapshot } from '../snapshot/redux/actions';
import { initSharedSnapshot } from '../snapshot/redux/reducer';
import { base_url } from '../routes/constants';
import { api, METHOD } from '../../utils/api';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const useStyles = makeStyles(theme => ({
  container: {
    height: '100%',
    width: 'inherit',
    color: theme.palette.black
  },
  paddingProgress: {
    padding: theme.spacing(1)
  },
  gridItemList: {
    overflow: 'auto',
    height: `calc(100% - ${theme.spacing(6)}px)`
  },
  notFound: {
    paddingTop: theme.spacing(2)
  },
  sdfButton: {
    marginRight: theme.spacing(1)
  }
}));

export const SelectedCompoundList = memo(({ height }) => {
  const classes = useStyles();

  const imgHeight = 49;
  const imgWidth = 150;
  const moleculesPerPage = 5;
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(0);
  const moleculesObjectIDListOfCompoundsToBuy = useSelector(getMoleculesObjectIDListOfCompoundsToBuy);
  const isOpenInspirationDialog = useSelector(state => state.datasetsReducers.isOpenInspirationDialog);
  const isOpenCrossReferenceDialog = useSelector(state => state.datasetsReducers.isOpenCrossReferenceDialog);
  const [selectedMoleculeRef, setSelectedMoleculeRef] = useState(null);
  const inspirationDialogRef = useRef();
  const crossReferenceDialogRef = useRef();
  const scrollBarRef = useRef();

  const { nglViewList } = useContext(NglContext);

  const loadNextMolecules = () => {
    setCurrentPage(currentPage + 1);
  };

  const listItemOffset = (currentPage + 1) * moleculesPerPage;
  const currentMolecules = moleculesObjectIDListOfCompoundsToBuy.slice(0, listItemOffset);
  const canLoadMore = listItemOffset < moleculesObjectIDListOfCompoundsToBuy.length;

  const ligandList = useSelector(state => getListOfSelectedLigandOfAllDatasets(state));
  const proteinList = useSelector(state => getListOfSelectedProteinOfAllDatasets(state));
  const complexList = useSelector(state => getListOfSelectedComplexOfAllDatasets(state));
  const surfaceList = useSelector(state => getListOfSelectedSurfaceOfAllDatasets(state));

  const showedCompoundList = useSelector(state => state.previewReducers.compounds.showedCompoundList);
  const filteredScoreProperties = useSelector(state => state.datasetsReducers.filteredScoreProperties);

  useEffect(() => {
    return () => {
      dispatch(setIsOpenInspirationDialog(false));
      dispatch(resetCrossReferenceDialog());
    };
  }, [dispatch]);

  const getSetOfProps = usedDatasets => {
    const unionOfProps = new Set();

    unionOfProps.add('smiles');

    Object.keys(filteredScoreProperties).forEach(datasetName => {
      if (usedDatasets.hasOwnProperty(datasetName)) {
        const dataset = filteredScoreProperties[datasetName];
        dataset.forEach(prop => {
          if (prop.hasOwnProperty('computed_set')) {
            unionOfProps.add(prop.name);
          }
        });
      }
    });

    return [...unionOfProps];
  };

  const populateMolObject = (molObj, compound, props, ids) => {
    const molecule = compound.molecule;

    molObj = populateMolIds(molObj, compound, ids);

    let value = '';
    for (let i = 0; i < props.length; i++) {
      value = '';
      const prop = props[i];
      if (molecule.hasOwnProperty(prop)) {
        value = molecule[prop];
      } else {
        let mapOfNumScores = undefined;
        let mapOfTextScores = undefined;
        if (molecule.hasOwnProperty('numerical_scores')) {
          mapOfNumScores = molecule['numerical_scores'];
        }
        if (molecule.hasOwnProperty('text_scores')) {
          mapOfTextScores = molecule['text_scores'];
        }
        if (mapOfNumScores !== undefined) {
          if (mapOfNumScores.hasOwnProperty(prop)) {
            value = mapOfNumScores[prop];
          }
        }
        if (mapOfTextScores !== undefined) {
          if (mapOfTextScores.hasOwnProperty(prop)) {
            value = mapOfTextScores[prop];
          }
        }
      }

      molObj[prop] = value;
    }

    return molObj;
  };

  const populateMolIds = (molObj, compound, idsGlobal) => {
    if (compound.molecule.hasOwnProperty('compound_ids')) {
      const ids = compound.molecule['compound_ids'];
      let vendorsPerMol = {};
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const splitId = id.split(':');
        const vendorId = splitId[0];
        const idVal = splitId[1];
        if (vendorsPerMol.hasOwnProperty(vendorId)) {
          vendorsPerMol[vendorId] += 1;
        } else {
          vendorsPerMol[vendorId] = 0;
        }

        molObj[idsGlobal.diffIds[vendorId].fieldsArray[vendorsPerMol[vendorId]]] = idVal;
      }
    }

    return molObj;
  };

  const getCompoundIds = mols => {
    let result = { diffIds: {}, namesToIds: {}, idsInOrder: new Set() };

    mols.forEach(mol => {
      if (mol.molecule.hasOwnProperty('compound_ids')) {
        const ids = mol.molecule['compound_ids'];
        const perMolVendors = {};
        ids.forEach(id => {
          let vendorId = id.split(':')[0];
          if (!result.diffIds.hasOwnProperty(vendorId)) {
            perMolVendors[vendorId] = 1;
            const idFieldName = vendorId;
            result.diffIds[vendorId] = { count: 1, name: vendorId, fields: {}, fieldsArray: [] };
            result.diffIds[vendorId].fields[idFieldName] = idFieldName;
            result.diffIds[vendorId].fieldsArray.push(idFieldName);
            result.namesToIds[idFieldName] = vendorId;
            result.idsInOrder.add(idFieldName);
          } else {
            if (perMolVendors.hasOwnProperty(vendorId)) {
              const perMolVendorCount = perMolVendors[vendorId];
              const globalVendor = result.diffIds[vendorId];
              if (perMolVendorCount >= globalVendor.count) {
                const idFieldName = `${vendorId}_${perMolVendorCount}`;
                perMolVendors[vendorId] = perMolVendorCount + 1;
                globalVendor.count = globalVendor.count + 1;
                result.diffIds[vendorId].fields[idFieldName] = idFieldName;
                result.diffIds[vendorId].fieldsArray.push(idFieldName);
                result.namesToIds[idFieldName] = vendorId;
                result.idsInOrder.add(idFieldName);
              }
            } else {
              perMolVendors[vendorId] = 1;
            }
          }
        });
      }
    });

    return result;
  };

  const getUsedDatasets = mols => {
    const setOfDataSets = {};
    mols.forEach(mol => {
      if (!setOfDataSets.hasOwnProperty(mol.datasetID)) setOfDataSets[mol.datasetID] = mol.datasetID;
    });

    return setOfDataSets;
  };

  const getEmptyMolObject = (props, ids) => {
    let molObj = {};

    ids.idsInOrder.forEach(id => {
      molObj[id] = '';
    });

    props.forEach(prop => {
      molObj[prop] = '';
    });

    return molObj;
  };

  const downloadAsCsv = () => (dispatch, getState) => {
    dispatch(setDontShowShareSnapshot(true));
    dispatch(saveAndShareSnapshot(nglViewList, false)).then(() => {
      const state = getState();
      const sharedSnapshot = state.snapshotReducers.sharedSnapshot;

      dispatch(setSharedSnapshot(initSharedSnapshot));
      dispatch(setDontShowShareSnapshot(false));

      const usedDatasets = getUsedDatasets(moleculesObjectIDListOfCompoundsToBuy);
      const props = getSetOfProps(usedDatasets);
      const ids = getCompoundIds(moleculesObjectIDListOfCompoundsToBuy);

      const listOfMols = [];

      moleculesObjectIDListOfCompoundsToBuy.forEach(compound => {
        let molObj = getEmptyMolObject(props, ids);
        molObj = populateMolObject(molObj, compound, props, ids);
        listOfMols.push(molObj);
      });

      const reqObj = { title: sharedSnapshot.url, dict: listOfMols };
      const jsonString = JSON.stringify(reqObj);

      api({
        url: `${base_url}/api/dicttocsv/`,
        method: METHOD.POST,
        data: jsonString
      }).then(resp => {
        var anchor = document.createElement('a');
        anchor.href = `${base_url}/api/dicttocsv/?file_url=${resp.data['file_url']}`;
        anchor.target = '_blank';
        anchor.download = 'download';
        anchor.click();
      });
    });
  };

  const downloadAsSdf = async () => {
    const zip = new JSZip();
    const folders = {};

    moleculesObjectIDListOfCompoundsToBuy.forEach(compound => {
      const datasetID = compound.datasetID;
      let folder = folders[datasetID];
      if (!folder) {
        folder = zip.folder(datasetID);
        folders[datasetID] = folder;
      }

      const { name, sdf_info } = compound.molecule;
      folder.file(`${name}.sdf`, sdf_info);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    FileSaver.saveAs(zipBlob, 'selectedCompounds.zip');
  };

  return (
    <Panel
      hasHeader
      title="Selected Compounds"
      withTooltip
      headerActions={[
        <Button color="inherit" variant="text" onClick={() => dispatch(downloadAsCsv())} startIcon={<CloudDownload />}>
          Download CSV
        </Button>,
        <Button
          color="inherit"
          variant="text"
          className={classes.sdfButton}
          onClick={downloadAsSdf}
          startIcon={<CloudDownload />}
          disabled={true}
        >
          Download SDF
        </Button>
      ]}
    >
      {isOpenInspirationDialog && (
        <InspirationDialog
          open
          anchorEl={selectedMoleculeRef}
          //     datasetID={datasetID}
          ref={inspirationDialogRef}
        />
      )}
      {isOpenCrossReferenceDialog && (
        <CrossReferenceDialog open anchorEl={selectedMoleculeRef} ref={crossReferenceDialogRef} />
      )}
      <Grid container direction="column" justify="flex-start" className={classes.container} style={{ height: height }}>
        {currentMolecules.length > 0 && (
          <Grid item className={classes.gridItemList} ref={scrollBarRef}>
            <InfiniteScroll
              getScrollParent={() => {
                dispatch(
                  autoHideDatasetDialogsOnScroll({ inspirationDialogRef, crossReferenceDialogRef, scrollBarRef })
                );
              }}
              pageStart={0}
              loadMore={loadNextMolecules}
              hasMore={canLoadMore}
              loader={
                <div className="loader" key={0}>
                  <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                    className={classes.paddingProgress}
                  >
                    <CircularProgress />
                  </Grid>
                </div>
              }
              useWindow={false}
            >
              <DndProvider backend={HTML5Backend}>
                {currentMolecules.map((data, index, array) => {
                  const isFromVectorSelector = isCompoundFromVectorSelector(data.molecule);
                  let isLigandOn = false;
                  if (isFromVectorSelector) {
                    if (showedCompoundList.find(item => item === data.molecule.smiles) !== undefined) {
                      isLigandOn = true;
                    }
                  } else {
                    isLigandOn = ligandList.includes(data.molecule.id);
                  }
                  return (
                    <DatasetMoleculeView
                      key={index}
                      index={index}
                      imageHeight={imgHeight}
                      imageWidth={imgWidth}
                      data={data.molecule}
                      datasetID={data.datasetID}
                      setRef={setSelectedMoleculeRef}
                      showCrossReferenceModal
                      previousItemData={index > 0 && array[index - 1]}
                      nextItemData={index < array?.length && array[index + 1]}
                      L={isLigandOn}
                      P={proteinList.includes(data.molecule.id)}
                      C={complexList.includes(data.molecule.id)}
                      S={surfaceList.includes(data.molecule.id)}
                      V={false}
                      arrowsHidden
                      dragDropEnabled
                    />
                  );
                })}
              </DndProvider>
            </InfiniteScroll>
          </Grid>
        )}
        {!(currentMolecules.length > 0) && (
          <Grid container justify="center" alignItems="center" direction="row" className={classes.notFound}>
            <Grid item>
              <Typography variant="body2">No molecules found!</Typography>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Panel>
  );
});
