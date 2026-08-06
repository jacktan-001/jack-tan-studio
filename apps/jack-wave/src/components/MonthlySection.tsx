/**
 * MonthlySection — 本月推荐
 *
 * 仅展示当前月份的封面图 + 简介文字；
 * 用户点击卡片后弹出歌曲列表弹窗，交互方式与心情歌单保持一致。
 */

import { forwardRef, useImperativeHandle, useState } from 'react';
import type { MonthlyShare, Song } from '../types';
import type { PlayerTrack } from '@jack-tan/studio-core';
import { safeUrl, artworkSrc } from '../utils';
import { playlistCover } from '../data/musicData';

export interface MonthlySectionProps {
  monthlyShares: MonthlyShare[];
  currentSong: Song | PlayerTrack | null;
  onPlay: (song: Song, songList: Song[], index: number) => void;
  onOpenMonthly: (id: number) => void;
}

/** 暴露给父组件的方法：跳转到最新月份并自动播放第一首 */
export interface MonthlySectionRef {
  playCurrentMonth: () => void;
}

export const MonthlySection = forwardRef<MonthlySectionRef, MonthlySectionProps>(
  function MonthlySection({ monthlyShares, onPlay, onOpenMonthly }, ref) {
    const [monthIndex, setMonthIndex] = useState(0);

    // 暴露 playCurrentMonth 方法给父组件
    useImperativeHandle(ref, () => ({
      playCurrentMonth: () => {
        setMonthIndex(0);
        if (monthlyShares.length > 0 && monthlyShares[0]!.songList.length > 0) {
          onPlay(monthlyShares[0]!.songList[0]!, monthlyShares[0]!.songList, 0);
        }
      },
    }), [monthlyShares, onPlay]);

    if (!monthlyShares.length) return null;

    const m = monthlyShares[monthIndex]!;

    // 数组按月份降序排列（最新在前），← 浏览更早的月份，→ 浏览更新的月份
    const handleMonthChange = (dir: number) => {
      setMonthIndex((prev) =>
        Math.max(0, Math.min(monthlyShares.length - 1, prev - dir)),
      );
    };

    const handleOpen = () => {
      onOpenMonthly(m.id);
    };

    return (
      <section
        className="section"
        id="monthly"
        style={{
          padding: '80px 24px',
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <h2
          className="section-title"
          style={{
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '-1px',
            marginBottom: '8px',
          }}
        >
          本月推荐
        </h2>
        <p
          className="section-desc"
          style={{ color: 'var(--gray-500)', fontSize: '15px', marginBottom: '28px' }}
        >
          每月精选歌单，记录这个月的声音记忆
        </p>

        {/* 月份导航 */}
        <div
          className="month-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
            padding: '0 32px',
          }}
        >
          <button
            className="month-nav-btn"
            onClick={() => handleMonthChange(-1)}
            disabled={monthIndex >= monthlyShares.length - 1}
            aria-label="上个月"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1.5px solid var(--gray-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all .2s',
              color: 'var(--gray-600)',
              cursor: monthIndex >= monthlyShares.length - 1 ? 'not-allowed' : 'pointer',
              opacity: monthIndex >= monthlyShares.length - 1 ? 0.3 : 1,
              background: 'none',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span
            className="month-nav-label"
            aria-live="polite"
            style={{ fontSize: '14px', fontWeight: 500, color: 'var(--gray-600)' }}
          >
            {m.month}
          </span>
          <button
            className="month-nav-btn"
            onClick={() => handleMonthChange(1)}
            disabled={monthIndex <= 0}
            aria-label="下个月"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '1.5px solid var(--gray-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all .2s',
              color: 'var(--gray-600)',
              cursor: monthIndex <= 0 ? 'not-allowed' : 'pointer',
              opacity: monthIndex <= 0 ? 0.3 : 1,
              background: 'none',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* 本月推荐卡片：仅封面 + 简介，点击打开歌曲列表弹窗 */}
        <div
          className="monthly-card"
          onClick={handleOpen}
          role="button"
          tabIndex={0}
          aria-label={`${m.month} ${m.title}，点击查看歌曲列表`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpen();
            }
          }}
          style={{
            background: 'var(--card)',
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow)',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'transform .25s ease, box-shadow .25s ease',
          }}
        >
          <div
            className="monthly-header"
            style={{
              display: 'flex',
              gap: '32px',
              padding: '32px',
              alignItems: 'center',
            }}
          >
            <img
              className="monthly-cover"
              src={artworkSrc(playlistCover(m)) || ''}
              alt="月度歌单封面"
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                if (!img.dataset.fallback) {
                  img.dataset.fallback = '1';
                  img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="16" fill="%230d9488"/><path d="M60 100 Q80 70 100 100 T140 100" stroke="%2314b8a6" stroke-width="3" fill="none" opacity="0.6"/><path d="M60 120 Q80 90 100 120 T140 120" stroke="%232dd4bf" stroke-width="2" fill="none" opacity="0.4"/><circle cx="100" cy="95" r="20" fill="%2364d8c0" opacity="0.3"/></svg>');
                }
              }}
              style={{
                width: '200px',
                height: '200px',
                borderRadius: '16px',
                objectFit: 'cover',
                flexShrink: 0,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                background: 'var(--gray-100)',
              }}
            />
            <div className="monthly-info" style={{ flex: 1, minWidth: 0 }}>
              <div
                className="monthly-month"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--teal)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '4px',
                }}
              >
                {m.month}
              </div>
              <div
                className="monthly-name"
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  marginBottom: '4px',
                }}
              >
                {m.title}
              </div>
              <div
                className="monthly-author"
                style={{
                  fontSize: '14px',
                  color: 'var(--gray-500)',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {m.avatarImage && (
                  <img
                    className="monthly-author-avatar"
                    src={safeUrl(m.avatarImage) || ''}
                    alt=""
                    loading="lazy"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0,
                    }}
                  />
                )}
                <span>{m.author}</span>
              </div>
              <div
                className="monthly-meta"
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  className="monthly-tag"
                  style={{
                    padding: '4px 12px',
                    background: 'var(--tag-bg)',
                    color: 'var(--teal)',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  {m.tag}
                </span>
                <span
                  className="monthly-count"
                  style={{ fontSize: '13px', color: 'var(--gray-400)' }}
                >
                  {m.songList.length} 首
                </span>
              </div>
              <div
                className="monthly-desc"
                style={{
                  fontSize: '14px',
                  color: 'var(--gray-600)',
                  lineHeight: 1.7,
                }}
              >
                {m.desc}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .monthly-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
          }
          .monthly-card:focus-visible {
            outline: 2px solid var(--teal);
            outline-offset: 3px;
          }
          @media (max-width: 640px) {
            .monthly-card { border-radius: 16px !important; }
            .monthly-header {
              flex-direction: column !important;
              align-items: center !important;
              gap: 20px !important;
              padding: 20px !important;
              text-align: center;
            }
            .monthly-cover {
              width: 100% !important;
              max-width: 260px !important;
              height: auto !important;
              aspect-ratio: 1 / 1 !important;
            }
            .monthly-info { width: 100% !important; }
            .monthly-author,
            .monthly-meta { justify-content: center !important; }
          }
        `}</style>
      </section>
    );
  },
);
