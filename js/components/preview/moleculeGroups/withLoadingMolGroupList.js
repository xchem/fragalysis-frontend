/**
 * Created by abradley on 13/03/2018.
 */
import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { VIEWS } from '../../../constants/constants';
import { NglContext } from '../../nglView/nglProvider';
import { loadMoleculeGroups } from './redux/dispatchActions';
import { useRouteMatch } from 'react-router-dom';

// is responsible for loading molecules list
export const withLoadingMolGroupList = WrappedComponent => {
  return memo(({ isStateLoaded, hideProjects, ...rest }) => {
    const [state, setState] = useState();
    const [wasLoaded, setWasLoaded] = useState(false);
    const { getNglView } = useContext(NglContext);

    const [oldUrl, setOldUrl] = useState('');
    const onCancel = useCallback(() => {}, []);
    let match = useRouteMatch();
    const projectId = match && match.params && match.params.projectId;

    const dispatch = useDispatch();

    useEffect(() => {
      const summaryView = getNglView(VIEWS.SUMMARY_VIEW);

      if (summaryView && wasLoaded === false) {
        dispatch(
          loadMoleculeGroups({
            summaryView: summaryView.stage,
            setOldUrl,
            oldUrl: oldUrl.current,
            onCancel,
            isStateLoaded,
            projectId,
            hideProjects
          })
        ).catch(error => {
          setState(() => {
            throw error;
          });
        });
        setWasLoaded(true);
      }

      return () => {
        onCancel();
      };
    }, [isStateLoaded, hideProjects, onCancel, dispatch, oldUrl, getNglView, projectId, wasLoaded]);

    return <WrappedComponent {...rest} />;
  });
};
