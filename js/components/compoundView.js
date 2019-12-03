/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useState, useRef, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import * as selectionActions from '../reducers/selection/selectionActions';
import SVGInline from 'react-svg-inline';
import * as nglLoadActions from '../reducers/ngl/nglActions';
import { VIEWS } from '../constants/constants';
import { loadFromServer } from '../utils/genericView';
import { OBJECT_TYPE } from './nglView/constants';
import { api, getCsrfToken, METHOD } from '../utils/api';
import { img_data_init } from './molecule/moleculeView';

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
    data
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
    const refOnCancel = useRef();
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
        var post_data = {
          INPUT_VECTOR: send_obj.vector,
          INPUT_SMILES: [send_obj.smiles],
          INPUT_MOL_BLOCK: to_query_sdf_info
        };
        api({
          url: base_url + '/scoring/gen_conf_from_vect/',
          method: METHOD.POST,
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': getCsrfToken()
          },
          body: JSON.stringify(post_data)
        })
          .then(response => {
            // Now load this into NGL
            conf.current = response.data[0];
            loadObject(Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateMolObject(conf.current, data.smiles)));
          })
          .catch(error => {
            throw error;
          });
      }
    };

    // componentDidMount
    useEffect(() => {
      if (refOnCancel.current === undefined) {
        let onCancel = () => {};
        loadFromServer({
          width,
          height,
          key,
          old_url: oldUrl.current,
          setImg_data,
          setOld_url: newUrl => setOldUrl(newUrl),
          url,
          cancel: onCancel
        }).catch(error => {
          throw error;
        });
        if (to_buy_list.length !== 0) {
          checkInList();
        }
        refOnCancel.current = onCancel;
      }
      return () => {
        if (refOnCancel) {
          refOnCancel.current();
        }
      };
    }, [height, key, url, width, checkInList, to_buy_list.length]);

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
  setHighlighted: selectionActions.setHighlighted
};

export default connect(mapStateToProps, mapDispatchToProps)(CompoundView);
