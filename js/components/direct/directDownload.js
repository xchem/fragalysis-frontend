import React, { memo, useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { URL_TOKENS } from './constants';
import { getTagByName } from '../preview/tags/api/tagsApi';
import { getDownloadStructuresUrl, downloadStructuresZip } from '../snapshot/api/api';
import { DownloadProgress } from './downloadProgress';
import { setDirectDownloadInProgress, setSnapshotDownloadUrl } from '../../reducers/api/actions';

export const DirectDownload = memo(url => {
  let match = useRouteMatch();
  const dispatch = useDispatch();
  const [downloadInProgress, setDownloadInProgress] = useState(false);

  useEffect(() => {
    if (!downloadInProgress) {
      setDownloadInProgress(true);
      dispatch(setDirectDownloadInProgress(true));
      const param = match.params[0];
      if (param && param.startsWith(URL_TOKENS.tag)) {
        let withoutKeyword = param.split(URL_TOKENS.tag);
        if (withoutKeyword && withoutKeyword.length === 2) {
          const splitParams = withoutKeyword[1].split('/');
          if (splitParams && splitParams.length === 2) {
            const tagName = splitParams[1];
            getTagByName(tagName)
              .then(tag => {
                if (tag.additional_info && tag.additional_info.requestObject) {
                  const requestObject = tag.additional_info.requestObject;
                  const snapshotUrl = tag.additional_info.snapshot.url;
                  dispatch(setSnapshotDownloadUrl(snapshotUrl));
                  return getDownloadStructuresUrl(requestObject);
                }
              })
              .then(resp => {
                const url = resp.data.file_url;
                downloadStructuresZip(url);
                dispatch(setDirectDownloadInProgress(false));
              });
          }
        }
      }
    }
  }, [dispatch, downloadInProgress, match.params]);

  return <DownloadProgress />;
});
