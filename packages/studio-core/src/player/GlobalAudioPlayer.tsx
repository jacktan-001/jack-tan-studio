/**
 * Layer 8: Player — 跨应用全局播放器栏 UI
 *
 * 固定在页面底部，展示当前播放歌曲、控制按钮、进度条与平台链接。
 * 支持通过 prop 自定义封面解析与错误处理。
 */

import type { GlobalAudioPlayerReturn, PlayerTrack } from './types';
import { fixAppleMusicUrl } from '../utils/url';

export interface GlobalAudioPlayerProps {
  /** useGlobalAudioPlayer 返回值 */
  player: GlobalAudioPlayerReturn;
  /** 可选的封面 URL 解析函数 */
  resolveArtwork?: (url: string) => string;
  /** 可选的平台链接生成函数（默认使用 Apple Music） */
  resolvePlatformUrl?: (track: PlayerTrack) => string;
}

function safeUrl(url: string): string {
  if (!url) return '';
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.href : undefined);
    return u.protocol === 'http:' || u.protocol === 'https:' ? url : '';
  } catch {
    return '';
  }
}

export function GlobalAudioPlayer({
  player,
  resolveArtwork,
  resolvePlatformUrl,
}: GlobalAudioPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTimeStr,
    totalTimeStr,
    isVisible,
    togglePlay,
    playNext,
    playPrev,
    seek,
  } = player;

  if (!isVisible || !currentTrack) return null;

  const platformUrl = resolvePlatformUrl
    ? resolvePlatformUrl(currentTrack)
    : fixAppleMusicUrl(safeUrl(currentTrack.trackViewUrl));

  const artworkUrl = resolveArtwork
    ? resolveArtwork(currentTrack.artworkUrl100)
    : safeUrl(currentTrack.artworkUrl100);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio);
  };

  return (
    <div
      className="jack-global-player-bar active"
      role="region"
      aria-label="音乐播放器"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 150,
        height: 'calc(96px + env(safe-area-inset-bottom, 0px))',
        background: 'var(--player-bg, rgba(255,255,255,0.85))',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border, rgba(128,128,128,0.15))',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        gap: '14px',
        transform: 'translateY(0)',
        transition: 'transform .3s ease',
        color: 'var(--text, #111)',
      }}
    >
      {/* 封面 */}
      <img
        className="jack-global-player-cover"
        src={artworkUrl || ''}
        alt="当前播放歌曲封面"
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget;
          if (!img.dataset.fallback) {
            img.dataset.fallback = '1';
            img.src =
              'data:image/svg+xml,' +
              encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><rect width="72" height="72" rx="12" fill="%230d9488"/><circle cx="36" cy="36" r="16" fill="none" stroke="%2314b8a6" stroke-width="2"/><circle cx="36" cy="36" r="6" fill="%2364d8c0"/></svg>',
              );
          }
        }}
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '12px',
          objectFit: 'cover',
          flexShrink: 0,
          background: 'var(--gray-100, #f3f4f6)',
        }}
      />

      {/* 歌曲信息 */}
      <div
        className="jack-global-player-info"
        style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}
      >
        <div
          className="jack-global-player-title"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {currentTrack.title}
        </div>
        <div
          className="jack-global-player-artist"
          style={{
            fontSize: '13px',
            color: 'var(--gray-500, #6b7280)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {currentTrack.artist}
        </div>
      </div>

      {/* 控制按钮 */}
      <div
        className="jack-global-player-controls"
        style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
      >
        <button
          className="jack-global-player-ctrl-btn"
          onClick={(e) => {
            playPrev();
            e.currentTarget.blur();
          }}
          aria-label="上一首"
          title="上一首"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="19 20 9 12 19 4 19 20" />
            <line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        <button
          className="jack-global-player-play"
          onClick={togglePlay}
          aria-label="播放/暂停"
          title="播放/暂停"
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: 'var(--teal, #14b8a6)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all .15s',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <button
          className="jack-global-player-ctrl-btn"
          onClick={(e) => {
            playNext();
            e.currentTarget.blur();
          }}
          aria-label="下一首"
          title="下一首"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* 进度条 */}
      <div
        className="jack-global-player-progress"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '40px',
          maxWidth: '300px',
        }}
      >
        <span
          className="jack-global-player-time"
          style={{
            fontSize: '11px',
            color: 'var(--gray-400, #9ca3af)',
            fontWeight: 500,
            minWidth: '32px',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          {currentTimeStr}
        </span>
        <div
          className="jack-global-progress-bar"
          onClick={handleSeek}
          role="slider"
          aria-label="播放进度"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{
            flex: 1,
            height: '4px',
            background: 'var(--gray-200, #e5e7eb)',
            borderRadius: '4px',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            minWidth: '30px',
          }}
        >
          <div
            className="jack-global-progress-fill"
            style={{
              height: '100%',
              background: 'var(--teal, #14b8a6)',
              borderRadius: '4px',
              width: `${progress}%`,
              transition: 'width .1s linear',
            }}
          />
        </div>
        <span
          className="jack-global-player-time"
          style={{
            fontSize: '11px',
            color: 'var(--gray-400, #9ca3af)',
            fontWeight: 500,
            minWidth: '32px',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          {totalTimeStr}
        </span>
      </div>

      {/* 平台链接 — Apple Music */}
      {platformUrl && (
        <div
          className="jack-global-player-platforms"
          style={{ display: 'flex', gap: '8px', flexShrink: 0 }}
        >
          <a
            className="jack-global-platform-btn jack-global-platform-am"
            href={platformUrl}
            target="_blank"
            rel="noopener"
            title="Apple Music"
            aria-label="在 Apple Music 中打开"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '14px 22px',
              borderRadius: '999px',
              background: '#000000',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'transform .15s, opacity .15s',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              minHeight: '48px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.opacity = '1';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <span>Apple Music</span>
          </a>
        </div>
      )}

      {/* 响应式：移动端隐藏进度条和平台链接文字 */}
      <style>{`
        @media (max-width: 768px) {
          .jack-global-player-bar {
            height: calc(84px + env(safe-area-inset-bottom, 0px)) !important;
            padding: 0 14px !important;
            gap: 10px !important;
          }
          .jack-global-player-cover {
            width: 60px !important;
            height: 60px !important;
          }
          .jack-global-player-progress,
          .jack-global-player-time {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .jack-global-platform-btn span {
            display: none;
          }
          .jack-global-platform-btn {
            padding: 14px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
