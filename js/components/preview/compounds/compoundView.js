/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useEffect, useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SVGInline from 'react-svg-inline';
import { VIEWS } from '../../../constants/constants';
import { NglContext } from '../../nglView/nglProvider';
import { compoundsColors } from './redux/constants';
import { handleClickOnCompound, loadCompoundImageData } from './redux/dispatchActions';

export const CompoundView = memo(({ height, width, data }) => {
  const dispatch = useDispatch();
  const highlightedCompoundId = useSelector(state => state.previewReducers.compounds.highlightedCompoundId);
  const { getNglView } = useContext(NglContext);
  const majorViewStage = getNglView(VIEWS.MAJOR_VIEW).stage;

  const [oldUrl, setOldUrl] = useState('');
  const [state, setState] = useState();

  useEffect(() => {
    let onCancel = () => {};
    dispatch(loadCompoundImageData({ width, height, data, onCancel, oldUrl, setOldUrl })).catch(error => {
      setState(() => {
        throw error;
      });
    });
    return () => {
      onCancel();
    };
  }, [height, width, data, oldUrl, dispatch]);

  const not_selected_style = {
    width: (width + 5).toString() + 'px',
    height: (height + 5).toString() + 'px',
    display: 'inline-block'
  };
  const showedStyle = { opacity: '0.25' };
  const highlightedStyle = { borderStyle: 'solid' };

  let current_style = Object.assign({}, not_selected_style);
  if (data && data.isShowed === true) {
    current_style = Object.assign(current_style, showedStyle);
  }

  if (data && data.index === highlightedCompoundId) {
    current_style = Object.assign(current_style, highlightedStyle);
  }

  if (data && data.selectedClass) {
    current_style = Object.assign(current_style, {
      backgroundColor: compoundsColors[data.selectedClass].color
    });
  }

  return (
    <div onClick={event => dispatch(handleClickOnCompound({ event, data, majorViewStage }))} style={current_style}>
      {data.image && <SVGInline svg={data.image} />}
    </div>
  );
});
