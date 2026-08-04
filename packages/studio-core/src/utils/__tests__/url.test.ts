import { describe, it, expect } from 'vitest';
import {
  fixAppleMusicUrl,
  parseQueryParams,
  buildQuery,
  joinUrl,
  isExternal,
  isSameOrigin,
  ensureProtocol,
} from '../url';

describe('fixAppleMusicUrl', () => {
  it('strips the /us/ region segment', () => {
    expect(fixAppleMusicUrl('https://music.apple.com/us/album/xxx/123')).toBe(
      'https://music.apple.com/album/xxx/123',
    );
  });
  it('returns empty for empty input', () => {
    expect(fixAppleMusicUrl('')).toBe('');
  });
  it('leaves non-US links untouched', () => {
    expect(fixAppleMusicUrl('https://music.apple.com/jp/album/x/1')).toBe(
      'https://music.apple.com/jp/album/x/1',
    );
  });
});

describe('buildQuery', () => {
  it('serializes params with a leading ?', () => {
    expect(buildQuery({ a: 1, b: 'x', c: true })).toBe('?a=1&b=x&c=true');
  });
  it('returns empty string when no params', () => {
    expect(buildQuery({})).toBe('');
  });
});

describe('parseQueryParams', () => {
  it('parses query string from a full url', () => {
    expect(parseQueryParams('https://x.com/?foo=bar&n=1')).toEqual({ foo: 'bar', n: '1' });
  });
});

describe('joinUrl', () => {
  it('normalizes slashes between parts', () => {
    expect(joinUrl('https://x.com/', '/a/', '/b')).toBe('https://x.com/a/b');
    expect(joinUrl('https://x.com', 'a', 'b')).toBe('https://x.com/a/b');
  });
});

describe('isExternal', () => {
  it('detects cross-host urls', () => {
    expect(isExternal('https://example.com/x')).toBe(true);
  });
  it('rejects relative urls', () => {
    expect(isExternal('/foo/bar')).toBe(false);
  });
});

describe('isSameOrigin', () => {
  it('treats same-origin urls as same', () => {
    expect(isSameOrigin(`${window.location.origin}/somepath`)).toBe(true);
  });
  it('treats cross-origin urls as different', () => {
    expect(isSameOrigin('https://example.com/x')).toBe(false);
  });
});

describe('ensureProtocol', () => {
  it('prefixes protocol-less urls', () => {
    expect(ensureProtocol('example.com')).toBe('https://example.com');
    expect(ensureProtocol('//example.com')).toBe('https://example.com');
  });
  it('keeps already-absolute urls', () => {
    expect(ensureProtocol('http://example.com')).toBe('http://example.com');
  });
  it('returns empty for empty input', () => {
    expect(ensureProtocol('')).toBe('');
  });
});
