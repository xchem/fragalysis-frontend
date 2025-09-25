/**
 * Created by ricgillams on 14/06/2018.
 */

import React, { Fragment, memo } from 'react';
import { connect, useSelector } from 'react-redux';
import { Button } from '../common';
import * as apiActions from '../../reducers/api/actions';
import { TargetList } from './targetList';
import { ErrorReport } from '../header/errorReport';
import { Modal } from '../common/Modal';
import { URLS } from '../routes/constants';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { useHistory } from 'react-router-dom';

export const HandleUnrecognisedTarget = memo(() => {
  const targetUnrecognised = useSelector(state => state.apiReducers.targetUnrecognised);
  const target_id_list = useSelector(state => state.apiReducers.target_id_list);
  const targetDataLoaded = useSelector(state => state.apiReducers.targetDataLoaded);
  const target_data_loading_in_progress = useSelector(state => state.apiReducers.target_data_loading_in_progress);

  let history = useHistory();
  // const closeModal = () => {
  //   dispatchEvent(apiActions.setTargetUnrecognised(false));
  // };

  let modalBody = null;

  let request = null;

  if (!DJANGO_CONTEXT['authenticated']) {
    request = (
      <h3>
        Target could not be loaded, please try{' '}
        <a className="inline" href={URLS.login}>
          logging in
        </a>
      </h3>
    );
  } else {
    // request = <h3>Please select a target:</h3>;
    request = <h3>{''}</h3>;
  }

  if (target_data_loading_in_progress && target_id_list && target_id_list.length === 0) {
    modalBody = <h3>Targets are loading. Please wait.</h3>;
  } else if (targetUnrecognised) {
    modalBody = request;
  }

  return (
    <Fragment>
      <Modal open={target_data_loading_in_progress || targetUnrecognised}>
        {modalBody}
        {/* <Button color="primary" onClick={closeModal}>
          Close
        </Button>
        <ErrorReport /> */}
      </Modal>
    </Fragment>
  );
});

// function mapStateToProps(state) {
//   return {
//     targetUnrecognised: state.apiReducers.targetUnrecognised,
//     target_id_list: state.apiReducers.target_id_list
//   };
// }

// const mapDispatchToProps = {
//   setTargetUnrecognised: apiActions.setTargetUnrecognised
// };

// export default connect(mapStateToProps, mapDispatchToProps)(HandleUnrecognisedTarget);
