/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { memo } from 'react';
import { connect } from 'react-redux';
import Modal from '../common/modal';
import { Button } from 'react-bootstrap';
import * as apiActions from '../../reducers/api/apiActions';

const ModalSessionErrorMessage = memo(({ errorMessage, setErrorMessage, setSavingState }) => {
  const closeModal = () => {
    setErrorMessage(undefined);
    setSavingState(false);
  };

  let msg = null;
  if (process.env.NODE_ENV === 'development' && errorMessage !== undefined) {
    msg = errorMessage.toString();
  }
  return (
    <Modal open={errorMessage !== undefined}>
      <div>
        <h3>Error occurred during state saving. Please contact Fragalysis support!</h3>
        <div>{msg}</div>
        <Button bsSize="sm" bsStyle="success" onClick={closeModal}>
          Close
        </Button>
      </div>
    </Modal>
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
)(ModalSessionErrorMessage);
