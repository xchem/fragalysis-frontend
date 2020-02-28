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
import { HeaderContext } from '../../header/headerContext';

export const loadingCompoundImage = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100px" height="100px"><g>
  <circle cx="50" cy="50" fill="none" stroke="#3f51b5" stroke-width="4" r="26" stroke-dasharray="150.79644737231007 52.26548245743669" transform="rotate(238.988 50 50)">
    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.689655172413793s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
  </circle>  '</svg>`;

export const CompoundView = memo(({ height, width, data, index }) => {
  const dispatch = useDispatch();
  const highlightedCompoundId = useSelector(state => state.previewReducers.compounds.highlightedCompoundId);
  const showedCompoundList = useSelector(state => state.previewReducers.compounds.showedCompoundList);
  const selectedCompoundsClass = useSelector(state => state.previewReducers.compounds.selectedCompoundsClass);
  const { getNglView } = useContext(NglContext);
  const majorViewStage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
  const [image, setImage] = useState(loadingCompoundImage);

  const { setError } = useContext(HeaderContext);

  useEffect(() => {
    let onCancel = () => {};
    loadCompoundImageData({ width, height, data, onCancel, setImage }).catch(error => {
      setError(error);
    });
    return () => {
      onCancel();
    };
  }, [height, width, data, setError]);

  const not_selected_style = {
    width: (width + 5).toString() + 'px',
    height: (height + 5).toString() + 'px',
    display: 'inline-block'
  };
  const showedStyle = { opacity: '0.25' };
  const highlightedStyle = { borderStyle: 'solid' };

  let current_style = Object.assign({}, not_selected_style);
  if (showedCompoundList.find(item => item === index) !== undefined) {
    current_style = Object.assign(current_style, showedStyle);
  }

  if (index === highlightedCompoundId) {
    current_style = Object.assign(current_style, highlightedStyle);
  }

  Object.keys(selectedCompoundsClass).forEach(classKey => {
    if (selectedCompoundsClass[classKey].find(item => item === index) !== undefined) {
      current_style = Object.assign(current_style, {
        backgroundColor: compoundsColors[classKey].color
      });
    }
  });

  return (
    <div
      onClick={event => {
        if (majorViewStage) {
          dispatch(handleClickOnCompound({ event, data, majorViewStage, index, setError }));
        }
      }}
      style={current_style}
    >
      <SVGInline svg={image} />
    </div>
  );
});
