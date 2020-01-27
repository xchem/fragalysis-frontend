/**
 * Created by abradley on 28/03/2018.
 */

import React, { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SVGInline from 'react-svg-inline';
import { Box } from '@material-ui/core';
import { reloadSummaryCompoundImage } from './redux/dispatchAction';

export const CmpdSummaryImage = memo(() => {
  const dispatch = useDispatch();
  const [state, setState] = useState();
  const compoundImage = useSelector(state => state.previewReducers.summary.compoundImage);
  const width = useSelector(state => state.previewReducers.summary.width);
  const height = useSelector(state => state.previewReducers.summary.height);
  const currentVector = useSelector(state => state.selectionReducers.currentVector);
  const bondColorMap = useSelector(state => state.selectionReducers.bondColorMap);

  useEffect(() => {
    dispatch(reloadSummaryCompoundImage({ currentVector, bondColorMap })).catch(error => {
      setState(() => {
        throw error;
      });
    });
  }, [bondColorMap, currentVector, dispatch]);

  return (
    <Box height={height} width={width}>
      <SVGInline svg={compoundImage} />
    </Box>
  );
});
