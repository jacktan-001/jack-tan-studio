/**
 * Jack Wave — TypeScript 类型定义
 * 从原 data.js 的数据结构提取
 */

/** 歌曲 — 对应 songLibrary 中的每个条目 */
export interface Song {
  title: string;
  artist: string;
  duration: string;
  /** iTunes 30 秒预览 URL（会过期，需定期刷新） */
  previewUrl: string;
  /** Apple Music 歌曲页面 URL */
  trackViewUrl: string;
  /** 100x100 封面图 URL */
  artworkUrl100: string;
  /** iTunes track ID（用作 songLibrary 的 key） */
  trackId: string;
}

/** 歌单基础结构 — 月度歌单和心情歌单的公共字段 */
export interface Playlist {
  id: number;
  title: string;
  author: string;
  desc: string;
  /** CSS 渐变（备用封面） */
  cover?: string;
  /** 封面图 URL */
  coverImage: string;
  /** trackId 数组（新结构）或完整 Song 对象数组（旧结构 / KV） */
  songs?: string[];
  /** 解析后的 Song 对象数组 */
  songList: Song[];
  tag: string;
  /** 作者头像 URL（可选） */
  avatarImage?: string;
}

/** 月度歌单 — 比基础歌单多 month 字段 */
export interface MonthlyShare extends Playlist {
  month: string;
}

/** 心情歌单（与 Playlist 相同，单独命名以语义化） */
export type MoodPlaylist = Playlist;

/** API 返回的公开数据结构 */
export interface AppData {
  songLibrary: Record<string, Song>;
  moodPlaylists: MoodPlaylist[];
  monthlyShares: MonthlyShare[];
  allTags: string[];
}

/** URL 缓存条目 — 用于 iTunes URL 刷新机制 */
export interface UrlCacheEntry {
  previewUrl: string;
  trackViewUrl: string;
  artworkUrl100: string;
}

/** URL 缓存 — 存储在 localStorage，24 小时 TTL */
export interface UrlCache {
  _ts: number;
  [trackId: string]: string | UrlCacheEntry | number;
}

/** 提交表单的数据载荷 */
export interface SubmitPayload {
  type: 'link' | 'manual' | 'screenshot';
  linkUrl: string;
  songList: string;
  playlistName: string;
  authorName: string;
  description: string;
  tags: string[];
  screenshotData?: string;
}
