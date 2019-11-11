/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import * as selectionActions from '../reducers/selection/selectionActions';
import SVGInline from 'react-svg-inline';
import * as nglLoadActions from '../reducers/ngl/nglLoadActions';
import { VIEWS } from '../constants/constants';
import { loadFromServer } from '../utils/genericView';
import { OBJECT_TYPE } from './nglView/constants';
import * as apiActions from '../reducers/api/apiActions';
import { api, METHOD } from '../utils/api';

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

const CompoundView = memo(
  ({
    to_buy_list,
    to_query_sdf_info,
    highlightedCompound,
    currentCompoundClass,
    loadObject,
    deleteObject,
    removeFromToBuyList,
    appendToBuyList,
    setHighlighted,
    height,
    width,
    data,
    setErrorMessage
  }) => {
    const not_selected_style = {
      width: (width + 5).toString() + 'px',
      height: (height + 5).toString() + 'px',
      display: 'inline-block'
    };
    const send_obj = data;
    const conf_on_style = { opacity: '0.3' };
    const highlightedCompStyle = { borderStyle: 'solid' };
    let url = undefined;
    let key = undefined;
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [compoundClass, setCompoundClass] = useState();
    const [isConfOn, setIsConfOn] = useState(false);
    const refDidMount = useRef(false);
    const conf = useRef(false);
    const oldUrl = useRef('');
    const setOldUrl = newUrl => {
      oldUrl.current = newUrl;
    };
    const [img_data, setImg_data] = useState(img_data_init);

    // tu je key, nie je tu vlastny loader
    const base_url = window.location.protocol + '//' + window.location.host;
    if (data.id !== undefined) {
      url = new URL(base_url + '/api/cmpdimg/' + data.id + '/');
      key = 'cmpd_image';
    } else {
      url = new URL(base_url + '/viewer/img_from_smiles/');
      var get_params = { smiles: data.show_frag };
      Object.keys(get_params).forEach(p => url.searchParams.append(p, get_params[p]));
    }

    const getCookie = name => {
      if (!document.cookie) {
        return null;
      }
      const xsrfCookies = document.cookie
        .split(';')
        .map(c => c.trim())
        .filter(c => c.startsWith(name + '='));
      if (xsrfCookies.length === 0) {
        return null;
      }
      return decodeURIComponent(xsrfCookies[0].split('=')[1]);
    };

    const checkInList = useCallback(() => {
      let isHighlightedTemp = false;
      if (highlightedCompound.smiles === send_obj.smiles) {
        isHighlightedTemp = true;
      }
      setIsHighlighted(isHighlightedTemp);

      let compoundClassTemp = 0;
      for (var item in to_buy_list) {
        if (to_buy_list[item].smiles === send_obj.smiles) {
          compoundClassTemp = to_buy_list[item].class;
          break;
        }
      }
      setCompoundClass(compoundClassTemp);
    }, [highlightedCompound.smiles, send_obj.smiles, to_buy_list]);

    const handleClick = e => {
      setHighlighted({
        index: send_obj.index,
        smiles: send_obj.smiles
      });
      if (e.shiftKey) {
        setIsConfOn(!isConfOn);
        handleConf();
      } else {
        if (compoundClass === currentCompoundClass) {
          setCompoundClass(0);
          removeFromToBuyList(send_obj);
        } else {
          setCompoundClass(currentCompoundClass);
          Object.assign(send_obj, {
            class: parseInt(currentCompoundClass)
          });
          appendToBuyList(send_obj);
        }
      }
    };

    const generateMolObject = (sdf_info, identifier) => ({
      name: 'CONFLOAD_' + identifier,
      OBJECT_TYPE: OBJECT_TYPE.MOLECULE,
      colour: 'cyan',
      sdf_info: sdf_info
    });

    const handleConf = () => {
      if (isConfOn) {
        deleteObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMolObject(conf.current, data.smiles)));
      } else {
        // This needs currying
        const csrfToken = getCookie('csrftoken');
        var post_data = {
          INPUT_VECTOR: send_obj.vector,
          INPUT_SMILES: [send_obj.smiles],
          INPUT_MOL_BLOCK: to_query_sdf_info
        };
        api({
          url: base_url + '/scoring/gen_conf_from_vect/',
          method: METHOD.POST,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': csrfToken
          },
          body: JSON.stringify(post_data)
        })
          .then(response => {
            // Now load this into NGL
            conf.current = response.data[0];
            loadObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMolObject(conf.current, data.smiles)));
          })
          .catch(error => {
            setErrorMessage(error);
          });
      }
    };

    // componentDidMount
    useEffect(() => {
      if (refDidMount.current === false) {
        loadFromServer({
          width,
          height,
          key,
          old_url: oldUrl.current,
          setImg_data,
          setOld_url: newUrl => setOldUrl(newUrl),
          url
        }).catch(error => {
          setErrorMessage(error);
        });
        if (to_buy_list.length !== 0) {
          checkInList();
        }
        refDidMount.current = true;
      }
    }, [height, key, url, width, checkInList, to_buy_list.length, setErrorMessage]);

    useEffect(() => {
      checkInList();
    }, [checkInList]);

    let current_style = Object.assign({}, not_selected_style);
    if (isConfOn === true) {
      current_style = Object.assign(current_style, conf_on_style);
    }
    if (isHighlighted === true) {
      current_style = Object.assign(current_style, highlightedCompStyle);
    }
    if (compoundClass !== 0) {
      const colourList = ['null', '#b3cde3', '#fbb4ae', '#ccebc5', '#decbe4', '#fed9a6'];
      current_style = Object.assign(current_style, {
        backgroundColor: colourList[compoundClass]
      });
    }
    return (
      <div onClick={handleClick} style={current_style}>
        <SVGInline svg={img_data} />
      </div>
    );
  }
);

function mapStateToProps(state) {
  return {
    to_buy_list: state.selectionReducers.present.to_buy_list,
    to_query_sdf_info: state.selectionReducers.present.to_query_sdf_info,
    highlightedCompound: state.selectionReducers.present.highlightedCompound,
    currentCompoundClass: state.selectionReducers.present.currentCompoundClass
  };
}

const mapDispatchToProps = {
  loadObject: nglLoadActions.loadObject,
  deleteObject: nglLoadActions.deleteObject,
  removeFromToBuyList: selectionActions.removeFromToBuyList,
  appendToBuyList: selectionActions.appendToBuyList,
  setHighlighted: selectionActions.setHighlighted,
  setErrorMessage: apiActions.setErrorMessage
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CompoundView);
