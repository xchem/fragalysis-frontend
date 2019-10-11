/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { memo } from 'react';
import { connect } from 'react-redux';
import ReactModal from 'react-modal';
import { Button } from 'react-bootstrap';
import * as apiActions from '../actions/apiActions';
import TargetList from './targetList';
import { ErrorReport } from './errorReport';

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

const ModalTargetUnrecognised = memo(({ targetUnrecognised, targetIdList, setTargetUnrecognised }) => {
  const closeModal = () => {
    setTargetUnrecognised(undefined);
  };

  let request = null;
  // eslint-disable-next-line no-undef
  if (DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN') {
    request = (
      <h3>
        Please
        <a className="inline" href="/accounts/login">
          {' '}
          sign in
        </a>
        , or select a target:
      </h3>
    );
  } else {
    request = <h3>Please select a target:</h3>;
  }
  if (targetUnrecognised === true) {
    /*if (targetIdList && targetIdList.length === 0) {
      return (
        <ReactModal isOpen={targetUnrecognised} style={customStyles}>
          <div>
            <h3>The target was not recognised and there are no other available targets.</h3>
            <Button bsSize="sm" bsStyle="success" onClick={closeModal}>
              Close
            </Button>
            <ErrorReport />
          </div>
        </ReactModal>
      );
    } else {
    */
    return (
      <ReactModal isOpen={targetUnrecognised} style={customStyles}>
        <div>
          <h3>
            Target was not recognised or you do not have authentication to access target. <br />
          </h3>
          {request}
          {/*TODO: create new simple component only with list of targets, because now when you load TargetList
              component, objects in reducer will be changed*/}
          <TargetList key="TARGLIST" />
          <Button bsSize="sm" bsStyle="success" onClick={closeModal}>
            Close
          </Button>
          <ErrorReport />
        </div>
      </ReactModal>
    );
    /*  }
    } else {
      return null;
    }*/
  }
});

function mapStateToProps(state) {
  return {
    targetUnrecognised: state.apiReducers.present.targetUnrecognised,
    targetIdList: state.apiReducers.present.target_id_list
  };
}

const mapDispatchToProps = {
  setTargetUnrecognised: apiActions.setTargetUnrecognised
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalTargetUnrecognised);
