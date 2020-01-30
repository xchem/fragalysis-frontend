/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useState, useRef, useCallback, useEffect, useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import * as selectionActions from '../../../reducers/selection/selectionActions';
import SVGInline from 'react-svg-inline';
import { deleteObject, loadObject } from '../../../reducers/ngl/nglDispatchActions';
import { VIEWS } from '../../../constants/constants';
import { loadFromServer } from '../../../utils/genericView';
import { api, getCsrfToken, METHOD } from '../../../utils/api';
import { img_data_init } from '../molecule/moleculeView';
import { NglContext } from '../../nglView/nglProvider';
import { generateCompoundMolObject } from '../../nglView/generatingObjects';
import { updateCurrentCompound } from './redux/actions';
import { handleClickOnCompound } from '../../../reducers/selection/selectors';
import { loadingCompoundImage } from './redux/reducer';

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
    id,
    updateCurrentCompound
  }) => {
    const dispatch = useDispatch();
    const { getNglView } = useContext(NglContext);
    const majorViewStage = getNglView(VIEWS.MAJOR_VIEW).stage;
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
    const [conf, setConf] = useState(false);
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

    const handleConf = () => {
      if (isConfOn) {
        deleteObject(
          Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateCompoundMolObject(conf, data.smiles)),
          majorViewStage
        );
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
          data: JSON.stringify(post_data)
        })
          .then(response => {
            // Now load this into NGL
            const newConf = response.data[0];
            loadObject(
              Object.assign({ display_div: VIEWS.MAJOR_VIEW }, generateCompoundMolObject(newConf, data.smiles)),
              majorViewStage
            );
            setConf(newConf);
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
          setImg_data: image => updateCurrentCompound({ id, key: 'image', value: image }),
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
    }, [height, key, url, width, checkInList, to_buy_list.length, updateCurrentCompound, id]);

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
      <div
        // onClick={event => dispatch(handleClickOnCompound({ event, send_obj, setIsConfOn, isConfOn }))}
        style={current_style}
      >
        {data.image && <SVGInline svg={data.image} />}
      </div>
    );
  }
);

function mapStateToProps(state) {
  return {
    to_buy_list: state.selectionReducers.to_buy_list,
    to_query_sdf_info: state.selectionReducers.to_query_sdf_info,
    highlightedCompound: state.selectionReducers.highlightedCompound,
    currentCompoundClass: state.selectionReducers.currentCompoundClass
  };
}

const mapDispatchToProps = {
  loadObject,
  deleteObject,
  removeFromToBuyList: selectionActions.removeFromToBuyList,
  appendToBuyList: selectionActions.appendToBuyList,
  setHighlighted: selectionActions.setHighlighted,
  updateCurrentCompound
};

export default connect(mapStateToProps, mapDispatchToProps)(CompoundView);
