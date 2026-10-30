import React, { useContext } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { BACKGROUND_COLOR, NGL_VIEW_DEFAULT_VALUES } from '../../nglView/constants';
import { NglContext } from '../../nglView/nglProvider';
import { VIEWS } from '../../../constants/constants';
import { setNglBckGrndColor } from '../../../reducers/ngl/dispatchActions';

export const BackgroundColorToggle = ({ showLabel = false }) => {
  const backgroundColor = useSelector(
    state => state.nglReducers.viewParams.backgroundColor ?? NGL_VIEW_DEFAULT_VALUES.backgroundColor
  );
  const dispatch = useDispatch();
  const { getViewerAdapter } = useContext(NglContext);
  const isLight = backgroundColor === BACKGROUND_COLOR.light || backgroundColor === BACKGROUND_COLOR.white;
  const control = (
    <Switch
      size="small"
      color="primary"
      checked={isLight}
      slotProps={{ input: { 'aria-label': 'Light background' } }}
      onChange={(_, checked) =>
        dispatch(
          setNglBckGrndColor(checked ? BACKGROUND_COLOR.light : BACKGROUND_COLOR.black, getViewerAdapter(VIEWS.MAJOR_VIEW))
        )
      }
    />
  );

  return showLabel ? (
    <FormControlLabel
      sx={{ margin: 0, flexShrink: 0 }}
      control={control}
      label={isLight ? 'Light' : 'Dark'}
      labelPlacement="bottom"
    />
  ) : (
    control
  );
};
