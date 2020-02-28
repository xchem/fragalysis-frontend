/**
 * Created by abradley on 28/03/2018.
 */

import React, { memo, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SVGInline from 'react-svg-inline';
import { Box } from '@material-ui/core';
import { reloadSummaryCompoundImage } from './redux/dispatchAction';
import { HeaderContext } from '../../header/headerContext';

export const CmpdSummaryImage = memo(() => {
  const dispatch = useDispatch();
  const { setError } = useContext(HeaderContext);
  const compoundImage = useSelector(state => state.previewReducers.summary.compoundImage);
  const width = useSelector(state => state.previewReducers.summary.width);
  const height = useSelector(state => state.previewReducers.summary.height);
  const currentVector = useSelector(state => state.selectionReducers.currentVector);
  const bondColorMap = useSelector(state => state.selectionReducers.bondColorMap);

  useEffect(() => {
    dispatch(reloadSummaryCompoundImage({ currentVector, bondColorMap })).catch(error => {
      setError(error);
    });
  }, [bondColorMap, currentVector, dispatch, setError]);

  return (
    <Box height={height} width={width}>
      <SVGInline svg={compoundImage} />
    </Box>
  );
});
