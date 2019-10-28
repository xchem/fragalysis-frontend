/**
 * Created by abradley on 18/04/2018.
 */
import React, { memo, useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../actions/apiActions';
import * as nglObjectTypes from './nglObjectTypes';
import * as nglActions from '../actions/nglLoadActions';
import { PREFIX, VIEWS } from '../constants/constants';
import { handleBackward, handleChange, handleForward } from '../utils/genericSlider';
import { Pager, Well } from 'react-bootstrap';

const PanddaSlider = memo(({ event_on, event_list, object_list, object_on, deleteObject, setObjectOn, setEventOn }) => {
  const slider_name = 'Pandda Site';
  const [currentlySelected, setCurrentlySelected] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [progress_string, setProgress_string] = useState('');

  const newOption = useCallback(
    new_value => {
      if (event_on !== undefined) {
        deleteObject(
          Object.assign(
            { display_div: VIEWS.PANDDA_MAJOR },
            {
              name: PREFIX.EVENT_LOAD + event_on.toString(),
              OBJECT_TYPE: nglObjectTypes.EVENTMAP
            }
          )
        );
        setEventOn(undefined);
      }
    },
    [deleteObject, event_on, setEventOn]
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
    event_on: state.apiReducers.present.pandda_event_on,
    event_list: state.apiReducers.present.pandda_event_list,
    object_list: state.apiReducers.present.pandda_site_list,
    object_on: state.apiReducers.present.pandda_site_on
  };
}
const mapDispatchToProps = {
  deleteObject: nglActions.deleteObject,
  setObjectOn: apiActions.setPanddaSiteOn,
  setEventOn: apiActions.setPanddaEventOn
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PanddaSlider);
