/**
 * App — Jack Wave 主应用组件
 *
 * 从原 app.js 的 IIFE 迁移，包含：
 * - 数据初始化（静态数据 + KV 动态数据合并）
 * - 音频播放器管理（useAudioPlayer）
 * - Toast 通知
 * - 心情歌单弹窗
 * - 键盘快捷键（Space/ArrowLeft/ArrowRight/Escape）
 * - PWA Service Worker 注册
 * - iTunes URL 后台刷新
 */

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { MoodPlaylist, MonthlyShare, Song } from './types';
import {
  songLibrary,
  normalizedMoodPlaylists,
  normalizedMonthlyShares,
  allTags as staticAllTags,
  normalizePlaylists,
  sortMonthly,
} from './data/musicData';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MonthlySection, type MonthlySectionRef } from './components/MonthlySection';
import { MoodGrid } from './components/MoodGrid';
import { MoodModal } from './components/MoodModal';
import { SubmitForm } from './components/SubmitForm';
import { AudioPlayer } from './components/AudioPlayer';
import { Footer } from './components/Footer';
import { Toast, useToast } from './components/Toast';

export default function App() {
  // === 数据状态 ===
  const [moodPlaylists, setMoodPlaylists] = useState<MoodPlaylist[]>(normalizedMoodPlaylists);
  const [monthlyShares, setMonthlyShares] = useState<MonthlyShare[]>(normalizedMonthlyShares);
  const [allTags, setAllTags] = useState<string[]>(staticAllTags);

  // === Toast 通知 ===
  const { message, show, showToast, hideToast } = useToast();

  // === 强制刷新（URL 刷新后需要重新渲染） ===
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // === 音频播放器 ===
  const player = useAudioPlayer(songLibrary, showToast, forceUpdate);

  // === 心情歌单弹窗 ===
  const [selectedMoodId, setSelectedMoodId] = useState<number | null>(null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);

  // === MonthlySection ref（用于"播放本月歌单"） ===
  const monthlyRef = useRef<MonthlySectionRef>(null);

  // === 加载 KV 动态数据 ===
  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'api/public-data')
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((d) => {
        if (d && d.moodPlaylists) {
          setMoodPlaylists(normalizePlaylists(d.moodPlaylists as MoodPlaylist[]));

          // 合并 KV 月度数据和静态数据：KV 中缺少的月份从静态数据补充
          const kvMonthly = normalizePlaylists((d.monthlyShares || []) as MonthlyShare[]);
          const staticMonthly = normalizedMonthlyShares;
          const kvMonths = kvMonthly.map((p) => p.month);
          for (const p of staticMonthly) {
            if (p.month && !kvMonths.includes(p.month)) {
              kvMonthly.push(p);
            }
          }
          setMonthlyShares(sortMonthly(kvMonthly));

          if (d.allTags) setAllTags(d.allTags);
        }
      })
      .catch((err) => {
        // KV 加载失败时静默回退到静态数据，仅在控制台记录
        console.warn('动态数据加载失败，使用静态数据:', err.message);
      });
  }, []);

  // === 键盘快捷键 ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 输入框中不触发快捷键
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space' && player.currentSong) {
        e.preventDefault();
        player.togglePlay();
      } else if (e.code === 'ArrowRight' && player.currentSong) {
        player.playNext();
      } else if (e.code === 'ArrowLeft' && player.currentSong) {
        player.playPrev();
      } else if (e.code === 'Escape') {
        setIsMoodModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [player]);

  // === PWA Service Worker 注册 ===
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(import.meta.env.BASE_URL + 'sw.js')
        .then((reg) => {
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  location.reload();
                }
              });
            }
          });
        })
        .catch(() => {
          // SW 注册失败静默处理
        });
    }
  }, []);

  // === 事件处理 ===

  /** 点击"播放本月歌单" */
  const handlePlayCurrentMonth = useCallback(() => {
    monthlyRef.current?.playCurrentMonth();
  }, []);

  /** 播放歌曲 */
  const handlePlay = useCallback(
    (song: Song, songList: Song[], index: number) => {
      player.playSong(song, songList, index);
    },
    [player],
  );

  /** 打开心情歌单弹窗 */
  const handleOpenMood = useCallback((id: number) => {
    setSelectedMoodId(id);
    setIsMoodModalOpen(true);
  }, []);

  /** 关闭心情歌单弹窗 */
  const handleCloseMood = useCallback(() => {
    setIsMoodModalOpen(false);
  }, []);

  /** 选中的心情歌单 */
  const selectedMood = selectedMoodId
    ? moodPlaylists.find((p) => p.id === selectedMoodId) ?? null
    : null;

  return (
    <>
      {/* 跳到主要内容 */}
      <a
        href="#monthly"
        className="skip-link"
        style={{
          position: 'absolute',
          top: '-40px',
          left: 0,
          background: 'var(--teal)',
          color: '#fff',
          padding: '8px 16px',
          zIndex: 300,
          borderRadius: '0 0 8px 0',
          fontSize: '14px',
        }}
      >
        跳到主要内容
      </a>

      {/* 导航栏 */}
      <Navbar />

      {/* Hero 区域 */}
      <Hero onPlayCurrentMonth={handlePlayCurrentMonth} />

      {/* 月度歌单 */}
      <MonthlySection
        ref={monthlyRef}
        monthlyShares={monthlyShares}
        currentSong={player.currentSong}
        onPlay={handlePlay}
      />

      {/* 心情歌单 */}
      <MoodGrid moodPlaylists={moodPlaylists} onOpenMood={handleOpenMood} />

      {/* 推荐表单 */}
      <SubmitForm allTags={allTags} onToast={showToast} />

      {/* 页脚 */}
      <Footer />

      {/* 底部播放器 */}
      <AudioPlayer player={player} />

      {/* 心情歌单弹窗 */}
      <MoodModal
        playlist={selectedMood}
        show={isMoodModalOpen}
        onClose={handleCloseMood}
        currentSong={player.currentSong}
        onPlay={handlePlay}
      />

      {/* Toast 通知 */}
      <Toast message={message} show={show} onHide={hideToast} />
    </>
  );
}
