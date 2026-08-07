/**
 * Layer 8: Player — 跨应用全局播放器栏 UI
 *
 * 固定在页面底部，展示当前播放歌曲与控制按钮。
 * 三圆圈按钮：播放/暂停、下一首、Apple Music。
 * 关闭/最小化融合在右上角，节省横向空间。
 * 最小化后支持全局拖动。
 */

import { useState, useRef, useEffect, useCallback } from 'react';

import type { GlobalAudioPlayerReturn, PlayerTrack } from './types';
import { fixAppleMusicUrl } from '../utils/url';

export interface GlobalAudioPlayerProps {
  player: GlobalAudioPlayerReturn;
  resolveArtwork?: (url: string) => string;
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
    seek,
    closePlayer,
  } = player;

  const [collapsed, setCollapsed] = useState(false);

  // 鼠标跟随高光
  const barRef = useRef<HTMLDivElement>(null);
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const handleBarMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    barRef.current.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    barRef.current.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  // ============ 最小化拖动 ============
  const pillRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const [pillPos, setPillPos] = useState<{ x: number; y: number } | null>(null);

  const handlePillPointerDown = useCallback((e: React.PointerEvent) => {
    // 不拦截按钮点击
    if ((e.target as HTMLElement).closest('button')) return;
    e.preventDefault();
    dragRef.current.dragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.offsetX = pillPos?.x ?? 0;
    dragRef.current.offsetY = pillPos?.y ?? 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pillPos]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      setPillPos({
        x: dragRef.current.offsetX + dx,
        y: dragRef.current.offsetY + dy,
      });
    };
    const onUp = () => {
      dragRef.current.dragging = false;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  // 重置拖动位置（展开时）
  useEffect(() => {
    if (!collapsed) setPillPos(null);
  }, [collapsed]);

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

  // ============ 圆按钮通用样式 ============
  const circleBtnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'transform 0.15s, opacity 0.15s',
  };

  // ============ 最小化态：可拖动浮动药丸 ============
  if (collapsed) {
    const isCustomPos = pillPos !== null;
    return (
      <div
        ref={pillRef}
        className="jack-global-player-collapsed"
        role="region"
        aria-label="音乐播放器（已收起）"
        onPointerDown={handlePillPointerDown}
        style={{
          position: 'fixed',
          bottom: isCustomPos ? 'auto' : 'calc(20px + env(safe-area-inset-bottom, 0px))',
          right: isCustomPos ? 'auto' : '20px',
          left: isCustomPos ? `${pillPos!.x}px` : 'auto',
          top: isCustomPos ? `${pillPos!.y}px` : 'auto',
          zIndex: 150,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '999px',
          background: 'var(--player-bg, rgba(255,255,255,0.85))',
          backdropFilter: 'blur(var(--glass-blur, 22px)) saturate(180%)',
          WebkitBackdropFilter: 'blur(var(--glass-blur, 22px)) saturate(180%)',
          border: '1px solid var(--player-border, rgba(128,128,128,0.15))',
          boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
          color: 'var(--player-text, #111)',
          cursor: isCustomPos ? 'grabbing' : 'grab',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* 拖动手柄 */}
        <div
          aria-hidden="true"
          style={{
            width: '4px',
            height: '16px',
            borderRadius: '2px',
            background: 'var(--gray-300, #d1d5db)',
            flexShrink: 0,
            marginRight: '2px',
            cursor: 'grab',
          }}
        />
        <button
          className="jack-global-player-ctrl-btn"
          onClick={togglePlay}
          aria-label={isPlaying ? '暂停' : '播放'}
          style={{ ...circleBtnBase, width: '36px', height: '36px', borderRadius: '50%', background: 'var(--teal, #14b8a6)', color: '#fff' }}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          )}
        </button>
        <div style={{ minWidth: 0, overflow: 'hidden', maxWidth: '140px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.title}</div>
          <div style={{ fontSize: '10px', color: 'var(--player-text-muted, #6b7280)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.artist}</div>
        </div>
        <button
          className="jack-global-player-ctrl-btn"
          onClick={() => setCollapsed(false)}
          aria-label="展开播放器"
          style={{ ...circleBtnBase, width: '28px', height: '28px', borderRadius: '50%', color: 'var(--player-text, #111)', background: 'transparent' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
        </button>
        <button
          className="jack-global-player-ctrl-btn"
          onClick={() => { setCollapsed(false); closePlayer(); }}
          aria-label="关闭播放器"
          style={{ ...circleBtnBase, width: '28px', height: '28px', borderRadius: '50%', color: 'var(--player-text, #111)', background: 'transparent' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
    );
  }

  // ============ 展开态：全宽底部栏 ============
  return (
    <div
      ref={barRef}
      onMouseMove={handleBarMove}
      className="jack-global-player-bar active"
      role="region"
      aria-label="音乐播放器"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 150,
        /* 播放器本体高度（不含 safe-area） */
        height: '88px',
        /* Apple 风磨砂玻璃 */
        background: 'var(--player-bg, rgba(255,255,255,0.72))',
        backdropFilter: 'blur(var(--glass-blur, 22px)) saturate(180%)',
        WebkitBackdropFilter: 'blur(var(--glass-blur, 22px)) saturate(180%)',
        borderTop: '1px solid var(--player-border, rgba(128,128,128,0.12))',
        boxShadow: '0 10px 40px rgba(0,0,0,0.22)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        gap: '16px',
        color: 'var(--player-text, #111)',
      }}
    >
      {/* 鼠标跟随高光层 */}
      <div className="jack-global-player-glow" aria-hidden="true" />

      {/* ====== 封面 ====== */}
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
          width: '64px',
          height: '64px',
          borderRadius: '12px',
          objectFit: 'cover',
          flexShrink: 0,
          background: 'var(--gray-100, #f3f4f6)',
        }}
      />

      {/* ====== 歌曲信息（宽裕空间） ====== */}
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
            lineHeight: 1.3,
          }}
        >
          {currentTrack.title}
        </div>
        <div
          className="jack-global-player-artist"
          style={{
            fontSize: '13px',
            color: 'var(--player-text-muted, #6b7280)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
        >
          {currentTrack.artist}
        </div>
      </div>

      {/* ====== 进度条 ====== */}
      <div
        className="jack-global-player-progress"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '40px',
          maxWidth: '260px',
        }}
      >
        <span
          className="jack-global-player-time"
          style={{
            fontSize: '11px',
            color: 'var(--player-text-muted, #9ca3af)',
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
            color: 'var(--player-text-muted, #9ca3af)',
            fontWeight: 500,
            minWidth: '32px',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          {totalTimeStr}
        </span>
      </div>

      {/* ====== 三圆圈按钮 ====== */}
      <div
        className="jack-global-player-controls"
        style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}
      >
        {/* 1. 播放/暂停 — 大圆 */}
        <button
          className="jack-global-player-play"
          onClick={togglePlay}
          aria-label={isPlaying ? '暂停' : '播放'}
          style={{
            ...circleBtnBase,
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--teal, #14b8a6)',
            color: '#fff',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {isPlaying ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        {/* 2. 下一首 — 中圆 */}
        <button
          className="jack-global-player-ctrl-btn"
          onClick={(e) => { playNext(); e.currentTarget.blur(); }}
          aria-label="下一首"
          style={{
            ...circleBtnBase,
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            color: 'var(--player-text, #111)',
            background: 'var(--gray-100, rgba(128,128,128,0.08))',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-200, rgba(128,128,128,0.16))'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--gray-100, rgba(128,128,128,0.08))'; }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>

        {/* 3. Apple Music — 中圆 */}
        {platformUrl && (
          <a
            className="jack-global-player-ctrl-btn"
            href={platformUrl}
            target="_blank"
            rel="noopener"
            aria-label="在 Apple Music 中打开"
            title="Apple Music"
            style={{
              ...circleBtnBase,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              color: '#fff',
              background: '#000',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          </a>
        )}
      </div>

      {/* ====== 右上角：最小化 + 关闭 ====== */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          zIndex: 2,
        }}
      >
        <button
          className="jack-global-player-minimize"
          onClick={() => setCollapsed(true)}
          aria-label="最小化播放器"
          title="最小化"
          style={{
            ...circleBtnBase,
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            color: 'var(--player-text-muted, #6b7280)',
            background: 'transparent',
            fontSize: '16px',
            lineHeight: 1,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100, rgba(128,128,128,0.1))'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
        <button
          className="jack-global-player-close"
          onClick={() => { setCollapsed(false); closePlayer(); }}
          aria-label="关闭播放器"
          title="关闭"
          style={{
            ...circleBtnBase,
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            color: 'var(--player-text-muted, #6b7280)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100, rgba(128,128,128,0.1))'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      {/* 响应式 */}
      <style>{`
        @media (max-width: 900px) {
          .jack-global-player-bar {
            height: calc(76px + env(safe-area-inset-bottom, 0px)) !important;
            padding: 0 14px !important;
            gap: 10px !important;
          }
          .jack-global-player-cover {
            width: 50px !important;
            height: 50px !important;
            border-radius: 10px !important;
          }
          .jack-global-player-progress,
          .jack-global-player-time {
            display: none !important;
          }
          .jack-global-player-title {
            font-size: 14px !important;
          }
          .jack-global-player-artist {
            font-size: 12px !important;
          }
        }
        @media (max-width: 640px) {
          .jack-global-player-bar {
            padding: 0 10px !important;
            gap: 8px !important;
          }
          .jack-global-player-play {
            width: 42px !important;
            height: 42px !important;
          }
          .jack-global-player-play svg {
            width: 20px !important;
            height: 20px !important;
          }
          .jack-global-player-controls {
            gap: 6px !important;
          }
          .jack-global-player-controls > button:not(.jack-global-player-play),
          .jack-global-player-controls > a {
            width: 36px !important;
            height: 36px !important;
          }
        }
        @media (max-width: 480px) {
          .jack-global-player-cover {
            width: 42px !important;
            height: 42px !important;
            border-radius: 8px !important;
          }
          .jack-global-player-title {
            font-size: 13px !important;
          }
          .jack-global-player-artist {
            font-size: 11px !important;
          }
          .jack-global-player-play {
            width: 38px !important;
            height: 38px !important;
          }
          .jack-global-player-controls > button:not(.jack-global-player-play),
          .jack-global-player-controls > a {
            width: 32px !important;
            height: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
