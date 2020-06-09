import React, { memo, useEffect, useRef, useState } from 'react';
import { Panel } from '../common/Surfaces/Panel';
import { CircularProgress, Grid, makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { getMoleculesObjectIDListOfCompoundsToBuy } from './redux/selectors';
import InfiniteScroll from 'react-infinite-scroller';
import { DatasetMoleculeView } from './datasetMoleculeView';
import { InspirationDialog } from './inspirationDialog';
import { setIsOpenInspirationDialog } from './redux/actions';

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
  const [selectedInspirationMoleculeRef, setSelectedInspirationMoleculeRef] = useState(null);
  const inspirationDialogRef = useRef();

  const loadNextMolecules = () => {
    setCurrentPage(currentPage + 1);
  };

  const listItemOffset = (currentPage + 1) * moleculesPerPage;
  const currentMolecules = moleculesObjectIDListOfCompoundsToBuy.slice(0, listItemOffset);
  const canLoadMore = listItemOffset < moleculesObjectIDListOfCompoundsToBuy.length;

  useEffect(() => {
    return () => {
      dispatch(setIsOpenInspirationDialog(false));
    };
  }, [dispatch]);

  return (
    <Panel hasHeader title="Selected Compounds" withTooltip>
      {isOpenInspirationDialog && (
        <InspirationDialog
          open
          anchorEl={selectedInspirationMoleculeRef}
          //    datasetID={datasetID}
          ref={inspirationDialogRef}
        />
      )}
      <Grid container direction="column" justify="flex-start" className={classes.container} style={{ height: height }}>
        {currentMolecules.length > 0 && (
          <Grid item className={classes.gridItemList}>
            <InfiniteScroll
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
              {currentMolecules.map((data, index) => (
                <DatasetMoleculeView
                  key={index}
                  imageHeight={imgHeight}
                  imageWidth={imgWidth}
                  data={data.molecule}
                  datasetID={data.datasetID}
                  setRef={setSelectedInspirationMoleculeRef}
                />
              ))}
            </InfiniteScroll>
          </Grid>
        )}
      </Grid>
    </Panel>
  );
});
