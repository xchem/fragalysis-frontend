/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useEffect, useContext, useState } from 'react';
import { Tooltip, makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import SVGInline from 'react-svg-inline';
import { VIEWS } from '../../../constants/constants';
import { NglContext } from '../../nglView/nglProvider';
import { compoundsColors } from './redux/constants';
import { handleClickOnCompound, loadCompoundImageData } from './redux/dispatchActions';
import { CompoundDataView } from './compoundDataView';

export const loadingCompoundImage = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100px" height="100px"><g>
  <circle cx="50" cy="50" fill="none" stroke="#3f51b5" stroke-width="4" r="26" stroke-dasharray="150.79644737231007 52.26548245743669" transform="rotate(238.988 50 50)">
    <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.689655172413793s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
  </circle>  '</svg>`;

const useStyles = makeStyles(theme => ({
  compundItem: {
    marginRight: `${theme.spacing(1)}px`,
    marginTop: `${theme.spacing(1)}px`
  }
}));

export const CompoundView = memo(({ height, width, data, index }) => {
  const dispatch = useDispatch();
  const classes = useStyles();

  const highlightedCompoundId = useSelector(state => state.previewReducers.compounds.highlightedCompoundId);
  const showedCompoundList = useSelector(state => state.previewReducers.compounds.showedCompoundList);
  const selectedCompoundsClass = useSelector(state => state.previewReducers.compounds.selectedCompoundsClass);
  const allSelectedCompounds = useSelector(state => state.previewReducers.compounds.allSelectedCompounds);
  const { getNglView } = useContext(NglContext);
  const majorViewStage = getNglView(VIEWS.MAJOR_VIEW) && getNglView(VIEWS.MAJOR_VIEW).stage;
  const [image, setImage] = useState(loadingCompoundImage);

  useEffect(() => {
    let onCancel = () => {};
    loadCompoundImageData({ width, height, data, onCancel, setImage }).catch(error => {
      throw new Error(error);
    });
    return () => {
      onCancel();
    };
  }, [height, width, data]);

  const not_selected_style = {
    width: (width + 5).toString() + 'px',
    height: (height + 5).toString() + 'px',
    display: 'inline-block'
  };
  const showedStyle = { opacity: '0.25' };
  const highlightedStyle = { borderStyle: 'solid' };
  const currentCompoundIds = data.compound_ids;

  let current_style = Object.assign({}, not_selected_style);
  if (showedCompoundList.find(item => item === data.smiles) !== undefined) {
    current_style = Object.assign(current_style, showedStyle);
  }

  if (index === highlightedCompoundId) {
    current_style = Object.assign(current_style, highlightedStyle);
  }

  let classFound = false;
  Object.keys(selectedCompoundsClass).forEach(classKey => {
    if (selectedCompoundsClass[classKey].find(item => item === index) !== undefined) {
      classFound = true;
      current_style = Object.assign(current_style, {
        backgroundColor: compoundsColors[classKey].color
      });
    }
  });

  if (!classFound) {
    if (allSelectedCompounds[data.smiles]) {
      const foundData = allSelectedCompounds[data.smiles];
      if (foundData['compoundClass']) {
        current_style = Object.assign(current_style, {
          backgroundColor: compoundsColors[foundData['compoundClass']].color
        });
      }
    }
  }

  return (
    <div>
      <div
        className={classes.compundItem}
        onClick={event => {
          if (majorViewStage) {
            dispatch(handleClickOnCompound({ event, data, majorViewStage, index }));
          }
        }}
        style={current_style}
      >
        <Tooltip title={<CompoundDataView currentCompoundIds={currentCompoundIds} isTooltip={true} index={index} />}>
          <SVGInline svg={image} />
        </Tooltip>
        <CompoundDataView currentCompoundIds={currentCompoundIds} isTooltip={false} index={index} />
      </div>
    </div>
  );
});
