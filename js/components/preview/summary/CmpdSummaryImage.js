/**
 * Created by abradley on 28/03/2018.
 */

import React, { memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SVGInline from 'react-svg-inline';
import { Box } from '@material-ui/core';
import { reloadSummaryCompoundImage } from './redux/dispatchAction';
import { getAllCurrentBondColorMapOfVectors } from '../../../reducers/selection/selectors';
import { resetCompoundImage } from './redux/actions';

export const CmpdSummaryImage = memo(() => {
  const dispatch = useDispatch();
  const compoundImage = useSelector(state => state.previewReducers.summary.compoundImage);
  const width = useSelector(state => state.previewReducers.summary.width);
  const height = useSelector(state => state.previewReducers.summary.height);
  const currentVector = useSelector(state => state.selectionReducers.currentVector);
  const currentBondColorMapOfVectors = useSelector(state => getAllCurrentBondColorMapOfVectors(state));

  useEffect(() => {
    if (currentVector && currentBondColorMapOfVectors) {
      dispatch(reloadSummaryCompoundImage({ currentVector, bondColorMap: currentBondColorMapOfVectors })).catch(
        error => {
          throw new Error(error);
        }
      );
    } else {
      dispatch(resetCompoundImage());
    }
  }, [currentBondColorMapOfVectors, currentVector, dispatch]);

  return (
    <Box height={height} width={width}>
      <SVGInline svg={compoundImage} />
    </Box>
  );
});
