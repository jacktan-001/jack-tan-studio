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
 *
 * KV 动态数据加载使用 React 19 的 use() + Suspense：
 * - PublicDataProvider 在 Suspense 边界内通过 use(promise) 挂起并读取数据
 * - fetch Promise 缓存在模块级 Map 中，避免每次渲染重复请求
 * - 加载失败时 Promise 内部 catch 并 resolve 为 null，静默回退到静态数据
 * - 额外的 ErrorBoundary 作为子树渲染异常的防御性兜底
 */

import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  use,
  type ReactNode,
} from 'react';
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
import {
  GlobalAudioPlayer,
  useGlobalAudioPlayer,
  toPlayerTrack,
  type PlayerTrack,
} from '@jack-tan/studio-core';
import { StudioBar } from '@jack-tan/studio-core';
import { Hero } from './components/Hero';
import RippleField from './components/RippleField';
import { MonthlySection, type MonthlySectionRef } from './components/MonthlySection';
import { MoodGrid } from './components/MoodGrid';
import { MoodModal } from './components/MoodModal';
import { SubmitForm } from './components/SubmitForm';
import { Footer } from './components/Footer';
import { Toast, useToast } from './components/Toast';
import { artworkSrc } from './utils';

/** /api/public-data 返回的 KV 公开数据结构 */
interface PublicData {
  moodPlaylists?: MoodPlaylist[];
  monthlyShares?: MonthlyShare[];
  allTags?: string[];
}

/** 合并 KV 动态数据与静态数据后的最终结构 */
interface ResolvedData {
  moodPlaylists: MoodPlaylist[];
  monthlyShares: MonthlyShare[];
  allTags: string[];
}

/** 静态回退数据（KV 加载失败或渲染异常时使用） */
const staticResolvedData: ResolvedData = {
  moodPlaylists: normalizedMoodPlaylists,
  monthlyShares: normalizedMonthlyShares,
  allTags: staticAllTags,
};

/**
 * 模块级缓存：保存 /api/public-data 的 fetch Promise（同一 key 只创建一次）。
 * Promise 内部 catch 错误并 resolve 为 null —— 这样 use() 永远不会因网络错误抛出，
 * 静默回退到静态数据，同时避免「缓存的 rejected Promise 在后续渲染中反复抛错」。
 */
const publicDataPromiseCache = new Map<string, Promise<PublicData | null>>();

function getPublicDataPromise(): Promise<PublicData | null> {
  const key = 'public-data';
  let promise = publicDataPromiseCache.get(key);
  if (!promise) {
    promise = fetch(import.meta.env.BASE_URL + 'api/public-data')
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json() as Promise<PublicData>;
      })
      .catch((err: Error) => {
        // KV 加载失败时静默回退到静态数据，仅在控制台记录
        console.warn('动态数据加载失败，使用静态数据:', err.message);
        return null;
      });
    publicDataPromiseCache.set(key, promise);
  }
  return promise;
}

/**
 * 合并 KV 动态数据与静态数据（逻辑与原 useEffect 中一致）：
 * - moodPlaylists：KV 优先
 * - monthlyShares：KV 优先，KV 缺失的月份从静态数据补充
 * - allTags：KV 优先，缺失时回退静态
 */
function mergePublicData(raw: PublicData | null): ResolvedData {
  if (raw && raw.moodPlaylists) {
    const moodPlaylists = normalizePlaylists(raw.moodPlaylists as MoodPlaylist[]);

    const kvMonthly = normalizePlaylists((raw.monthlyShares || []) as MonthlyShare[]);
    const kvMonths = kvMonthly.map((p) => p.month);
    for (const p of normalizedMonthlyShares) {
      if (p.month && !kvMonths.includes(p.month)) {
        kvMonthly.push(p);
      }
    }
    const monthlyShares = sortMonthly(kvMonthly);

    const allTags = raw.allTags ?? staticAllTags;

    return { moodPlaylists, monthlyShares, allTags };
  }
  return staticResolvedData;
}

/** 数据加载 Suspense 兜底：KV 数据加载期间展示的轻量骨架 */
function DataFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '120px 24px',
        textAlign: 'center',
        color: 'var(--gray-400)',
        fontSize: '14px',
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={{ margin: '0 auto 12px', display: 'block' }}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          strokeWidth="3"
          style={{ stroke: 'var(--gray-200)' }}
        />
        <path
          d="M12 3a9 9 0 0 1 9 9"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ stroke: 'var(--teal)' }}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
      正在加载歌单数据…
    </div>
  );
}

/**
 * PublicDataProvider：使用 React 19 的 use() 读取缓存的 fetch Promise。
 * 在 Suspense 边界内挂起，数据就绪后通过 render-prop 把合并后的数据传给子树。
 */
function PublicDataProvider({
  children,
}: {
  children: (data: ResolvedData) => ReactNode;
}) {
  const raw = use(getPublicDataPromise());
  const data = useMemo(() => mergePublicData(raw), [raw]);
  return <>{children(data)}</>;
}

/**
 * 错误边界：作为 use() 的防御性兜底。
 * 正常情况下 fetch Promise 已在内部 catch（resolve 为 null → 静态数据），
 * 此边界仅捕获子树渲染过程中可能出现的意外异常，回退到静态数据子树。
 */
class PublicDataErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state: { hasError: boolean } = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('动态数据渲染异常，使用静态数据:', error.message);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default function App() {
  // === Toast 通知 ===
  const { message, show, showToast, hideToast } = useToast();

  // === 强制刷新（URL 刷新后需要重新渲染） ===
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // === iTunes 预览 URL 后台刷新（jack-wave 专属） ===
  useAudioPlayer(songLibrary, showToast, forceUpdate);

  // === 跨应用全局音频播放器 ===
  const player = useGlobalAudioPlayer({
    onError: showToast,
    resolveArtwork: artworkSrc,
  });

  // === 心情歌单弹窗 ===
  const [selectedMoodId, setSelectedMoodId] = useState<number | null>(null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);

  // === 本月推荐弹窗 ===
  const [selectedMonthlyId, setSelectedMonthlyId] = useState<number | null>(null);
  const [isMonthlyModalOpen, setIsMonthlyModalOpen] = useState(false);

  // === MonthlySection ref（用于"播放本月歌单"） ===
  const monthlyRef = useRef<MonthlySectionRef>(null);

  // === 键盘快捷键 ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 输入框中不触发快捷键
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space' && player.currentTrack) {
        e.preventDefault();
        player.togglePlay();
      } else if (e.code === 'ArrowRight' && player.currentTrack) {
        player.playNext();
      } else if (e.code === 'ArrowLeft' && player.currentTrack) {
        player.playPrev();
      } else if (e.code === 'Escape') {
        setIsMoodModalOpen(false);
        setIsMonthlyModalOpen(false);
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

  /** 播放歌曲：转换为跨应用 PlayerTrack 后交给全局播放器 */
  const handlePlay = useCallback(
    (song: Song, songList: Song[], index: number) => {
      const queue: PlayerTrack[] = songList.map((s) => toPlayerTrack(s, artworkSrc));
      player.playTrack(toPlayerTrack(song, artworkSrc), queue, index);
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

  /** 打开本月推荐弹窗 */
  const handleOpenMonthly = useCallback((id: number) => {
    setSelectedMonthlyId(id);
    setIsMonthlyModalOpen(true);
  }, []);

  /** 关闭本月推荐弹窗 */
  const handleCloseMonthly = useCallback(() => {
    setIsMonthlyModalOpen(false);
  }, []);

  /**
   * 渲染依赖 KV 数据的子树（月度歌单 / 心情歌单 / 推荐表单 / 心情弹窗）。
   * 抽成函数便于复用：成功时用 KV 合并数据渲染、错误边界兜底时用静态数据渲染同一份结构。
   */
  const renderDataSections = (data: ResolvedData) => {
    const selectedMood = selectedMoodId
      ? data.moodPlaylists.find((p) => p.id === selectedMoodId) ?? null
      : null;
    const selectedMonthly = selectedMonthlyId
      ? data.monthlyShares.find((p) => p.id === selectedMonthlyId) ?? null
      : null;

    return (
      <>
        {/* 月度歌单 */}
        <MonthlySection
          ref={monthlyRef}
          monthlyShares={data.monthlyShares}
          currentSong={player.currentTrack}
          onPlay={handlePlay}
          onOpenMonthly={handleOpenMonthly}
        />

        {/* 心情歌单 */}
        <MoodGrid moodPlaylists={data.moodPlaylists} onOpenMood={handleOpenMood} />

        {/* 推荐表单 */}
        <SubmitForm allTags={data.allTags} onToast={showToast} />

        {/* 心情歌单弹窗 */}
        <MoodModal
          playlist={selectedMood}
          show={isMoodModalOpen}
          onClose={handleCloseMood}
          currentSong={player.currentTrack}
          onPlay={handlePlay}
        />

        {/* 本月推荐弹窗（复用 MoodModal，数据结构一致） */}
        <MoodModal
          playlist={selectedMonthly}
          show={isMonthlyModalOpen}
          onClose={handleCloseMonthly}
          currentSong={player.currentTrack}
          onPlay={handlePlay}
        />
      </>
    );
  };

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

      {/* StudioBar 跨项目共享导航栏（fixed 定位，下方内容由 index.css 预留 64px 顶部间距） */}
      <StudioBar current="wave" />

      {/* ============ 全局背景动效层（fixed, z-index:0，置于内容之下） ============ */}
      {/* 波纹纹理 — SVG 水波 */}
      <div className="wave-ripple-texture" aria-hidden="true" />
      {/* 液态光斑 — 流动冷色光斑 */}
      <div className="wave-liquid-blobs" aria-hidden="true">
        <div className="wave-liquid-blob" />
        <div className="wave-liquid-blob" />
      </div>
      {/* 光晕呼吸 — 角落 radial-gradient 脉冲 */}
      <div className="wave-halo-pulse" aria-hidden="true">
        <div className="wave-halo-corner" />
        <div className="wave-halo-corner" />
      </div>
      {/* 音频频条 — 音乐相关均衡器背景 */}
      <div className="wave-eq-bars" aria-hidden="true">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="wave-eq-bar" />
        ))}
      </div>
      {/* 点击水波纹扩散 */}
      <RippleField />

      {/* ============ 内容层（relative z-1，置于背景之上） ============ */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero 区域 */}
        <Hero onPlayCurrentMonth={handlePlayCurrentMonth} />

        {/* 依赖 KV 动态数据的区域：use() + Suspense，加载失败静默回退静态数据 */}
        <Suspense fallback={<DataFallback />}>
          <PublicDataErrorBoundary fallback={renderDataSections(staticResolvedData)}>
            <PublicDataProvider>{renderDataSections}</PublicDataProvider>
          </PublicDataErrorBoundary>
        </Suspense>

        {/* 页脚 */}
        <Footer />
      </div>

      {/* 跨应用全局底部播放器 */}
      <GlobalAudioPlayer player={player} resolveArtwork={artworkSrc} />

      {/* Toast 通知 */}
      <Toast message={message} show={show} onHide={hideToast} />
    </>
  );
}
