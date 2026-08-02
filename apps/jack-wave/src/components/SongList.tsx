/**
 * SongList — 可复用的歌曲列表组件
 * 用于月度歌单和心情歌单弹窗中的歌曲展示
 * React 内建转义替代原 app.js 的 esc() 函数
 */

import type { Song } from '../types';
import { safeUrl } from '../utils';

export interface SongListProps {
  songs: Song[];
  /** 当前正在播放的歌曲（用于高亮） */
  currentSong: Song | null;
  /** 点击歌曲时的回调 */
  onPlay: (index: number) => void;
}

export function SongList({ songs, currentSong, onPlay }: SongListProps) {
  return (
    <div className="song-list" style={{ padding: '0 32px 24px' }} role="list">
      {songs.map((s, i) => {
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
              src={safeUrl(s.artworkUrl100) || ''}
              alt=""
              loading="lazy"
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
      })}
    </div>
  );
}
