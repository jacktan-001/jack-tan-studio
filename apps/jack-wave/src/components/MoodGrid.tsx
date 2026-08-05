/**
 * MoodGrid — 心情歌单横向滚动卡片
 * 展示所有心情歌单卡片，点击打开弹窗；桌面端支持鼠标滚轮左右滚动
 */

import { useRef, useEffect } from 'react';
import type { MoodPlaylist } from '../types';
import { safeUrl, artworkSrc } from '../utils';
import { playlistCover } from '../data/musicData';

export interface MoodGridProps {
  moodPlaylists: MoodPlaylist[];
  onOpenMood: (id: number) => void;
}

export function MoodGrid({ moodPlaylists, onOpenMood }: MoodGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 鼠标滚轮映射为横向滚动
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // 只有容器存在横向滚动空间时才拦截纵向滚轮
      if (el.scrollWidth <= el.clientWidth) return;
      // 避免与横向滚轮冲突（如触控板横向滑动）
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      el.scrollBy({ left: e.deltaY, behavior: 'smooth' });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <section
      className="section"
      id="mood"
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
        心情歌单
      </h2>
      <p
        className="section-desc"
        style={{ color: 'var(--gray-500)', fontSize: '15px', marginBottom: '28px' }}
      >
        不同的心情，不同的歌单
      </p>

      <div
        ref={scrollRef}
        className="mood-scroll-container"
        style={{
          display: 'flex',
          gap: '20px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          padding: '8px 4px 24px',
          margin: '0 -4px',
        }}
      >
        {moodPlaylists.map((p) => (
          <div
            key={p.id}
            className="mood-card"
            onClick={() => onOpenMood(p.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenMood(p.id);
              }
            }}
            style={{
              flex: '0 0 auto',
              width: 'clamp(240px, 32vw, 280px)',
              scrollSnapAlign: 'start',
              background: 'var(--card)',
              backdropFilter: 'blur(12px)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
              overflow: 'hidden',
              transition: 'all .3s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow)';
            }}
          >
            <div
              className="mood-cover-wrap"
              style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden' }}
            >
              <img
                className="mood-cover"
                src={artworkSrc(playlistCover(p)) || ''}
                alt={`${p.title}封面`}
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = '1';
                    img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%230d9488"/><circle cx="100" cy="80" r="30" fill="%2314b8a6" opacity="0.4"/><path d="M50 120 Q100 90 150 120" stroke="%232dd4bf" stroke-width="2" fill="none" opacity="0.5"/></svg>');
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform .4s',
                }}
              />
              <div
                className="mood-cover-overlay"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)',
                }}
              />
              <span
                className="mood-tag"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '4px 10px',
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                {p.tag}
              </span>
            </div>
            <div className="mood-body" style={{ padding: '16px 18px 20px' }}>
              <div
                className="mood-title"
                style={{ fontSize: '17px', fontWeight: 600, marginBottom: '2px' }}
              >
                {p.title}
              </div>
              <div
                className="mood-author"
                style={{
                  fontSize: '13px',
                  color: 'var(--gray-500)',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {p.avatarImage && (
                  <img
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      verticalAlign: 'middle',
                      marginRight: '4px',
                    }}
                    src={safeUrl(p.avatarImage) || ''}
                    alt=""
                    loading="lazy"
                  />
                )}
                {p.author}
              </div>
              <div
                className="mood-desc"
                style={{
                  fontSize: '13px',
                  color: 'var(--gray-400)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {p.desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .mood-scroll-container {
          scrollbar-width: thin;
          scrollbar-color: var(--gray-300) transparent;
        }
        .mood-scroll-container::-webkit-scrollbar {
          height: 6px;
        }
        .mood-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .mood-scroll-container::-webkit-scrollbar-thumb {
          background: var(--gray-300);
          border-radius: 3px;
        }
        :root[data-theme="dark"] .mood-scroll-container::-webkit-scrollbar-thumb {
          background: var(--gray-600);
        }

        @media (max-width: 560px) {
          .mood-card {
            width: clamp(200px, 72vw, 260px) !important;
          }
        }
      `}</style>
    </section>
  );
}
