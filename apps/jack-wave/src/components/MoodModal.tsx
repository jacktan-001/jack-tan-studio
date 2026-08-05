/**
 * MoodModal — 心情歌单详情弹窗
 * 点击心情歌单卡片后弹出，展示歌单信息和歌曲列表
 * 包含 focus trap、Escape 关闭、点击遮罩关闭等无障碍特性
 */

import { useEffect, useRef } from 'react';
import type { MoodPlaylist, Song } from '../types';
import { SongList } from './SongList';
import { artworkSrc } from '../utils';
import { playlistCover } from '../data/musicData';
import { useFocusTrap } from '../hooks/useFocusTrap';

export interface MoodModalProps {
  playlist: MoodPlaylist | null;
  show: boolean;
  onClose: () => void;
  currentSong: Song | null;
  onPlay: (song: Song, songList: Song[], index: number) => void;
}

export function MoodModal({
  playlist,
  show,
  onClose,
  currentSong,
  onPlay,
}: MoodModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap + 焦点恢复
  useFocusTrap(dialogRef, show && !!playlist);

  // Escape 键关闭弹窗
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  if (!playlist) return null;

  const handlePlayByIndex = (index: number) => {
    if (playlist.songList[index]) {
      onPlay(playlist.songList[index], playlist.songList, index);
    }
  };

  const titleId = 'mood-modal-title';
  const descId = 'mood-modal-desc';

  return (
    <div
      className={`modal-overlay${show ? ' active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        // 提到共享导航栏（StudioBar z-index:999）与底部播放器之上，避免 PWA 下被遮挡
        zIndex: 1200,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // 顶部额外预留共享导航栏高度 64px + PWA 安全区，确保弹窗顶部不被系统状态栏 / 导航栏遮挡
        padding: 'calc(64px + env(safe-area-inset-top, 0px)) 24px max(24px, env(safe-area-inset-bottom, 0px))',
        opacity: show ? 1 : 0,
        pointerEvents: show ? 'auto' : 'none',
        transition: 'opacity .25s',
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card-solid)',
          borderRadius: '20px',
          maxWidth: '640px',
          width: '100%',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transform: show ? 'translateY(0)' : 'translateY(20px)',
          transition: 'transform .25s',
          boxShadow: 'var(--shadow-lg)',
          outline: 'none',
        }}
      >
        <div
          className="modal-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '24px 24px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <img
            className="modal-cover"
            src={artworkSrc(playlistCover(playlist)) || ''}
            alt={`${playlist.title}封面`}
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.dataset.fallback) {
                img.dataset.fallback = '1';
                img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="%230d9488"/><circle cx="32" cy="26" r="10" fill="%2314b8a6" opacity="0.5"/><path d="M16 40 Q32 28 48 40" stroke="%232dd4bf" stroke-width="1.5" fill="none" opacity="0.4"/></svg>');
              }
            }}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '12px',
              objectFit: 'cover',
              background: 'var(--gray-100)',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              id={titleId}
              className="modal-title"
              style={{ fontSize: '20px', fontWeight: 700 }}
            >
              {playlist.title}
            </div>
            <div
              id={descId}
              className="modal-subtitle"
              style={{ fontSize: '13px', color: 'var(--gray-500)' }}
            >
              {playlist.author} · {playlist.tag} · {playlist.songList.length}首
            </div>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="关闭弹窗"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--gray-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 'auto',
              flexShrink: 0,
              transition: 'background .15s',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text)',
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
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div
          className="modal-songs"
          style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px' }}
        >
          <SongList
            songs={playlist.songList}
            currentSong={currentSong}
            onPlay={handlePlayByIndex}
          />
        </div>
      </div>
    </div>
  );
}
