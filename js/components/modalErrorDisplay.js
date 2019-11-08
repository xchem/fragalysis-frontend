/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { memo, useEffect } from 'react';
import { connect } from 'react-redux';
import ReactModal from 'react-modal';
import { Button } from 'react-bootstrap';
import * as apiActions from '../reducers/api/apiActions';

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

export const ModalErrorMessage = memo(({ errorMessage, setErrorMessage, setSavingState }) => {
  const closeModal = () => {
    setErrorMessage(undefined);
    setSavingState(false);
  };

  useEffect(() => {
    ReactModal.setAppElement('body');
  }, []);

  return (
    <ReactModal isOpen={errorMessage !== undefined} style={customStyles}>
      <div>
        <h3>Error occurred during state saving. Please contact Fragalysis support!</h3>
        <div>{process.env.NODE_ENV === 'development' && errorMessage}</div>
        <Button bsSize="sm" bsStyle="success" onClick={closeModal}>
          Close
        </Button>
      </div>
    </ReactModal>
  );
});

function mapStateToProps(state) {
  return {
    errorMessage: state.apiReducers.present.errorMessage
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
