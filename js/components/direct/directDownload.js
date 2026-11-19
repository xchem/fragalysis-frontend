import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { URL_TOKENS } from './constants';
import { getTagByName } from '../preview/tags/api/tagsApi';
import { getDownloadStructuresTaskOrUrl, downloadStructuresZip, getDownloadTaskStatusObject } from '../snapshot/api/api';
import { DownloadProgress } from './downloadProgress';
import { ToastContext } from '../toast';
import { setDirectDownloadInProgress, setSnapshotDownloadUrl } from '../../reducers/api/actions';

const POLL_INTERVAL = 2000;
const RETRY_INTERVAL = 5000;
const MAX_RETRIES = 3;
const backendMessage = message =>
  `Download failed, with backend error '${message}'. Please contact administrator.`;

export const DirectDownload = memo(() => {
  const match = useRouteMatch();
  const param = match?.params?.[0];
  const dispatch = useDispatch();
  const { toastError } = useContext(ToastContext);
  const reportToast = useRef(toastError);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => { reportToast.current = toastError; }, [toastError]);

  useEffect(() => {
    let active = true;
    let timer;
    let retries = 0;
    const fail = message => {
      if (!active) return;
      dispatch(setDirectDownloadInProgress(false));
      setErrorMessage(message);
      reportToast.current(message);
    };
    const download = url => {
      if (!active) return;
      downloadStructuresZip(url);
      dispatch(setDirectDownloadInProgress(false));
    };
    const poll = async taskUrl => {
      try {
        const response = await getDownloadTaskStatusObject(taskUrl);
        if (!active) return;
        if (!response?.data) throw new Error('Empty download task status response');
        const task = response.data;
        if (!task.finished) {
          timer = setTimeout(() => poll(taskUrl), POLL_INTERVAL);
        } else if (task.status === 'SUCCESS' && task.messages) {
          download(task.messages);
        } else {
          fail(backendMessage(task.messages || 'Archive preparation failed'));
        }
      } catch (error) {
        if (!active) return;
        if (retries < MAX_RETRIES) {
          retries += 1;
          timer = setTimeout(() => poll(taskUrl), RETRY_INTERVAL);
        } else {
          fail(`Download failed, with backend error. Please contact administrator. Error details: ${error.message}`);
        }
      }
    };
    const start = async () => {
      try {
        const parts = param?.split('/');
        if (parts?.length !== 2 || parts[0] !== URL_TOKENS.tag || !parts[1]) {
          throw new Error('Invalid download link');
        }
        const tag = await getTagByName(parts[1]);
        if (!active) return;
        if (!tag?.additional_info?.requestObject) throw new Error('Download tag has no request');
        const snapshotUrl = tag.additional_info.snapshot?.relativeUrl;
        if (snapshotUrl) dispatch(setSnapshotDownloadUrl(snapshotUrl));
        const response = await getDownloadStructuresTaskOrUrl(tag.additional_info.requestObject);
        if (!active) return;
        if (response?.data?.file_url) download(response.data.file_url);
        else if (response?.data?.task_status_url) await poll(response.data.task_status_url);
        else throw new Error('Invalid download response');
      } catch (error) {
        fail(error?.response?.data?.message ? backendMessage(error.response.data.message)
          : 'Download failed, please try again later. If error persists, contact administrator');
      }
    };
    setErrorMessage('');
    dispatch(setSnapshotDownloadUrl(null));
    dispatch(setDirectDownloadInProgress(true));
    start();
    return () => {
      active = false;
      clearTimeout(timer);
      dispatch(setDirectDownloadInProgress(false));
    };
  }, [dispatch, param]);

  return <DownloadProgress errorMessage={errorMessage} />;
});
