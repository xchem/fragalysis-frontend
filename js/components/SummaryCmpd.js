/**
 * Created by abradley on 28/03/2018.
 */

import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import SVGInline from 'react-svg-inline';
import { api } from '../utils/api';
import * as apiActions from '../reducers/api/apiActions';

const img_data_init =
  '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="50px" height="50px"><g>' +
  '<circle cx="50" cy="0" r="5" transform="translate(5 5)"/>' +
  '<circle cx="75" cy="6.6987298" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="93.3012702" cy="25" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="100" cy="50" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="93.3012702" cy="75" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="75" cy="93.3012702" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="50" cy="100" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="25" cy="93.3012702" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="6.6987298" cy="75" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="0" cy="50" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="6.6987298" cy="25" r="5" transform="translate(5 5)"/> ' +
  '<circle cx="25" cy="6.6987298" r="5" transform="translate(5 5)"/> ' +
  '<animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 55 55" to="360 55 55" dur="3s" repeatCount="indefinite" /> </g> ' +
  '</svg>';

const SummaryCmpd = memo(({ to_query, bondColorMap, currentVector, width, height, setErrorMessage }) => {
  const [img_data, setImg_data] = useState(img_data_init);
  const [isToggleOn, setIsToggleOn] = useState(false);
  const oldUrl = useRef('');
  const setOldUrl = url => {
    oldUrl.current = url;
  };
  const base_url = window.location.protocol + '//' + window.location.host;
  const url = useRef('');

  const handleClick = () => {
    setIsToggleOn(!isToggleOn);
  };

  const fetchFromServer = useCallback(() => {
    let get_params = {
      width,
      height
    };
    Object.keys(get_params).forEach(key => url.current.searchParams.append(key, get_params[key]));
    if (url.current.toString() !== oldUrl.current) {
      api({ url: url.current })
        .then(response => setImg_data(response.data))
        .catch(error => {
          setErrorMessage(error);
        });
    }
    setOldUrl(url.current.toString());
  }, [height, width, setErrorMessage]);

  const getAtomIndices = useCallback(() => {
    if (currentVector === undefined) {
      return undefined;
    }
    if (bondColorMap === undefined) {
      return undefined;
    }
    let optionList = bondColorMap[currentVector];
    let outStrList = [];
    for (let index in optionList) {
      let newList = [];
      for (let newIndex in optionList[index]) {
        if (optionList[index][newIndex] === 'NA') {
          newList.push(101);
        } else {
          newList.push(optionList[index][newIndex]);
        }
      }
      let newStr = newList.join(',');
      outStrList.push(newStr);
    }
    return outStrList.join(',');
  }, [bondColorMap, currentVector]);

  const update = useCallback(() => {
    let atomIndices = getAtomIndices();
    url.current = new URL(base_url + '/viewer/img_from_smiles/');
    let get_params = {};
    if (atomIndices !== undefined && to_query !== undefined) {
      get_params = { smiles: to_query, atom_indices: atomIndices };
    } else if (to_query !== undefined) {
      get_params = { smiles: to_query };
    }
    Object.keys(get_params).forEach(key => url.current.searchParams.append(key, get_params[key]));
    fetchFromServer();
  }, [base_url, getAtomIndices, fetchFromServer, to_query]);

  useEffect(() => {
    update();
  }, [update]);

  return (
    <div onClick={handleClick}>
      <SVGInline svg={img_data} />
    </div>
  );
});

function mapStateToProps(state) {
  return {
    to_query: state.selectionReducers.present.to_query,
    bondColorMap: state.selectionReducers.present.bondColorMap,
    currentVector: state.selectionReducers.present.currentVector
  };
}

const mapDispatchToProps = {
  setErrorMessage: apiActions.setErrorMessage
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SummaryCmpd);
