/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { Fragment, memo } from 'react';
import { connect } from 'react-redux';
import { Button } from '../common';
import * as apiActions from '../../reducers/api/actions';
import { TargetList } from './targetList';
import { ErrorReport } from '../header/errorReport';
import { Modal } from '../common/Modal';
import { URLS } from '../routes/constants';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { useHistory } from 'react-router-dom';

const HandleUnrecognisedTarget = memo(({ targetUnrecognised, setTargetUnrecognised, target_id_list }) => {
  let history = useHistory();
  const closeModal = () => {
    setTargetUnrecognised(undefined);
  };

  let modalBody = null;

  let request = null;

  if (DJANGO_CONTEXT['username'] === 'NOT_LOGGED_IN') {
    request = (
      <h3>
        Please
        <a className="inline" href={URLS.login}>
          sign in
        </a>
        , or select a target:
      </h3>
    );
  } else {
    request = <h3>Please select a target:</h3>;
  }

  if (targetUnrecognised === true) {
    if (target_id_list && target_id_list.length === 0) {
      modalBody = <h3>The target was not recognised and there are no other available targets.</h3>;
    } else {
      modalBody = (
        <Modal open={targetUnrecognised}>
          <h3>
            Target was not recognised or you do not have authentication to access target. <br />
          </h3>
          {request}
          <TargetList key="TARGLIST" />
          <Button
          color="primary"
          onClick={() => {
            closeModal(), history.push(URLS.landing);
          }}
          style={{position: 'fixed', right: '25px'}}
        >
          Close
          </Button>
        </Modal>
      );
    }
  }

  return (
    <Fragment>
      <Modal open={targetUnrecognised !== undefined ? targetUnrecognised : false}>
        {modalBody}
        <Button color="primary" onClick={closeModal}>
          Close
        </Button>
        <ErrorReport />
      </Modal>
    </Fragment>
  );
});

function mapStateToProps(state) {
  return {
    targetUnrecognised: state.apiReducers.targetUnrecognised,
    target_id_list: state.apiReducers.target_id_list
  };
}

const mapDispatchToProps = {
  setTargetUnrecognised: apiActions.setTargetUnrecognised
};

export default connect(mapStateToProps, mapDispatchToProps)(HandleUnrecognisedTarget);
