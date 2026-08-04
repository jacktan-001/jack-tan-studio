/**
 * useAudioPlayer — 音频播放逻辑 Hook
 *
 * 从原 app.js 的播放器逻辑迁移，包含：
 * - play / pause / togglePlay
 * - next / prev（播放队列内导航）
 * - seek（点击进度条跳转）
 * - iTunes URL 刷新机制（批量 fetch，24h TTL localStorage 缓存）
 * - 播放失败时的 URL 自动刷新重试
 * - Apple Music 链接修复（移除 /us/ 地区代码）
 * - 进度条更新（timeupdate 事件）
 * - 自动播放下一首（ended 事件）
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Song } from '../types';
import { fixAppleMusicUrl } from '@jack-tan/studio-core';

/** localStorage 缓存 key */
const URL_CACHE_KEY = 'jackwave_url_cache';
/** 缓存 TTL：24 小时 */
const URL_CACHE_TTL = 24 * 60 * 60 * 1000;
/** iTunes Lookup API 每批最多 200 个 trackId */
const ITUNES_BATCH_SIZE = 200;

/** URL 缓存条目 */
interface CacheEntry {
  previewUrl: string;
  trackViewUrl: string;
  artworkUrl100: string;
}

/** URL 缓存结构 */
interface UrlCache {
  _ts: number;
  [trackId: string]: CacheEntry | number;
}

/** 格式化时间：秒 → m:ss */
function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

export interface AudioPlayerState {
  /** 当前播放的歌曲 */
  currentSong: Song | null;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 当前播放进度（0-100 百分比） */
  progress: number;
  /** 当前播放时间（秒） */
  currentTime: number;
  /** 总时长（秒） */
  duration: number;
  /** 格式化的当前时间 */
  currentTimeStr: string;
  /** 格式化的总时长 */
  totalTimeStr: string;
  /** 播放器是否可见（有歌曲时显示底部播放栏） */
  isVisible: boolean;
}

export interface AudioPlayerActions {
  /** 播放指定歌曲（在指定歌单上下文中） */
  playSong: (song: Song, songList: Song[], index: number) => void;
  /** 通过索引播放 */
  playByIndex: (index: number) => void;
  /** 切换播放/暂停 */
  togglePlay: () => void;
  /** 下一首 */
  playNext: () => void;
  /** 上一首 */
  playPrev: () => void;
  /** 跳转到指定进度（0-1 比例） */
  seek: (ratio: number) => void;
  /** 关闭播放器 */
  closePlayer: () => void;
}

export type UseAudioPlayerReturn = AudioPlayerState & AudioPlayerActions;

export function useAudioPlayer(
  songLibrary: Record<string, Song>,
  onError: (msg: string) => void,
  onUrlsRefreshed?: () => void,
): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSongRef = useRef<Song | null>(null);
  const currentSongListRef = useRef<Song[]>([]);
  const currentIndexRef = useRef<number>(-1);

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // === URL 缓存管理 ===

  const getUrlCache = useCallback((): Record<string, CacheEntry> => {
    try {
      const raw = localStorage.getItem(URL_CACHE_KEY);
      if (!raw) return {};
      const cache = JSON.parse(raw) as UrlCache;
      if (Date.now() - (cache._ts as number || 0) > URL_CACHE_TTL) return {};
      // 过滤出有效条目（排除 _ts）
      const result: Record<string, CacheEntry> = {};
      for (const [key, value] of Object.entries(cache)) {
        if (key !== '_ts' && typeof value === 'object') {
          result[key] = value as CacheEntry;
        }
      }
      return result;
    } catch {
      return {};
    }
  }, []);

  const setUrlCache = useCallback((cache: Record<string, CacheEntry>) => {
    try {
      const data: UrlCache = { ...cache, _ts: Date.now() };
      localStorage.setItem(URL_CACHE_KEY, JSON.stringify(data));
    } catch {
      // localStorage 不可用时静默失败
    }
  }, []);

  // === 应用 URL 缓存到 songLibrary ===

  const applyUrlCache = useCallback(
    (cache: Record<string, CacheEntry>) => {
      let updated = false;
      for (const id of Object.keys(songLibrary)) {
        const c = cache[id];
        if (c) {
          const song = songLibrary[id];
          if (song) {
            if (c.previewUrl && c.previewUrl !== song.previewUrl) {
              song.previewUrl = c.previewUrl;
              updated = true;
            }
            if (c.trackViewUrl) {
              song.trackViewUrl = fixAppleMusicUrl(c.trackViewUrl);
            }
            if (c.artworkUrl100 && c.artworkUrl100 !== song.artworkUrl100) {
              song.artworkUrl100 = c.artworkUrl100;
              updated = true;
            }
          }
        }
      }
      if (updated) {
        onUrlsRefreshed?.();
        // 如果播放器正打开，更新当前歌曲信息
        if (currentSongRef.current) {
          const fresh = songLibrary[currentSongRef.current.trackId];
          if (fresh) {
            currentSongRef.current = { ...currentSongRef.current, ...fresh };
            setCurrentSong(currentSongRef.current);
          }
        }
      }
    },
    [songLibrary, onUrlsRefreshed],
  );

  // === iTunes URL 刷新机制 ===

  const refreshSongUrls = useCallback(async () => {
    const trackIds = Object.keys(songLibrary);
    if (trackIds.length === 0) return;

    const cache = getUrlCache();
    const staleIds = trackIds.filter((id) => !cache[id]);

    if (staleIds.length === 0) {
      applyUrlCache(cache);
      return;
    }

    // 分批请求 iTunes Lookup API
    for (let i = 0; i < staleIds.length; i += ITUNES_BATCH_SIZE) {
      const batch = staleIds.slice(i, i + ITUNES_BATCH_SIZE);
      try {
        const url = 'https://itunes.apple.com/lookup?id=' + batch.join(',') + '&media=music';
        const res = await fetch(url);
        const data = await res.json();
        if (data.results) {
          for (const track of data.results) {
            const id = String(track.trackId);
            if (songLibrary[id]) {
              cache[id] = {
                previewUrl: track.previewUrl || songLibrary[id].previewUrl,
                trackViewUrl: track.trackViewUrl || songLibrary[id].trackViewUrl,
                artworkUrl100: track.artworkUrl100 || songLibrary[id].artworkUrl100,
              };
            }
          }
        }
      } catch (e) {
        console.warn('URL 刷新失败:', e);
      }
    }

    setUrlCache(cache);
    applyUrlCache(cache);
  }, [songLibrary, getUrlCache, setUrlCache, applyUrlCache]);

  // === 单首歌曲 URL 刷新（播放失败时重试） ===

  const refreshSingleUrl = useCallback(
    async (song: Song): Promise<string | null> => {
      if (!song.trackId) return null;
      try {
        const res = await fetch(
          'https://itunes.apple.com/lookup?id=' + song.trackId + '&media=music',
        );
        const data = await res.json();
        if (data.results?.[0]?.previewUrl) {
          return data.results[0].previewUrl;
        }
      } catch {
        // 网络错误，静默处理
      }
      return null;
    },
    [],
  );

  // === 音频事件监听 ===

  const setupAudioListeners = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      // 自动播放下一首
      playNextInternal();
    };

    const handleError = () => {
      setIsPlaying(false);
      onError('音频加载失败，链接可能已过期');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onError]);

  // === 内部播放下一首（不依赖 state，用 ref） ===

  const playNextInternal = useCallback(() => {
    const idx = currentIndexRef.current;
    const list = currentSongListRef.current;
    if (idx < 0 || idx >= list.length - 1) {
      setIsPlaying(false);
      return;
    }
    const nextIdx = idx + 1;
    currentIndexRef.current = nextIdx;
    playSongInternal(list[nextIdx]!);
  }, []);

  // === 内部播放歌曲（核心逻辑） ===

  const playSongInternal = useCallback(
    (song: Song) => {
      currentSongRef.current = song;
      setCurrentSong(song);
      setIsVisible(true);

      // 清理旧的 audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(song.previewUrl);
      audioRef.current = audio;

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(async () => {
          // 播放失败，尝试刷新 URL
          console.warn('播放失败，尝试刷新 URL');
          const freshUrl = await refreshSingleUrl(song);
          if (freshUrl) {
            song.previewUrl = freshUrl;
            if (audioRef.current) {
              audioRef.current.pause();
            }
            const newAudio = new Audio(freshUrl);
            audioRef.current = newAudio;
            try {
              await newAudio.play();
              setIsPlaying(true);
              setupAudioListeners();
            } catch {
              setIsPlaying(false);
              onError('音频加载失败，链接可能已过期');
            }
          } else {
            setIsPlaying(false);
            onError('音频加载失败，链接可能已过期');
          }
        });

      setupAudioListeners();
    },
    [refreshSingleUrl, setupAudioListeners, onError],
  );

  // === 公开 API ===

  const playSong = useCallback(
    (song: Song, songList: Song[], index: number) => {
      currentSongListRef.current = songList;
      currentIndexRef.current = index;
      playSongInternal(song);
    },
    [playSongInternal],
  );

  const playByIndex = useCallback(
    (index: number) => {
      const list = currentSongListRef.current;
      if (!list[index]) return;
      currentIndexRef.current = index;
      playSongInternal(list[index]);
    },
    [playSongInternal],
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const playNext = useCallback(() => {
    const idx = currentIndexRef.current;
    const list = currentSongListRef.current;
    if (idx < 0 || idx >= list.length - 1) {
      setIsPlaying(false);
      return;
    }
    playByIndex(idx + 1);
  }, [playByIndex]);

  const playPrev = useCallback(() => {
    const idx = currentIndexRef.current;
    if (idx <= 0) return;
    playByIndex(idx - 1);
  }, [playByIndex]);

  const seek = useCallback((ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = ratio * audio.duration;
  }, []);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentSong(null);
    setIsVisible(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    currentIndexRef.current = -1;
    currentSongRef.current = null;
  }, []);

  // === 启动时后台刷新 URL ===

  useEffect(() => {
    refreshSongUrls().catch((e) => console.warn('URL 刷新失败:', e));
  }, [refreshSongUrls]);

  // === 动态跟踪：定时 + 回到前台时刷新封面/URL ===
  useEffect(() => {
    const INTERVAL = 10 * 60 * 1000;
    const timer = setInterval(() => {
      refreshSongUrls().catch(() => {});
    }, INTERVAL);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshSongUrls().catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshSongUrls]);

  // === 清理 ===

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    currentSong,
    isPlaying,
    progress,
    currentTime,
    duration,
    currentTimeStr: fmtTime(currentTime),
    totalTimeStr: fmtTime(duration || 30),
    isVisible,
    playSong,
    playByIndex,
    togglePlay,
    playNext,
    playPrev,
    seek,
    closePlayer,
  };
}
