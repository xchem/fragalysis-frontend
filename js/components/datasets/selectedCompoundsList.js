import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { Panel } from '../common/Surfaces/Panel';
import { CircularProgress, Grid, makeStyles, Typography } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { getMoleculesObjectIDListOfCompoundsToBuy } from './redux/selectors';
import InfiniteScroll from 'react-infinite-scroller';
import { DatasetMoleculeView } from './datasetMoleculeView';
import { InspirationDialog } from './inspirationDialog';
import { setIsOpenInspirationDialog } from './redux/actions';
import { CrossReferenceDialog } from './crossReferenceDialog';
import {
  autoHideDatasetDialogsOnScroll,
  resetCrossReferenceDialog,
  moveMoleculeInspirationsSettings,
  removeAllSelectedDatasetMolecules
} from './redux/dispatchActions';
import { NglContext } from '../nglView/nglProvider';
import { VIEWS } from '../../constants/constants';
import { hideAllSelectedMolecules } from '../preview/molecule/redux/dispatchActions';
import { getMoleculeList } from '../preview/molecule/redux/selectors';

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

  const objectsInView = useSelector(state => state.nglReducers.objectsInView) || {};

  const getJoinedMoleculeList = useSelector(state => getMoleculeList(state));
  const allInspirationMoleculeDataList = useSelector(state => state.datasetsReducers.allInspirationMoleculeDataList);

  const proteinListMolecule = useSelector(state => state.selectionReducers.proteinList);
  const complexListMolecule = useSelector(state => state.selectionReducers.complexList);
  const fragmentDisplayListMolecule = useSelector(state => state.selectionReducers.fragmentDisplayList);
  const surfaceListMolecule = useSelector(state => state.selectionReducers.surfaceList);
  const densityListMolecule = useSelector(state => state.selectionReducers.densityList);
  const vectorOnListMolecule = useSelector(state => state.selectionReducers.vectorOnList);

  const removeOfAllSelectedTypes = () => {
    dispatch(removeAllSelectedDatasetMolecules(stage));
  };

  const removeOfAllSelectedTypesOfInspirations = () => {
    let molecules = [...getJoinedMoleculeList, ...allInspirationMoleculeDataList];
    dispatch(hideAllSelectedMolecules(stage, [...molecules]));
  };

  const moveSelectedMoleculeInspirationsSettings = (data, newItemData) => (dispatch, getState) => {
    dispatch(
      moveMoleculeInspirationsSettings(
        data,
        newItemData,
        stage,
        objectsInView,
        fragmentDisplayListMolecule,
        proteinListMolecule,
        complexListMolecule,
        surfaceListMolecule,
        densityListMolecule,
        vectorOnListMolecule
      )
    );
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
                  removeOfAllSelectedTypesOfInspirations={removeOfAllSelectedTypesOfInspirations}
                  moveSelectedMoleculeInspirationsSettings={moveSelectedMoleculeInspirationsSettings}
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
