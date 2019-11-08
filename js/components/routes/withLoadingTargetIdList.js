import React, { memo, useEffect, useRef } from 'react';
import * as listType from '../listTypes';
import { getUrl, loadFromServer } from '../../utils/genericList';
import * as apiActions from '../../reducers/api/apiActions';
import { connect } from 'react-redux';

export const withLoadingTargetList = WrappedComponent => {
  const LoadTargetList = memo(({ setTargetIdList, setErrorMessage }) => {
    const oldUrl = useRef('');
    const setOldUrl = url => {
      oldUrl.current = url;
    };

    useEffect(() => {
      const list_type = listType.TARGET;

      loadFromServer({
        url: getUrl({ list_type }),
        setOldUrl: url => setOldUrl(url),
        old_url: oldUrl.current,
        setObjectList: setTargetIdList,
        list_type
      }).catch(error => {
        setErrorMessage(error);
      });
    }, [setTargetIdList, setErrorMessage]);

    return <WrappedComponent />;
  });

  function mapStateToProps(state) {
    return {};
  }
  const mapDispatchToProps = {
    setTargetIdList: apiActions.setTargetIdList,
    setErrorMessage: apiActions.setErrorMessage
  };
  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(LoadTargetList);
};
