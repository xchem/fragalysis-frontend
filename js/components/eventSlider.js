/**
 * Created by abradley on 19/04/2018.
 */
import React, { memo, useCallback, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../actions/apiActions';
import * as nglLoadActions from '../actions/nglLoadActions';
import * as nglObjectTypes from './nglObjectTypes';
import { PREFIX, VIEWS } from '../constants/constants';
import { handleBackward, handleChange, handleForward } from '../utils/genericSlider';
import { Pager, Well } from 'react-bootstrap';

const EventSlider = memo(({ object_list, object_on, setObjectOn, deleteObject, loadObject }) => {
  const slider_name = 'Pandda Event';
  const [currentlySelected, setCurrentlySelected] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [progress_string, setProgress_string] = useState('');

  const generateEventMapObject = data => {
    // Get the data
    return {
      name: PREFIX.EVENT_LOAD + data.id.toString(),
      OBJECT_TYPE: nglObjectTypes.EVENTMAP,
      map_info: data.small_map_info,
      xtal: data.xtal,
      lig_id: data.lig_id,
      pdb_info: data.pdb_info
    };
  };

  const newOption = useCallback(
    new_value => {
      for (let index in object_list) {
        if (object_list[index].id === new_value) {
          // Build the map
          loadObject(Object.assign({ display_div: VIEWS.PANDDA_MAJOR }, generateEventMapObject(object_list[index])));
        } else if (object_list[index].id === object_on) {
          deleteObject(Object.assign({ display_div: VIEWS.PANDDA_MAJOR }, generateEventMapObject(object_list[index])));
        }
      }
    },
    [deleteObject, loadObject, object_list, object_on]
  );

  const handleOnChange = useCallback(
    selected =>
      handleChange({
        selected,
        object_list,
        setCurrentlySelected,
        setProgress,
        setProgress_string,
        setObjectOn,
        newOption
      }),
    [newOption, object_list, setObjectOn]
  );

  const checkForUpdate = useCallback(() => {
    if (object_list !== []) {
      let selected;
      let counter = 0;
      for (let index in object_list) {
        if (object_list[index].id === object_on) {
          selected = counter;
        }
        counter += 1;
      }
      if (selected !== undefined && selected !== currentlySelected) {
        handleOnChange(selected);
      }
    }
  }, [currentlySelected, handleOnChange, object_list, object_on]);

  useEffect(() => {
    checkForUpdate({ object_list, object_on, handleOnChange, currentlySelected });
  }, [currentlySelected, handleOnChange, object_list, object_on, checkForUpdate]);

  const pager = (
    <Pager>
      <Pager.Item onClick={() => handleBackward({ currentlySelected, object_list, handleOnChange })}>
        Previous
      </Pager.Item>{' '}
      <Pager.Item onClick={() => handleForward({ currentlySelected, object_list, handleOnChange })}>Next</Pager.Item>
    </Pager>
  );
  const error_text = 'No ' + slider_name + ' available';
  var meat_of_div;
  if (object_list === undefined || object_list.length === 0) {
    meat_of_div = error_text;
  } else {
    meat_of_div = pager;
  }

  return (
    <Well bsSize="small">
      <h3>{slider_name} Selector</h3> {progress_string}
      {meat_of_div}
    </Well>
  );
});

function mapStateToProps(state) {
  return {
    object_list: state.apiReducers.present.pandda_event_list,
    object_on: state.apiReducers.present.pandda_event_on
  };
}
const mapDispatchToProps = {
  setObjectOn: apiActions.setPanddaEventOn,
  deleteObject: nglLoadActions.deleteObject,
  loadObject: nglLoadActions.loadObject
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EventSlider);
