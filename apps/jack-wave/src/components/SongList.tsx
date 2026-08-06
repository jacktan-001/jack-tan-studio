/**
 * SongList — 可复用的歌曲列表组件
 * 用于月度歌单和心情歌单弹窗中的歌曲展示
 * React 内建转义替代原 app.js 的 esc() 函数
 *
 * 性能优化：当歌曲数量超过阈值时启用虚拟滚动（@tanstack/react-virtual），
 * 只渲染可视区域内的歌曲行，避免大列表一次性渲染导致的性能问题。
 */

import { useRef } from 'react';
import type { Song } from '../types';
import type { PlayerTrack } from '@jack-tan/studio-core';
import { artworkSrc } from '../utils';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface SongListProps {
  songs: Song[];
  /** 当前正在播放的歌曲（用于高亮） */
  currentSong: Song | PlayerTrack | null;
  /** 点击歌曲时的回调 */
  onPlay: (index: number) => void;
}

/** 超过该数量后启用虚拟滚动（小列表保持原有简单渲染） */
const VIRTUALIZE_THRESHOLD = 30;
/** 单行预估高度：上下 padding(10+10) + 封面高度(44) = 64px */
const ROW_HEIGHT = 64;

export function SongList({ songs, currentSong, onPlay }: SongListProps) {
  // 滚动容器 ref（仅在虚拟滚动分支使用，但 hook 必须无条件调用）
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: songs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  /** 渲染单条歌曲行（保持原有内联样式与结构完全不变） */
  const renderRow = (s: Song, i: number) => {
    const isPlayingSong =
      currentSong && currentSong.previewUrl === s.previewUrl;
    return (
      <div
        key={`${s.trackId}-${i}`}
        className={`song-row${isPlayingSong ? ' playing' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '10px 12px',
          borderRadius: '12px',
          transition: 'background .15s',
          cursor: 'pointer',
          background: isPlayingSong ? 'var(--tag-bg)' : undefined,
        }}
        onClick={() => onPlay(i)}
        role="listitem"
      >
        {isPlayingSong ? (
          <span
            className="song-playing-icon"
            style={{
              width: '24px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '2px',
              flexShrink: 0,
              height: '16px',
            }}
          >
            <span
              className="bar"
              style={{
                display: 'inline-block',
                width: '3px',
                background: 'var(--teal)',
                borderRadius: '2px',
                animation: 'eq .8s ease-in-out infinite',
                height: '8px',
              }}
            />
            <span
              className="bar"
              style={{
                display: 'inline-block',
                width: '3px',
                background: 'var(--teal)',
                borderRadius: '2px',
                animation: 'eq .8s ease-in-out infinite',
                animationDelay: '.2s',
                height: '14px',
              }}
            />
            <span
              className="bar"
              style={{
                display: 'inline-block',
                width: '3px',
                background: 'var(--teal)',
                borderRadius: '2px',
                animation: 'eq .8s ease-in-out infinite',
                animationDelay: '.4s',
                height: '6px',
              }}
            />
          </span>
        ) : (
          <span
            className="song-num"
            style={{
              width: '24px',
              textAlign: 'center',
              fontSize: '13px',
              color: 'var(--gray-400)',
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {i + 1}
          </span>
        )}
        <img
          className="song-cover"
          src={artworkSrc(s.artworkUrl100) || ''}
          alt=""
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (!img.dataset.fallback) {
              img.dataset.fallback = '1';
              img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><rect width="44" height="44" rx="8" fill="%230d9488"/><path d="M16 16 L28 16 L28 28 L16 28 Z M18 18 L26 18 L26 26 L18 26 Z" fill="%2314b8a6" opacity="0.5"/><circle cx="22" cy="22" r="4" fill="%2364d8c0"/></svg>');
            }
          }}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            objectFit: 'cover',
            flexShrink: 0,
            background: 'var(--gray-100)',
          }}
        />
        <div
          className="song-info"
          style={{ flex: 1, minWidth: 0 }}
        >
          <div
            className="song-title"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {s.title}
          </div>
          <div
            className="song-artist"
            style={{
              fontSize: '12px',
              color: 'var(--gray-500)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {s.artist}
          </div>
        </div>
        <span
          className="song-duration"
          style={{
            fontSize: '12px',
            color: 'var(--gray-400)',
            flexShrink: 0,
            marginRight: '8px',
          }}
        >
          {s.duration}
        </span>
      </div>
    );
  };

  // 小列表：保持原有简单渲染，无虚拟滚动开销
  if (songs.length <= VIRTUALIZE_THRESHOLD) {
    return (
      <div className="song-list" style={{ padding: '0 32px 24px' }} role="list">
        {songs.map((s, i) => renderRow(s, i))}
      </div>
    );
  }

  // 大列表：启用虚拟滚动，仅渲染可视区域内的行
  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div
      className="song-list"
      ref={parentRef}
      style={{ padding: '0 32px 24px', overflowY: 'auto', maxHeight: '70vh' }}
      role="list"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => {
          const s = songs[virtualItem.index];
          // virtualItem.index 由虚拟列表保证落在 [0, songs.length) 内，
          // 此处判断仅为满足 noUncheckedIndexedAccess 的类型收窄。
          if (!s) return null;
          return (
            <div
              key={`${s.trackId}-${virtualItem.index}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderRow(s, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
