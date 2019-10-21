/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { memo, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ReactModal from 'react-modal';
import { Button } from 'react-bootstrap';
import * as apiActions from '../actions/apiActions';

const customStyles = {
  overlay: {
    zIndex: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.85)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-20%',
    transform: 'translate(-50%, -50%)',
    border: '10px solid #7a7a7a'
  }
};

export const ModalErrorMessage = memo(({ errorMessage, savingState, setErrorMessage, setSavingState }) => {
  const closeModal = () => {
    setErrorMessage(undefined);
    setSavingState(false);
  };

  useEffect(() => {
    ReactModal.setAppElement('body');
  }, []);

  if (errorMessage !== undefined) {
    return (
      <ReactModal isOpen={savingState} style={customStyles}>
        <div>
          <h3>Error occurred during state saving. Please contact Fragalysis support!</h3>
          <Button bsSize="sm" bsStyle="success" onClick={closeModal}>
            Close
          </Button>
        </div>
      </ReactModal>
    );
  } else {
    return null;
  }
});

function mapStateToProps(state) {
  return {
    errorMessage: state.apiReducers.present.errorMessage,
    savingState: state.apiReducers.present.savingState
  };
}

const mapDispatchToProps = {
  setErrorMessage: apiActions.setErrorMessage,
  setSavingState: apiActions.setSavingState
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalErrorMessage);
