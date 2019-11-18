/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { Fragment, memo } from 'react';
import { connect } from 'react-redux';
import { Button } from '@material-ui/core';
import * as apiActions from '../reducers/api/apiActions';
import TargetList from './targetList';
import { ErrorReport } from './header/errorReport';
import { Modal } from './common/Modal';

const HandleUnrecognisedTarget = memo(({ targetUnrecognised, setTargetUnrecognised, target_id_list }) => {
  const closeModal = () => {
    setTargetUnrecognised(undefined);
  };

  let modalBody = null;

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
        </Modal>
      );
    }
  }

  return (
    <Fragment>
      <Modal open={targetUnrecognised !== undefined ? targetUnrecognised : false}>
        {modalBody}
        <Button color="secondary" onClick={closeModal}>
          Close
        </Button>
        <ErrorReport />
      </Modal>
    </Fragment>
  );
});

function mapStateToProps(state) {
  return {
    targetUnrecognised: state.apiReducers.present.targetUnrecognised,
    target_id_list: state.apiReducers.present.target_id_list
  };
}

const mapDispatchToProps = {
  setTargetUnrecognised: apiActions.setTargetUnrecognised
};

export default connect(mapStateToProps, mapDispatchToProps)(HandleUnrecognisedTarget);
