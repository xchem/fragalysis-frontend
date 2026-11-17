import React from 'react';
import { render } from '@testing-library/react';
import { TASPreview } from './TASPreview';
import { ToastContext } from '../toast';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';

jest.mock('../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));
jest.mock('../toast', () => ({ ToastContext: require('react').createContext() }));
jest.mock('./Preview', () => () => null);
jest.mock('./redux/dispatchActions', () => ({}));
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('react-router-dom', () => ({ useHistory: jest.fn(), useRouteMatch: jest.fn() }));

const renderWarning = message => {
  DJANGO_CONTEXT.target_warning_message = message;
  const toastWarning = jest.fn();
  render(
    <ToastContext.Provider value={{ toastWarning }}>
      <TASPreview />
    </ToastContext.Provider>
  );
  const content = toastWarning.mock.calls[0]?.[0];
  return { toastWarning, ...(content ? render(content) : {}) };
};

const encodeHtml = message =>
  message
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

describe('target warning HTML', () => {
  it.each([
    ['raw', value => value],
    ['entity-encoded', encodeHtml]
  ])('retains formatting and links in %s backend warnings', (_name, encode) => {
    expect.hasAssertions();
    const { getByRole, container } = renderWarning(
      encode(
        'This is <strong>staging</strong>, please use <a href="https://fragalysis.diamond.ac.uk" target="_blank">production</a>.'
      )
    );
    expect(container.querySelector('strong')).toHaveTextContent('staging');
    expect(getByRole('link', { name: 'production' })).toHaveAttribute('href', 'https://fragalysis.diamond.ac.uk');
    expect(getByRole('link')).toHaveAttribute('target', '_blank');
  });

  it.each([
    ['raw', value => value],
    ['entity-encoded', encodeHtml]
  ])('removes executable markup from %s backend warnings after decoding', (_name, encode) => {
    expect.hasAssertions();
    const { container, getByText } = renderWarning(
      encode(
        '<script>alert(1)</script><img src=x onerror="alert(1)"><svg onload="alert(1)"></svg>' +
          '<a href="javascript:alert(1)" onclick="alert(1)">unsafe link</a>' +
          '<a href="java&#x0a;script:alert(1)">encoded scheme</a><p>Warning</p>'
      )
    );
    expect(container.querySelector('script, [onerror], [onload], [onclick]')).toBeNull();
    expect(getByText('unsafe link')).not.toHaveAttribute('href');
    expect(getByText('encoded scheme')).not.toHaveAttribute('href');
    expect(getByText('Warning')).toBeVisible();
  });

  it.each(['', null, undefined])('does not show an absent warning: %s', value => {
    expect.hasAssertions();
    expect(renderWarning(value).toastWarning).not.toHaveBeenCalled();
  });
});
