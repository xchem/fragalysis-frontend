import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { combineReducers, legacy_createStore } from 'redux';
import { useRouteMatch } from 'react-router-dom';
import { DirectDownload } from './directDownload';
import { ToastContext } from '../toast';
import apiReducers from '../../reducers/api/apiReducers';
import { getTagByName } from '../preview/tags/api/tagsApi';
import {
  downloadStructuresZip,
  getDownloadStructuresTaskOrUrl,
  getDownloadTaskStatusObject
} from '../snapshot/api/api';

jest.mock('react-router-dom', () => ({
  useRouteMatch: jest.fn()
}));

jest.mock('../preview/tags/api/tagsApi', () => ({
  getTagByName: jest.fn()
}));

jest.mock('../snapshot/api/api', () => ({
  downloadStructuresZip: jest.fn(),
  getDownloadStructuresTaskOrUrl: jest.fn(),
  getDownloadTaskStatusObject: jest.fn()
}));

const tag = {
  additional_info: {
    requestObject: { target_name: 'test-target' },
    snapshot: { relativeUrl: '/viewer/react/projects/1/2' }
  }
};

const renderDirectDownload = toastError => {
  const store = legacy_createStore(combineReducers({ apiReducers }));

  render(
    <Provider store={store}>
      <ToastContext.Provider value={{ toastError }}>
        <DirectDownload />
      </ToastContext.Provider>
    </Provider>
  );

  return store;
};

describe('DirectDownload', () => {
  let consoleError;

  beforeEach(() => {
    useRouteMatch.mockReturnValue({ params: { 0: 'tag/0b11ba12-4d8c-4704-b170-111bddd3ab02' } });
    getTagByName.mockResolvedValue(tag);
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('reports a backend message from an unsuccessful download request', async () => {
    expect.hasAssertions();
    const toastError = jest.fn();
    const error = { response: { data: { message: 'The prepared archive is no longer available' } } };
    getDownloadStructuresTaskOrUrl.mockRejectedValue(error);

    const store = renderDirectDownload(toastError);

    const expectedMessage =
      "Download failed, with backend error 'The prepared archive is no longer available'. Please contact administrator.";
    expect(await screen.findByRole('alert')).toHaveTextContent(expectedMessage);
    expect(toastError).toHaveBeenCalledWith(expectedMessage);
    expect(store.getState().apiReducers.directDownloadInProgress).toBe(false);
    expect(downloadStructuresZip).not.toHaveBeenCalled();
  });

  it('reports the general error when the unsuccessful request has no backend message', async () => {
    expect.hasAssertions();
    const toastError = jest.fn();
    getDownloadStructuresTaskOrUrl.mockRejectedValue(new Error('Network unavailable'));

    const store = renderDirectDownload(toastError);

    const expectedMessage = 'Download failed, please try again later. If error persists, contact administrator';
    expect(await screen.findByRole('alert')).toHaveTextContent(expectedMessage);
    expect(toastError).toHaveBeenCalledWith(expectedMessage);
    expect(store.getState().apiReducers.directDownloadInProgress).toBe(false);
  });

  it('reports the backend message from a finished unsuccessful task', async () => {
    expect.hasAssertions();
    const toastError = jest.fn();
    getDownloadStructuresTaskOrUrl.mockResolvedValue({ data: { task_status_url: '/api/task/status/1/' } });
    getDownloadTaskStatusObject.mockResolvedValue({
      data: { finished: true, status: 'FAILURE', messages: 'Archive preparation failed' }
    });

    const store = renderDirectDownload(toastError);

    const expectedMessage =
      "Download failed, with backend error 'Archive preparation failed'. Please contact administrator.";
    expect(await screen.findByRole('alert')).toHaveTextContent(expectedMessage);
    expect(toastError).toHaveBeenCalledWith(expectedMessage);
    expect(store.getState().apiReducers.directDownloadInProgress).toBe(false);
    expect(downloadStructuresZip).not.toHaveBeenCalled();
  });

  it('reports a polling error after three retries', async () => {
    expect.hasAssertions();
    jest.useFakeTimers();
    const toastError = jest.fn();
    getDownloadStructuresTaskOrUrl.mockResolvedValue({ data: { task_status_url: '/api/task/status/1/' } });
    getDownloadTaskStatusObject.mockRejectedValue(new Error('Polling unavailable'));

    const store = renderDirectDownload(toastError);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(getDownloadTaskStatusObject).toHaveBeenCalledTimes(1);

    for (let retry = 0; retry < 3; retry += 1) {
      await act(async () => {
        jest.advanceTimersByTime(5000);
        await Promise.resolve();
        await Promise.resolve();
      });
    }

    const expectedMessage =
      'Download failed, with backend error. Please contact administrator. Error details: Polling unavailable';
    expect(getDownloadTaskStatusObject).toHaveBeenCalledTimes(4);
    expect(screen.getByRole('alert')).toHaveTextContent(expectedMessage);
    expect(toastError).toHaveBeenCalledWith(expectedMessage);
    expect(store.getState().apiReducers.directDownloadInProgress).toBe(false);
  });

  it('downloads an immediately available file and stops progress', async () => {
    expect.hasAssertions();
    const toastError = jest.fn();
    getDownloadStructuresTaskOrUrl.mockResolvedValue({ data: { file_url: '/media/downloads/file.zip' } });

    const store = renderDirectDownload(toastError);

    await waitFor(() => expect(downloadStructuresZip).toHaveBeenCalledWith('/media/downloads/file.zip'));
    expect(store.getState().apiReducers.directDownloadInProgress).toBe(false);
    expect(toastError).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('downloads a file from a successful finished task and stops progress', async () => {
    expect.hasAssertions();
    const toastError = jest.fn();
    getDownloadStructuresTaskOrUrl.mockResolvedValue({ data: { task_status_url: '/api/task/status/1/' } });
    getDownloadTaskStatusObject.mockResolvedValue({
      data: { finished: true, status: 'SUCCESS', messages: '/media/downloads/file.zip' }
    });

    const store = renderDirectDownload(toastError);

    await waitFor(() => expect(downloadStructuresZip).toHaveBeenCalledWith('/media/downloads/file.zip'));
    expect(store.getState().apiReducers.directDownloadInProgress).toBe(false);
    expect(toastError).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
