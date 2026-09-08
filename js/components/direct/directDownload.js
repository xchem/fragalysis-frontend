import React, { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { URL_TOKENS } from './constants';
import { getTagByName } from '../preview/tags/api/tagsApi';
import {
  getDownloadStructuresTaskOrUrl,
  downloadStructuresZip,
  getDownloadTaskStatusObject
} from '../snapshot/api/api';
import { DownloadProgress } from './downloadProgress';
import { setDirectDownloadInProgress, setSnapshotDownloadUrl } from '../../reducers/api/actions';
import { ToastContext } from '../toast';

const TASK_POLL_INTERVAL_MS = 2000;
const TASK_ERROR_RETRY_INTERVAL_MS = 5000;
const MAX_TASK_ERROR_RETRIES = 3;

export const DirectDownload = memo(url => {
  let match = useRouteMatch();
  const dispatch = useDispatch();
  const { toastError } = useContext(ToastContext);
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const taskErrorCounter = useRef(0);

  const reportDownloadError = useCallback(
    message => {
      dispatch(setDirectDownloadInProgress(false));
      setErrorMessage(message);
      toastError(message);
    },
    [dispatch, toastError]
  );

  const reportRequestError = useCallback(
    error => {
      console.error(JSON.stringify(error?.response?.data));

      const message = error?.response?.data?.message
        ? `Download failed, with backend error '${error.response.data.message}'. Please contact administrator.`
        : 'Download failed, please try again later. If error persists, contact administrator';

      reportDownloadError(message);
      console.error(error);
    },
    [reportDownloadError]
  );

  const handleTask = useCallback(
    async taskUrl => {
      try {
        const taskStatusResponse = await getDownloadTaskStatusObject(taskUrl);
        if (!taskStatusResponse?.data) {
          throw new Error('Unexpected empty response from the download task status endpoint');
        }

        const taskStatus = taskStatusResponse.data;
        if (taskStatus?.finished) {
          if (taskStatus?.status === 'SUCCESS') {
            const fileUrl = taskStatus.messages;
            downloadStructuresZip(fileUrl);
            dispatch(setDirectDownloadInProgress(false));
          } else {
            reportDownloadError(
              `Download failed, with backend error '${taskStatus?.messages}'. Please contact administrator.`
            );
          }
        } else {
          setTimeout(() => handleTask(taskUrl), TASK_POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (taskErrorCounter.current < MAX_TASK_ERROR_RETRIES) {
          taskErrorCounter.current += 1;
          setTimeout(() => handleTask(taskUrl), TASK_ERROR_RETRY_INTERVAL_MS);
        } else {
          const message = `Download failed, with backend error. Please contact administrator. Error details: ${error?.message}`;
          reportDownloadError(message);
          console.error(error);
        }
      }
    },
    [dispatch, reportDownloadError]
  );

  useEffect(() => {
    if (!downloadInProgress) {
      setDownloadInProgress(true);
      setErrorMessage('');
      taskErrorCounter.current = 0;
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
                if (tag?.additional_info?.requestObject) {
                  const requestObject = tag.additional_info.requestObject;
                  const snapshotUrl = tag.additional_info.snapshot?.relativeUrl;
                  if (snapshotUrl) {
                    dispatch(setSnapshotDownloadUrl(snapshotUrl));
                  }
                  return getDownloadStructuresTaskOrUrl(requestObject);
                }

                throw new Error('Download tag does not contain a download request');
              })
              .then(resp => {
                if (resp?.data?.file_url) {
                  const url = resp.data.file_url;
                  downloadStructuresZip(url);
                  dispatch(setDirectDownloadInProgress(false));
                } else if (resp?.data?.task_status_url) {
                  /*await */ handleTask(resp.data.task_status_url);
                } else {
                  throw new Error('Unexpected response from the server: ' + JSON.stringify(resp?.data));
                }
              })
              .catch(reportRequestError);
          }
        }
      }
    }
  }, [dispatch, downloadInProgress, handleTask, match.params, reportRequestError]);

  return <DownloadProgress errorMessage={errorMessage} />;
});
