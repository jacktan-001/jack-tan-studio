import { describe, it, expect, vi } from 'vitest';
import {
  fmtTime,
  fmtDateCN,
  fmtDateISO,
  fmtRelative,
  truncate,
  fmtCompact,
  capitalize,
  uid,
  debounce,
  throttle,
} from '../format';

describe('fmtTime', () => {
  it('formats seconds as mm:ss with zero padding', () => {
    expect(fmtTime(0)).toBe('0:00');
    expect(fmtTime(5)).toBe('0:05');
    expect(fmtTime(65)).toBe('1:05');
    expect(fmtTime(600)).toBe('10:00');
  });
});

describe('fmtDateCN / fmtDateISO', () => {
  const d = new Date('2026-03-07T12:00:00Z');
  it('formats Chinese date', () => {
    expect(fmtDateCN(d)).toBe('2026年3月7日');
  });
  it('formats ISO date', () => {
    expect(fmtDateISO(d)).toBe('2026-03-07');
  });
  it('accepts string input', () => {
    expect(fmtDateISO('2026-12-25')).toBe('2026-12-25');
  });
});

describe('fmtRelative', () => {
  it('returns 刚刚 for very recent dates', () => {
    expect(fmtRelative(new Date(Date.now() - 1000))).toBe('刚刚');
  });
  it('returns 分钟前 / 小时前 / 天前', () => {
    expect(fmtRelative(new Date(Date.now() - 5 * 60 * 1000))).toContain('分钟前');
    expect(fmtRelative(new Date(Date.now() - 3 * 3600 * 1000))).toContain('小时前');
    expect(fmtRelative(new Date(Date.now() - 3 * 24 * 3600 * 1000))).toContain('天前');
  });
  it('falls back to date for old dates', () => {
    const old = new Date(Date.now() - 400 * 24 * 3600 * 1000);
    expect(fmtRelative(old)).toMatch(/\d{4}年/);
  });
});

describe('truncate', () => {
  it('keeps short text intact', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });
  it('appends ellipsis when over max', () => {
    expect(truncate('hello world', 5)).toBe('hello...');
  });
});

describe('fmtCompact', () => {
  it('keeps small numbers', () => {
    expect(fmtCompact(42)).toBe('42');
  });
  it('formats thousands and millions', () => {
    expect(fmtCompact(1500)).toBe('1.5k');
    expect(fmtCompact(2_000_000)).toBe('2.0M');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('jack')).toBe('Jack');
  });
});

describe('uid', () => {
  it('returns unique ids with optional prefix', () => {
    const a = uid();
    const b = uid('pre-');
    expect(a).not.toBe(b);
    expect(b.startsWith('pre-')).toBe(true);
  });
});

describe('debounce', () => {
  it('only invokes once within wait window', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d();
    d();
    d();
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});

describe('throttle', () => {
  it('limits calls to once per wait', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t();
    t();
    t();
    expect(fn).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
