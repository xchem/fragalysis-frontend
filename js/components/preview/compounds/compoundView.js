/**
 * Created by abradley on 15/03/2018.
 */
import React, { memo, useState, useRef, useEffect, useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import * as selectionActions from '../../../reducers/selection/selectionActions';
import SVGInline from 'react-svg-inline';
import { deleteObject, loadObject } from '../../../reducers/ngl/nglDispatchActions';
import { VIEWS } from '../../../constants/constants';
import { loadFromServer } from '../../../utils/genericView';
import { NglContext } from '../../nglView/nglProvider';
import { updateCurrentCompound } from './redux/actions';
import { compoundsColors } from './redux/constants';
import { handleClickOnCompound } from './redux/dispatchActions';

const CompoundView = memo(
  ({
    to_buy_list,
    to_query_sdf_info,
    currentCompoundClass,
    loadObject,
    deleteObject,
    removeFromToBuyList,
    appendToBuyList,
    height,
    width,
    data,
    id,
    updateCurrentCompound
  }) => {
    const dispatch = useDispatch();
    const { getNglView } = useContext(NglContext);
    const majorViewStage = getNglView(VIEWS.MAJOR_VIEW).stage;

    const send_obj = data;

    let url = undefined;
    let key = undefined;
    // const [isHighlighted, setIsHighlighted] = useState(false);
    //    const [compoundClass, setCompoundClass] = useState();
    const refOnCancel = useRef();
    const [conf, setConf] = useState(false);
    const oldUrl = useRef('');
    const setOldUrl = newUrl => {
      oldUrl.current = newUrl;
    };

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

    /*
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
      //   setCompoundClass(compoundClassTemp);
    }, [highlightedCompound.smiles, send_obj.smiles, to_buy_list]);
*/
    // componentDidMount
    useEffect(() => {
      if (refOnCancel.current === undefined) {
        let onCancel = () => {};
        loadFromServer({
          width,
          height,
          key,
          old_url: oldUrl.current,
          setImg_data: image => updateCurrentCompound({ id: data.index, key: 'image', value: image }),
          setOld_url: newUrl => setOldUrl(newUrl),
          url,
          cancel: onCancel
        }).catch(error => {
          throw error;
        });
        if (to_buy_list.length !== 0) {
          //  checkInList();
        }
        refOnCancel.current = onCancel;
      }
      return () => {
        if (refOnCancel) {
          refOnCancel.current();
        }
      };
    }, [
      height,
      key,
      url,
      width, // checkInList,
      to_buy_list.length,
      updateCurrentCompound,
      id,
      data.index
    ]);
    /*
    useEffect(() => {
      checkInList();
    }, [checkInList]);*/
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

    if (data && data.isHighlighted === true) {
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
  }
);

function mapStateToProps(state) {
  return {
    to_buy_list: state.selectionReducers.to_buy_list,
    to_query_sdf_info: state.selectionReducers.to_query_sdf_info,
    currentCompoundClass: state.previewReducers.compounds.currentCompoundClass
  };
}

const mapDispatchToProps = {
  loadObject,
  deleteObject,
  removeFromToBuyList: selectionActions.removeFromToBuyList,
  appendToBuyList: selectionActions.appendToBuyList,
  updateCurrentCompound
};

export default connect(mapStateToProps, mapDispatchToProps)(CompoundView);
