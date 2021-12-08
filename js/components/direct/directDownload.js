import React, { memo, useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { URL_TOKENS } from './constants';
import { getTagByName } from '../preview/tags/api/tagsApi';

export const DirectDownload = memo(url => {
  let match = useRouteMatch();
  const dispatch = useDispatch();
  const [downloadInProgress, setDownloadInProgress] = useState(false);

  useEffect(() => {
    if (!downloadInProgress) {
      setDownloadInProgress(true);
      const param = match.params[0];
      if (param && param.startsWith(URL_TOKENS.tag)) {
        let withoutKeyword = param.split(URL_TOKENS.tag);
        if (withoutKeyword && withoutKeyword.length === 2) {
          const splitParams = withoutKeyword[1].split('/');
          if (splitParams && splitParams.length === 2) {
            const tagName = splitParams[1];
            getTagByName(tagName).then(tag => {
              console.log(tag);
            });
          }
        }
      }
    }
  }, [downloadInProgress, match.params]);
});
