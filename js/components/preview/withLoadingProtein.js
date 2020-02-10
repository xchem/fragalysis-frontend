/**
 * Created by abradley on 13/03/2018.
 */
import React, { memo, useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { NglContext } from '../nglView/nglProvider';
import { shouldLoadProtein } from './redux/dispatchActions';

// is responsible for loading molecules list
export const withLoadingProtein = WrappedComponent => {
  const ProteinLoader = memo(({ isStateLoaded, shouldLoadProtein, match, ...rest }) => {
    const { nglViewList } = useContext(NglContext);
    const projectId = match && match.params && match.params.projectId;

    useEffect(() => {
      shouldLoadProtein(nglViewList, isStateLoaded, projectId);
    }, [isStateLoaded, nglViewList, projectId, shouldLoadProtein]);

    return <WrappedComponent isStateLoaded={isStateLoaded} {...rest} />;
  });

  function mapStateToProps(state) {
    return {};
  }
  const mapDispatchToProps = {
    shouldLoadProtein
  };
  return connect(mapStateToProps, mapDispatchToProps)(ProteinLoader);
};
