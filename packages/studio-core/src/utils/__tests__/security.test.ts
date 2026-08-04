import { describe, it, expect } from 'vitest';
import { esc, safeUrl, sanitizeHtml, sanitizeText, isEmail, isValidUrl } from '../security';

describe('esc', () => {
  it('escapes HTML-sensitive characters', () => {
    expect(esc('<script>"a" & \'b\'</script>')).toBe(
      '&lt;script&gt;&quot;a&quot; &amp; &#39;b&#39;&lt;/script&gt;',
    );
  });
  it('handles null/undefined safely', () => {
    expect(esc(null)).toBe('');
    expect(esc(undefined)).toBe('');
  });
});

describe('safeUrl', () => {
  it('allows http/https urls', () => {
    expect(safeUrl('https://example.com')).toBe('https://example.com');
    expect(safeUrl('http://example.com')).toBe('http://example.com');
  });
  it('rejects javascript: and other schemes', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('');
    expect(safeUrl('data:text/html,x')).toBe('');
  });
  it('rejects non-string input', () => {
    expect(safeUrl(null)).toBe('');
    expect(safeUrl(42)).toBe('');
  });
});

describe('sanitizeHtml', () => {
  it('removes script and iframe tags', () => {
    expect(sanitizeHtml('<p>hi</p><script>alert(1)</script>')).toBe('<p>hi</p>');
    expect(sanitizeHtml('<iframe src="x"></iframe>')).toBe('');
  });
  it('strips inline event handlers', () => {
    expect(sanitizeHtml('<a href="x" onclick="evil()">link</a>')).toBe('<a href="x">link</a>');
  });
});

describe('sanitizeText', () => {
  it('escapes and truncates to maxLength', () => {
    expect(sanitizeText('<b>x</b>', 100)).toBe('&lt;b&gt;x&lt;/b&gt;');
    expect(sanitizeText('a'.repeat(50), 10)).toBe('a'.repeat(10));
  });
});

describe('isEmail', () => {
  it('validates email format', () => {
    expect(isEmail('jack@example.com')).toBe(true);
    expect(isEmail('not-an-email')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('accepts http(s) urls only', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('ftp://example.com')).toBe(false);
  });
});
