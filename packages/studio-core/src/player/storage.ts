/**
 * Layer 8: Player — 跨应用播放器状态持久化与广播同步
 *
 * 使用 localStorage 保存当前播放状态，页面跳转后其他应用可读取并恢复。
 * 使用 BroadcastChannel 在多个同源标签页之间实时同步播放事件。
 */

import type { PersistedPlayerState, PlayerBroadcastMessage } from './types';

/** localStorage key */
export const PLAYER_STATE_KEY = 'jack-tan-global-player';

/** BroadcastChannel name */
const CHANNEL_NAME = 'jack-tan-player-sync';

/** 默认空状态 */
export const DEFAULT_STATE: PersistedPlayerState = {
  currentTrack: null,
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  currentTime: 0,
  updatedAt: 0,
};

/** 安全读取持久化状态 */
export function readPlayerState(): PersistedPlayerState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(PLAYER_STATE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as PersistedPlayerState;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      // 超过 7 天未更新视为过期，避免播放过期链接
      ...(parsed.updatedAt && Date.now() - parsed.updatedAt > 7 * 24 * 60 * 60 * 1000
        ? { currentTrack: null, queue: [], currentIndex: -1, isPlaying: false }
        : {}),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

/** 安全写入持久化状态 */
export function writePlayerState(state: Partial<PersistedPlayerState>): PersistedPlayerState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const prev = readPlayerState();
    const next: PersistedPlayerState = {
      ...prev,
      ...state,
      updatedAt: Date.now(),
    };
    localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return DEFAULT_STATE;
  }
}

/** 清空持久化状态 */
export function clearPlayerState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PLAYER_STATE_KEY);
  } catch {
    // noop
  }
}

/** 创建 BroadcastChannel（不支持的浏览器回退到 null） */
export function createPlayerChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined') return null;
  try {
    return new BroadcastChannel(CHANNEL_NAME);
  } catch {
    return null;
  }
}

/** 发送广播消息 */
export function postPlayerMessage(
  channel: BroadcastChannel | null,
  message: PlayerBroadcastMessage,
): void {
  if (!channel) return;
  try {
    channel.postMessage(message);
  } catch {
    // noop
  }
}

/** 订阅广播消息 */
export function subscribePlayerMessages(
  channel: BroadcastChannel | null,
  handler: (message: PlayerBroadcastMessage) => void,
): () => void {
  if (!channel) return () => {};
  const cb = (e: MessageEvent<PlayerBroadcastMessage>) => {
    try {
      handler(e.data);
    } catch {
      // noop
    }
  };
  channel.addEventListener('message', cb);
  return () => channel.removeEventListener('message', cb);
}
