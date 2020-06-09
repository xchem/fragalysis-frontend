import React, { memo, useState } from 'react';
import { Panel } from '../common/Surfaces/Panel';
import { CircularProgress, Grid, makeStyles } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { getMoleculesObjectIDListOfCompoundsToBuy } from './redux/selectors';
import InfiniteScroll from 'react-infinite-scroller';
import { DatasetMoleculeView } from './datasetMoleculeView';

const useStyles = makeStyles(theme => ({
  container: {
    height: '100%',
    width: 'inherit',
    color: theme.palette.black
  }
}));

export const SelectedCompoundList = memo(({ height }) => {
  const classes = useStyles();

  const imgHeight = 34;
  const imgWidth = 150;
  const moleculesPerPage = 5;
  const [currentPage, setCurrentPage] = useState(0);
  const moleculesObjectIDListOfCompoundsToBuy = useSelector(getMoleculesObjectIDListOfCompoundsToBuy);

  const loadNextMolecules = () => {
    setCurrentPage(currentPage + 1);
  };

  const listItemOffset = (currentPage + 1) * moleculesPerPage;
  const currentMolecules = moleculesObjectIDListOfCompoundsToBuy.slice(0, listItemOffset);
  const canLoadMore = listItemOffset < moleculesObjectIDListOfCompoundsToBuy.length;

  return (
    <Panel hasHeader title="Selected Compounds" withTooltip>
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
                />
              ))}
            </InfiniteScroll>
          </Grid>
        )}
      </Grid>
    </Panel>
  );
});
