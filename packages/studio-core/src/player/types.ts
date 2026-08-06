/**
 * Layer 8: Player — 跨应用全局音频播放器类型
 *
 * 轻量级 Track 定义，可在 Jack Wave / Jack Pose / Jack Tan / Studio
 * 等独立应用之间共享，不依赖各应用的 songLibrary。
 */

/** 跨应用共享的播放曲目（仅保留播放与展示所需的最小字段） */
export interface PlayerTrack {
  /** iTunes trackId 或任意唯一标识 */
  trackId: string;
  /** 歌曲标题 */
  title: string;
  /** 艺人 */
  artist: string;
  /** 30 秒预览 URL */
  previewUrl: string;
  /** Apple Music / 歌曲页面 URL */
  trackViewUrl: string;
  /** 封面图 URL（建议由调用方预解析为绝对地址） */
  artworkUrl100: string;
  /** 时长（秒），可选 */
  duration?: number;
}

/** 持久化到 localStorage 的播放器状态 */
export interface PersistedPlayerState {
  /** 当前播放曲目 */
  currentTrack: PlayerTrack | null;
  /** 当前播放队列 */
  queue: PlayerTrack[];
  /** 当前曲目在队列中的索引 */
  currentIndex: number;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 当前播放进度（秒） */
  currentTime: number;
  /** 状态更新时间戳 */
  updatedAt: number;
  /** 来源应用（调试用） */
  source?: string;
}

/** 播放器 UI 与逻辑对外暴露的 State */
export interface GlobalPlayerState {
  currentTrack: PlayerTrack | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  currentTimeStr: string;
  totalTimeStr: string;
  isVisible: boolean;
}

/** 播放器对外暴露的操作 */
export interface GlobalPlayerActions {
  /** 播放指定曲目（在指定队列上下文中） */
  playTrack: (track: PlayerTrack, queue: PlayerTrack[], index: number) => void;
  /** 通过索引播放队列中的曲目 */
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

export type GlobalAudioPlayerReturn = GlobalPlayerState & GlobalPlayerActions;

/** 跨页面广播消息类型 */
export interface PlayerBroadcastMessage {
  type: 'play' | 'pause' | 'seek' | 'track' | 'close' | 'sync';
  trackId?: string;
  currentTime?: number;
  isPlaying?: boolean;
  state?: PersistedPlayerState;
}
