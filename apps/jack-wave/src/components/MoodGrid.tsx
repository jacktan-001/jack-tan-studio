/**
 * MoodGrid — 心情歌单网格
 * 展示所有心情歌单卡片，点击打开弹窗
 */

import type { MoodPlaylist } from '../types';
import { safeUrl } from '../utils';
import { playlistCover } from '../data/musicData';

export interface MoodGridProps {
  moodPlaylists: MoodPlaylist[];
  onOpenMood: (id: number) => void;
}

export function MoodGrid({ moodPlaylists, onOpenMood }: MoodGridProps) {
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
        style={{ color: 'var(--gray-500)', fontSize: '15px', marginBottom: '40px' }}
      >
        不同的心情，不同的歌单
      </p>
      <div
        className="mood-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
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
                src={safeUrl(playlistCover(p)) || ''}
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
      {/* 响应式网格 */}
      <style>{`
        @media (max-width: 900px) {
          .mood-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .mood-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
