/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CmpdSummaryImage } from './CmpdSummaryImage';
import { Panel } from '../../common/Surfaces/Panel';
import { Grid, makeStyles, Typography, Button } from '@material-ui/core';
import { CloudDownload } from '@material-ui/icons';
import { ComputeSize } from '../../../utils/computeSize';
import { exportCsv, updateSummaryView } from './redux/dispatchAction';

const useStyles = makeStyles(theme => ({
  widthFitContent: {
    width: 'fit-content'
  },
  downloadButton: {
    marginRight: theme.spacing(1)
  }
}));

export const SummaryView = memo(({ setSummaryViewHeight, summaryViewHeight }) => {
  const classes = useStyles();
  const [panelRef, setPanelRef] = useState();
  const dispatch = useDispatch();
  const duck_yank_data = useSelector(state => state.apiReducers.duck_yank_data);
  const to_buy_list = useSelector(state => state.selectionReducers.to_buy_list);

  const countOfPicked = useSelector(state => state.previewReducers.summary.countOfPicked);
  const countOfExploredVectors = useSelector(state => state.previewReducers.summary.countOfExploredVectors);
  const countOfExploredSeries = useSelector(state => state.previewReducers.summary.countOfExploredSeries);
  const estimatedCost = useSelector(state => state.previewReducers.summary.estimatedCost);
  const selectedInteraction = useSelector(state => state.previewReducers.summary.selectedInteraction);
  const interaction_selectComponent = selectedInteraction === undefined ? 'Not selected' : selectedInteraction;

  useEffect(() => {
    dispatch(updateSummaryView({ duck_yank_data, to_buy_list }));
  }, [dispatch, duck_yank_data, to_buy_list]);

  return (
    <Panel
      ref={ref => {
        setPanelRef(ref);
      }}
      hasHeader
      headerActions={[
      ]}
      title="Summary Info"
    >
      <ComputeSize componentRef={panelRef} setHeight={setSummaryViewHeight} height={summaryViewHeight}>
        <Grid container justify="space-between">
          <Grid
            item
            container
            direction="column"
            justify="flex-start"
            alignItems="flex-start"
            className={classes.widthFitContent}
          >
            <Grid item>
              <Typography variant="subtitle2">Number picked: {countOfPicked}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle2">Number vectors explored: {countOfExploredVectors}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle2">Number series explored: {countOfExploredSeries}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle2">Estimated cost: £{estimatedCost}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle2">Selected Interaction: {interaction_selectComponent}</Typography>
            </Grid>
          </Grid>
          <Grid item>
            <CmpdSummaryImage />
          </Grid>
        </Grid>
      </ComputeSize>
    </Panel>
  );
});
