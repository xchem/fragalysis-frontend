/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CmpdSummaryImage } from './CmpdSummaryImage';
import { Button } from '../../common/Inputs/Button';
import { Panel } from '../../common/Surfaces/Panel';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { CloudDownload } from '@material-ui/icons';
import { ComputeSize } from '../../../utils/computeSize';
import { downloadAsYankDuck, exportCsv, updateSummaryView } from './redux/dispatchAction';
import { isEmpty } from 'lodash';

const useStyles = makeStyles(theme => ({
  widthFitContent: {
    width: 'fit-content'
  }
}));

export const SummaryView = memo(({ setSummaryViewHeight, summaryViewHeight }) => {
  const classes = useStyles();
  const panelRef = useRef(undefined);
  const dispatch = useDispatch();
  const duck_yank_data = useSelector(state => state.apiReducers.present.duck_yank_data);
  const to_buy_list = useSelector(state => state.selectionReducers.present.to_buy_list);

  const countOfPicked = useSelector(state => state.previewReducers.summary.countOfPicked);
  const countOfExploredVectors = useSelector(state => state.previewReducers.summary.countOfExploredVectors);
  const countOfExploredSeries = useSelector(state => state.previewReducers.summary.countOfExploredSeries);
  const estimatedCost = useSelector(state => state.previewReducers.summary.estimatedCost);
  const selectedInteraction = useSelector(state => state.previewReducers.summary.selectedInteraction);
  const interaction_selectComponent = selectedInteraction === undefined ? 'Not selected' : selectedInteraction;

  const [state, setState] = useState();

  useEffect(() => {
    dispatch(updateSummaryView({ duck_yank_data, to_buy_list }));
  }, [dispatch, duck_yank_data, to_buy_list]);

  return (
    <Panel ref={panelRef}>
      <ComputeSize componentRef={panelRef.current} setHeight={setSummaryViewHeight} height={summaryViewHeight}>
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
        <Button color="primary" onClick={() => dispatch(exportCsv())} startIcon={<CloudDownload />}>
          Download CSV (Chrome)
        </Button>
        <Button
          color="primary"
          onClick={() =>
            dispatch(downloadAsYankDuck()).catch(error => {
              setState(() => {
                throw error;
              });
            })
          }
          startIcon={<CloudDownload />}
          disabled={isEmpty(duck_yank_data)}
        >
          Download Yank/Duck
        </Button>
      </ComputeSize>
    </Panel>
  );
});
