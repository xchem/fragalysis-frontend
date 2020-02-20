/**
 * Created by abradley on 13/03/2018.
 */
import React, { memo, useCallback, useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { VIEWS } from '../../../constants/constants';
import { NglContext } from '../../nglView/nglProvider';
import { loadMoleculeGroups } from './redux/dispatchActions';

// is responsible for loading molecules list
export const withLoadingMolGroupList = WrappedComponent => {
  return memo(({ isStateLoaded, match, ...rest }) => {
    const [state, setState] = useState();
    const [wasLoaded, setWasLoaded] = useState(false);
    const { getNglView } = useContext(NglContext);

    const [oldUrl, setOldUrl] = useState('');
    const onCancel = useCallback(() => {}, []);

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
            isStateLoaded
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
    }, [isStateLoaded, onCancel, dispatch, oldUrl, getNglView, projectId, wasLoaded]);

    return <WrappedComponent {...rest} />;
  });
};
