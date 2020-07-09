import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { Panel } from '../common/Surfaces/Panel';
import { CircularProgress, Grid, makeStyles, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { getMoleculesObjectIDListOfCompoundsToBuy } from './redux/selectors';
import InfiniteScroll from 'react-infinite-scroller';
import { colourList, DatasetMoleculeView } from './datasetMoleculeView';
import { InspirationDialog } from './inspirationDialog';
import { setIsOpenInspirationDialog } from './redux/actions';
import { CrossReferenceDialog } from './crossReferenceDialog';
import {
  autoHideDatasetDialogsOnScroll,
  removeDatasetComplex,
  removeDatasetHitProtein,
  removeDatasetLigand,
  removeDatasetSurface,
  resetCrossReferenceDialog
} from './redux/dispatchActions';
import MoleculeView from '../preview/molecule/moleculeView';
import { NglContext } from '../nglView/nglProvider';
import { VIEWS } from '../../constants/constants';

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

  const ligandListAllDatasets = useSelector(state => state.datasetsReducers.ligandLists);
  const proteinListAllDatasets = useSelector(state => state.datasetsReducers.proteinLists);
  const complexListAllDatasets = useSelector(state => state.datasetsReducers.complexLists);
  const surfaceListAllDatasets = useSelector(state => state.datasetsReducers.surfaceLists);

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

  return (
    <Panel hasHeader title="Selected Compounds" withTooltip>
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
              {currentMolecules.map((data, index, array) => (
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
                />
              ))}
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
