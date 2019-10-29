/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { memo } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, makeStyles } from '@material-ui/core';
import * as apiActions from '../actions/apiActions';
import TargetList from './targetList';
import { ErrorReport } from './errorReport';

const useStyles = makeStyles(theme => ({
  paper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  }
}));

const HandleUnrecognisedTarget = memo(({ targetUnrecognised, setTargetUnrecognised, target_id_list, children }) => {
  const classes = useStyles();
  const closeModal = () => {
    setTargetUnrecognised(undefined);
  };

  let modal = null;

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
      modal = (
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={targetUnrecognised}
        >
          <div className={classes.paper}>
            <h3>The target was not recognised and there are no other available targets.</h3>
            <Button bsSize="sm" bsStyle="success" onClick={closeModal}>
              Close
            </Button>
            <ErrorReport />
          </div>
        </Modal>
      );
    } else {
      modal = (
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={targetUnrecognised}
        >
          <div className={classes.paper}>
            <h3>
              Target was not recognised or you do not have authentication to access target. <br />
            </h3>
            {request}
            <TargetList key="TARGLIST" />
            <Button color="secondary" onClick={closeModal}>
              Close
            </Button>
            <ErrorReport />
          </div>
        </Modal>
      );
    }
  }

  return (
    <div>
      {children}
      {modal}
    </div>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HandleUnrecognisedTarget);
