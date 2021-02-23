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
import { colourList, DatasetMoleculeView } from './datasetMoleculeView';
import { InspirationDialog } from './inspirationDialog';
import { setIsOpenInspirationDialog } from './redux/actions';
import { CrossReferenceDialog } from './crossReferenceDialog';
import {
  autoHideDatasetDialogsOnScroll,
  resetCrossReferenceDialog,
  removeDatasetComplex,
  removeDatasetHitProtein,
  removeDatasetLigand,
  removeDatasetSurface
} from './redux/dispatchActions';
import { NglContext } from '../nglView/nglProvider';
import { VIEWS } from '../../constants/constants';
import FileSaver from 'file-saver';
import JSZip from 'jszip';
import { isCompoundFromVectorSelector } from '../preview/compounds/redux/dispatchActions';


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

  const imgHeight = 34;
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

  const { getNglView } = useContext(NglContext);
  const stage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;

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

  const ligandListAllDatasets = useSelector(state => state.datasetsReducers.ligandLists);
  const proteinListAllDatasets = useSelector(state => state.datasetsReducers.proteinLists);
  const complexListAllDatasets = useSelector(state => state.datasetsReducers.complexLists);
  const surfaceListAllDatasets = useSelector(state => state.datasetsReducers.surfaceLists);

  const showedCompoundList = useSelector(state => state.previewReducers.compounds.showedCompoundList);
  const filteredScoreProperties = useSelector(state => state.datasetsReducers.filteredScoreProperties);

  const removeOfAllSelectedTypes = () => {
    Object.keys(ligandListAllDatasets).forEach(datasetKey => {
      ligandListAllDatasets[datasetKey]?.forEach(moleculeID => {
        const foundedMolecule = currentMolecules?.find(mol => mol?.molecule?.id === moleculeID);
        dispatch(
          removeDatasetLigand(
            stage,
            foundedMolecule?.molecule,
            colourList[foundedMolecule?.molecule?.id % colourList.length],
            datasetKey
          )
        );
      });
    });
    Object.keys(proteinListAllDatasets).forEach(datasetKey => {
      proteinListAllDatasets[datasetKey]?.forEach(moleculeID => {
        const foundedMolecule = currentMolecules?.find(mol => mol?.molecule?.id === moleculeID);
        dispatch(
          removeDatasetHitProtein(
            stage,
            foundedMolecule?.molecule,
            colourList[foundedMolecule?.molecule?.id % colourList.length],
            datasetKey
          )
        );
      });
    });
    Object.keys(complexListAllDatasets).forEach(datasetKey => {
      complexListAllDatasets[datasetKey]?.forEach(moleculeID => {
        const foundedMolecule = currentMolecules?.find(mol => mol?.molecule?.id === moleculeID);
        dispatch(
          removeDatasetComplex(
            stage,
            foundedMolecule?.molecule,
            colourList[foundedMolecule?.molecule?.id % colourList.length],
            datasetKey
          )
        );
      });
    });
    Object.keys(surfaceListAllDatasets).forEach(datasetKey => {
      surfaceListAllDatasets[datasetKey]?.forEach(moleculeID => {
        const foundedMolecule = currentMolecules?.find(mol => mol?.molecule?.id === moleculeID);
        dispatch(
          removeDatasetSurface(
            stage,
            foundedMolecule?.molecule,
            colourList[foundedMolecule?.molecule?.id % colourList.length],
            datasetKey
          )
        );
      });
    });
  };

  useEffect(() => {
    return () => {
      dispatch(setIsOpenInspirationDialog(false));
      dispatch(resetCrossReferenceDialog());
    };
  }, [dispatch]);

  const getSetOfProps = (usedDatasets) => {
    const unionOfProps = new Set();

    unionOfProps.add('smiles');

    Object.keys(filteredScoreProperties).forEach(datasetName => {
      if (usedDatasets.hasOwnProperty(datasetName)){
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

  const prepareHeader = (props, maxIdsCount) => {
    let header = getIdsHeader(maxIdsCount);
    
    if (header.length > 0 && props.length > 0) {
      header += ',';
    }

    for (let i = 0; i < props.length; i++) {
      const prop = props[i];
      if (i < props.length - 1) {
        header += `${encodeURIComponent(prop)},`;
      } else {
        header += `${encodeURIComponent(prop)}`;
      }
    }

    return header;
  };

  const convertCompoundToCsvLine = (compound, props, maxIdsCount) => {
    let line = '';

    const molecule = compound.molecule;

    line = prepareMolIds(compound, maxIdsCount);

    if (line.length > 0 && props.length > 0) {
      line += ',';
    } else if (line.length === 0 && maxIdsCount > 0) {
      line += ',';
    }

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

      if (i < props.length - 1) {
        line += `${encodeURIComponent(value)},`;
      } else {
        line += `${encodeURIComponent(value)}`;
      }
    };

    return line;
  };

  const populateMolObject = (molObj, compound, props) => {
    const molecule = compound.molecule;

    molObj = populateMolIds(molObj, compound);

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

    };

    return molObj;
  };

  const populateMolIds = (molObj, compound) => {
    if (compound.molecule.hasOwnProperty('compound_ids')) {
      const ids = compound.molecule['compound_ids'];
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        molObj[`compound-id${i}`] = id;
      };
    }

    return molObj;
  };

  const getMaxNumberOfCmpIds = (mols) => {
    let maxLength = 0;

    mols.forEach(mol => {
      if (mol.molecule.hasOwnProperty('compound_ids')) {
        const ids = mol.molecule['compound_ids'];
        maxLength = maxLength < ids.length ? ids.length : maxLength;
      }
    });

    return maxLength;
  };

  const getIdsHeader = (maxIdsCount) => {
    let idsHeader = '';

    for (let i = 0; i < maxIdsCount; i++) {
      if (i < maxIdsCount - 1) {
        idsHeader += `id${i},`;
      } else {
        idsHeader += `id${i}`;
      }
    }

    return idsHeader;
  };

  const prepareMolIds = (compound, maxIdsCount) => {
    let idsHeader = '';

    if (compound.molecule.hasOwnProperty('compound_ids')) {
      const ids = compound.molecule['compound_ids'];
      for (let i = 0; i < maxIdsCount; i++) {
        if (i <= ids.length - 1) {
          const id = ids[i];
          if (i < ids.length - 1) {
            idsHeader += `${id},`;
          } else {
            idsHeader += `${id}`;
          }
        } else {
          if (i < maxIdsCount) {
            idsHeader += ',';
          }
        }
      };
    } else {
      for (let i = 0; i < maxIdsCount; i++) {
        if (i < maxIdsCount - 1) {
          idsHeader += ',';
        }
      }
    }

    return idsHeader;
  };

  const getUsedDatasets = (mols) => {
    const setOfDataSets = {};
    mols.forEach(mol => {
      if (!setOfDataSets.hasOwnProperty(mol.datasetID))
      setOfDataSets[mol.datasetID] = mol.datasetID;
    });

    return setOfDataSets;
  }

  const getEmptyMolObject = (props, maxIdsCount) => {
    let molObj = {};

    for (let i = 0; i < maxIdsCount; i++) {
      molObj[`compound-id${i}`] = '';
    };
    props.forEach(prop => {
      molObj[prop] = '';
    });

    return molObj;
  }

  const downloadAsCsv = () => {
    const usedDatasets = getUsedDatasets(moleculesObjectIDListOfCompoundsToBuy);
    const props = getSetOfProps(usedDatasets);
    let maxIdsCount = getMaxNumberOfCmpIds(moleculesObjectIDListOfCompoundsToBuy);
    let data = prepareHeader(props, maxIdsCount);

    const listOfMols = [];

    moleculesObjectIDListOfCompoundsToBuy.forEach(compound => {
      data += `\n${convertCompoundToCsvLine(compound, props, maxIdsCount)}`;
      let molObj = getEmptyMolObject(props, maxIdsCount);
      molObj = populateMolObject(molObj, compound, props)
      listOfMols.push(molObj);
    });
    const dataBlob = new Blob([data], { type: 'text/csv;charset=utf-8' });

    const jsonString = JSON.stringify(listOfMols);
    console.log(jsonString);

    FileSaver.saveAs(dataBlob, 'selectedCompounds.csv');
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
        <Button color="inherit" variant="text" onClick={downloadAsCsv} startIcon={<CloudDownload />} >    
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
                    removeOfAllSelectedTypes={removeOfAllSelectedTypes}
                    L={isLigandOn}
                    P={proteinList.includes(data.molecule.id)}
                    C={complexList.includes(data.molecule.id)}
                    S={surfaceList.includes(data.molecule.id)}
                    V={false}
                    fromSelectedCompounds={true}
                  />
                )
              })}
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
