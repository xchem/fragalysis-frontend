/** @jest-environment node */
import { runInNewContext } from 'vm';
import { isURL } from './common';

describe('url validation', () => {
  it.each([
    'example.org',
    'a.example.org',
    'ab.example.org',
    'a-b.example.org',
    'HTTPS://Example.ORG:8080/path/to/file.sdf?name=a+b&value=1#fragment',
    'http://127.0.0.1:8080/',
    '999.999.999.999',
    'example.org//path/'
  ])('preserves accepted URL syntax: %s', value => {
    expect.hasAssertions();
    expect(isURL(value)).toBe(true);
  });

  it.each([
    '',
    'localhost',
    // eslint-disable-next-line no-script-url
    'javascript:alert(1)',
    'ftp://example.org',
    'https://user@example.org',
    '-a.example.org',
    'a-.example.org',
    'a_b.example.org',
    'example..org',
    'example.org/path with spaces',
    null,
    undefined
  ])('preserves rejected URL syntax: %s', value => {
    expect.hasAssertions();
    expect(isURL(value)).toBe(false);
  });

  it('handles long domain labels without ambiguous nested repetition', () => {
    expect.hasAssertions();
    const label = '0'.repeat(100000);
    // Bound execution even if a future regression brings back exponential backtracking.
    const validate = value => runInNewContext('isURL(value)', { isURL, value }, { timeout: 1000 });
    expect(validate(`${label}!`)).toBe(false);
    expect(validate(`${label}.example`)).toBe(true);
    expect(validate(`${label}-.example`)).toBe(false);
  });
});
