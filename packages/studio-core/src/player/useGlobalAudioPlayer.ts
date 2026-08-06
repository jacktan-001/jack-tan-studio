/**
 * Layer 8: Player — 跨应用全局音频播放器 Hook
 *
 * 特性：
 * - 页面跳转后通过 localStorage 恢复播放状态与进度
 * - 多标签页间通过 BroadcastChannel 同步播放事件
 * - 自动播放下一首、播放失败重试
 * - 进度条、播放/暂停、上一首/下一首、跳转
 *
 * 用法：
 *   const player = useGlobalAudioPlayer({
 *     onError: (msg) => toast(msg),
 *     resolveArtwork: (url) => artworkSrc(url),
 *   });
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type {
  GlobalAudioPlayerReturn,
  PlayerTrack,
} from './types';
import {
  clearPlayerState,
  createPlayerChannel,
  postPlayerMessage,
  readPlayerState,
  subscribePlayerMessages,
  writePlayerState,
} from './storage';

/** 格式化时间：秒 → m:ss */
function fmtTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  return m + ':' + String(Math.floor(s % 60)).padStart(2, '0');
}

/** 尝试从完整 song 对象转换为 PlayerTrack */
export function toPlayerTrack(
  song: unknown,
  resolveArtwork?: (url: string) => string,
): PlayerTrack {
  const s = song as Record<string, unknown>;
  const rawArtwork = String(s.artworkUrl100 || '');
  return {
    trackId: String(s.trackId || s.id || Math.random().toString(36).slice(2)),
    title: String(s.title || '未知歌曲'),
    artist: String(s.artist || '未知艺人'),
    previewUrl: String(s.previewUrl || ''),
    trackViewUrl: String(s.trackViewUrl || ''),
    artworkUrl100: resolveArtwork ? resolveArtwork(rawArtwork) : rawArtwork,
    duration: typeof s.duration === 'number' ? s.duration : undefined,
  };
}

export interface UseGlobalAudioPlayerOptions {
  /** 播放错误回调 */
  onError?: (message: string) => void;
  /** 封面图 URL 解析（从持久化状态恢复时使用） */
  resolveArtwork?: (url: string) => string;
}

export function useGlobalAudioPlayer(
  options: UseGlobalAudioPlayerOptions = {},
): GlobalAudioPlayerReturn {
  const { onError, resolveArtwork } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<PlayerTrack | null>(null);
  const queueRef = useRef<PlayerTrack[]>([]);
  const indexRef = useRef<number>(-1);
  const isPlayingRef = useRef<boolean>(false);
  const durationRef = useRef<number>(0);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // 同步 ref 与 state（便于事件回调读取最新值）
  const syncStateRef = useCallback(() => {
    trackRef.current = currentTrack;
    isPlayingRef.current = isPlaying;
    durationRef.current = duration;
  }, [currentTrack, isPlaying, duration]);

  useEffect(() => {
    syncStateRef();
  }, [syncStateRef]);

  // 持久化当前状态（不含音频对象）
  const persistState = useCallback(
    (overrides?: Partial<{
      currentTrack: PlayerTrack | null;
      queue: PlayerTrack[];
      currentIndex: number;
      isPlaying: boolean;
      currentTime: number;
    }>) => {
      writePlayerState({
        currentTrack: overrides?.currentTrack ?? trackRef.current,
        queue: overrides?.queue ?? queueRef.current,
        currentIndex: overrides?.currentIndex ?? indexRef.current,
        isPlaying: overrides?.isPlaying ?? isPlayingRef.current,
        currentTime: overrides?.currentTime ?? currentTime,
        source: typeof window !== 'undefined' ? window.location.pathname : '',
      });
    },
    [currentTime],
  );

  // 广播当前播放事件
  const broadcast = useCallback(
    (type: 'play' | 'pause' | 'seek' | 'track' | 'close', extra?: Record<string, unknown>) => {
      postPlayerMessage(channelRef.current, {
        type,
        trackId: trackRef.current?.trackId,
        currentTime: currentTime,
        isPlaying: isPlayingRef.current,
        ...extra,
      });
    },
    [currentTime],
  );

  /** 解析封面 URL */
  const resolveTrackArtwork = useCallback(
    (track: PlayerTrack): PlayerTrack => {
      if (!resolveArtwork || !track.artworkUrl100) return track;
      return { ...track, artworkUrl100: resolveArtwork(track.artworkUrl100) };
    },
    [resolveArtwork],
  );

  // 内部：加载并播放指定曲目
  const loadTrack = useCallback(
    async (track: PlayerTrack, autoPlay: boolean) => {
      track = resolveTrackArtwork(track);
      if (!track.previewUrl) {
        onError?.('歌曲预览链接缺失');
        return;
      }

      // 清理旧音频
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }

      trackRef.current = track;
      setCurrentTrack(track);
      setIsVisible(true);

      const audio = new Audio(track.previewUrl);
      audioRef.current = audio;

      // 播放前尝试恢复进度（仅当同一曲目时）
      const saved = readPlayerState();
      if (
        saved.currentTrack?.trackId === track.trackId &&
        saved.currentTime > 0 &&
        saved.currentTime < (saved.currentTrack.duration || 30) - 1
      ) {
        audio.currentTime = saved.currentTime;
      }

      const updateProgress = () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
          setCurrentTime(audio.currentTime);
          setDuration(audio.duration);
        }
      };

      const handleEnded = () => {
        // 自动播放下一首
        const idx = indexRef.current;
        const list = queueRef.current;
        if (idx >= 0 && idx < list.length - 1) {
          const next = list[idx + 1];
          if (next) {
            indexRef.current = idx + 1;
            loadTrack(next, true);
            persistState({ currentTrack: next, currentIndex: idx + 1 });
            broadcast('track');
          }
        } else {
          setIsPlaying(false);
          persistState({ isPlaying: false });
          broadcast('pause');
        }
      };

      const handleError = () => {
        setIsPlaying(false);
        onError?.('音频加载失败，链接可能已过期');
        persistState({ isPlaying: false });
        broadcast('pause');
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      if (autoPlay) {
        try {
          await audio.play();
          setIsPlaying(true);
          persistState({ isPlaying: true });
          broadcast('play');
        } catch {
          // 自动播放被浏览器阻止，保持暂停状态等待用户点击
          setIsPlaying(false);
          persistState({ isPlaying: false });
          broadcast('pause');
        }
      } else {
        setIsPlaying(false);
      }
    },
    [onError, persistState, broadcast],
  );

  // 公开 API：播放指定曲目
  const playTrack = useCallback(
    (track: PlayerTrack, queue: PlayerTrack[], index: number) => {
      queueRef.current = queue;
      indexRef.current = index;
      persistState({ currentTrack: track, queue, currentIndex: index, isPlaying: true });
      loadTrack(track, true);
      broadcast('track');
    },
    [loadTrack, persistState, broadcast],
  );

  // 公开 API：通过索引播放
  const playByIndex = useCallback(
    (index: number) => {
      const list = queueRef.current;
      const track = list[index];
      if (!track) return;
      indexRef.current = index;
      persistState({ currentTrack: track, currentIndex: index, isPlaying: true });
      loadTrack(track, true);
      broadcast('track');
    },
    [loadTrack, persistState, broadcast],
  );

  // 公开 API：切换播放/暂停
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      // 没有音频但有持久化状态时尝试恢复
      const saved = readPlayerState();
      if (saved.currentTrack) {
        queueRef.current = saved.queue;
        indexRef.current = saved.currentIndex;
        loadTrack(saved.currentTrack, true);
      }
      return;
    }
    if (isPlayingRef.current) {
      audio.pause();
      setIsPlaying(false);
      persistState({ isPlaying: false });
      broadcast('pause');
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        persistState({ isPlaying: true });
        broadcast('play');
      }).catch(() => {});
    }
  }, [loadTrack, persistState, broadcast]);

  // 公开 API：下一首
  const playNext = useCallback(() => {
    const idx = indexRef.current;
    const list = queueRef.current;
    if (idx < 0 || idx >= list.length - 1) {
      setIsPlaying(false);
      persistState({ isPlaying: false });
      broadcast('pause');
      return;
    }
    playByIndex(idx + 1);
  }, [playByIndex, persistState, broadcast]);

  // 公开 API：上一首
  const playPrev = useCallback(() => {
    const idx = indexRef.current;
    if (idx <= 0) return;
    playByIndex(idx - 1);
  }, [playByIndex]);

  // 公开 API：跳转
  const seek = useCallback(
    (ratio: number) => {
      const audio = audioRef.current;
      if (!audio || !audio.duration) return;
      const nextTime = Math.max(0, Math.min(1, ratio)) * audio.duration;
      audio.currentTime = nextTime;
      setCurrentTime(nextTime);
      setProgress(ratio * 100);
      persistState({ currentTime: nextTime });
      broadcast('seek', { currentTime: nextTime });
    },
    [persistState, broadcast],
  );

  // 公开 API：关闭播放器
  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    trackRef.current = null;
    queueRef.current = [];
    indexRef.current = -1;
    setCurrentTrack(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setIsVisible(false);
    clearPlayerState();
    broadcast('close');
  }, [broadcast]);

  // 初始化：从 localStorage 恢复 + 建立 BroadcastChannel
  useEffect(() => {
    channelRef.current = createPlayerChannel();

    const saved = readPlayerState();
    if (saved.currentTrack && saved.currentTrack.previewUrl) {
      queueRef.current = saved.queue;
      indexRef.current = saved.currentIndex;
      // 如果之前是播放状态，尝试自动继续；否则仅加载
      loadTrack(resolveTrackArtwork(saved.currentTrack), saved.isPlaying);
    }

    const unsubscribe = subscribePlayerMessages(channelRef.current, (msg) => {
      // 避免自己广播导致循环；简单通过时间戳判断是否外部消息
      if (msg.type === 'close') {
        closePlayer();
        return;
      }
      // 仅当当前页面没有活跃播放或曲目不一致时，才同步状态（避免多标签同时发声）
      if (
        msg.trackId &&
        (!trackRef.current || trackRef.current.trackId !== msg.trackId)
      ) {
        const latest = readPlayerState();
        if (latest.currentTrack) {
          queueRef.current = latest.queue;
          indexRef.current = latest.currentIndex;
          loadTrack(latest.currentTrack, latest.isPlaying);
        }
      }
    });

    return () => {
      unsubscribe();
      if (channelRef.current) {
        try {
          channelRef.current.close();
        } catch {
          // noop
        }
      }
    };
  }, [loadTrack, closePlayer]);

  // 页面卸载前保存进度
  useEffect(() => {
    const onBeforeUnload = () => {
      persistState();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [persistState]);

  // 定期保存进度（每 3 秒）
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPlayingRef.current && audioRef.current) {
        persistState({ currentTime: audioRef.current.currentTime });
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [persistState]);

  // 清理：组件卸载时暂停（不销毁持久化状态）
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    currentTimeStr: fmtTime(currentTime),
    totalTimeStr: fmtTime(duration || currentTrack?.duration || 0),
    isVisible,
    playTrack,
    playByIndex,
    togglePlay,
    playNext,
    playPrev,
    seek,
    closePlayer,
  };
}
