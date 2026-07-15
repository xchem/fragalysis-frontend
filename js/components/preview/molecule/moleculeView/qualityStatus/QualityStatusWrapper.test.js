import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { legacy_createStore } from 'redux';
import { QualityStatusModal } from './QualityStatusModal';
import { QualityStatusWrapper } from './QualityStatusWrapper';

jest.mock('./QualityStatusModal', () => ({
  QualityStatusModal: jest.fn(() => null)
}));

describe('QualityStatusWrapper', () => {
  let consoleWarnSpy;

  beforeEach(() => {
    QualityStatusModal.mockClear();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('preserves derived status references when only the data object identity changes', () => {
    const qualityStatuses = [
      { id: 1, site_observation: 10, user: 1, main_status: true, status: 'GOOD', comment: '' },
      { id: 2, site_observation: 10, user: 2, main_status: false, status: 'MEDIOCRE', comment: '' },
      { id: 3, site_observation: 20, user: 3, main_status: false, status: 'BAD', comment: '' }
    ];
    const store = legacy_createStore(() => ({ apiReducers: { quality_statuses: qualityStatuses } }));
    const { rerender } = render(
      <Provider store={store}>
        <QualityStatusWrapper data={{ id: 100, main_site_observation: 10 }} />
      </Provider>
    );
    const initialModalProps = QualityStatusModal.mock.calls.at(-1)[0];

    rerender(
      <Provider store={store}>
        <QualityStatusWrapper data={{ id: 100, main_site_observation: 10 }} />
      </Provider>
    );
    const rerenderedModalProps = QualityStatusModal.mock.calls.at(-1)[0];

    expect(rerenderedModalProps.statuses).toBe(initialModalProps.statuses);
    expect(rerenderedModalProps.latestPeerReviews).toBe(initialModalProps.latestPeerReviews);
    expect(rerenderedModalProps.statuses).toHaveLength(2);
    expect(rerenderedModalProps.latestPeerReviews).toHaveLength(1);
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('GridLegacy component is deprecated'));
  });
});
