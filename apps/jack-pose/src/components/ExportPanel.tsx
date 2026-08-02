/**
 * 导出操作面板：
 * - 朋友圈：导出完整卡片 PNG / JSON 工程 / 复制文案
 * - 小红书：JSON 工程 / 复制文案
 */
import { useState } from 'react'
import { useProjectStore } from '../stores/projectStore'
import {
  exportWechatCard,
  exportProjectArchive,
  exportXhsThumbnailStrip,
  copyCaption,
} from '../lib/importExport'
import { PLATFORM_LABELS } from '../types'
import type { Platform } from '../types'
import { toast } from 'sonner'

interface Props {
  projectId: string
  platform: Platform
}

export function ExportPanel({ projectId, platform }: Props) {
  const project = useProjectStore((s) => s.getProject(projectId))
  const [busy, setBusy] = useState<string | null>(null)

  if (!project) return null

  const content = project.platforms[platform]
  const hasCaption = !!content.caption || (platform === 'xiaohongshu' && !!content.title)

  const run = async (key: string, fn: () => Promise<void>, okMsg: string) => {
    setBusy(key)
    try {
      await fn()
      toast.success(okMsg)
    } catch (e) {
      toast.error((e as Error).message || '操作失败')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="bg-surface-2 rounded-2xl p-4 shadow-sm border border-outline-light space-y-2.5">
      <p className="text-xs text-secondary px-1">
        {PLATFORM_LABELS[platform]} 导出
      </p>

      {platform === 'wechat' && (
        <button
          onClick={() => run('card', () => exportWechatCard(project), '朋友圈卡片已保存')}
          disabled={busy !== null}
          className="w-full py-3 rounded-xl bg-wechat text-white text-sm font-medium disabled:opacity-40 transition hover:bg-[#06ae56] active:scale-[0.98]"
        >
          {busy === 'card' ? '生成中…' : '保存朋友圈卡片'}
        </button>
      )}

      {platform === 'xiaohongshu' && content.imageIds.length > 0 && (
        <button
          onClick={() => run('xhs-thumb', () => exportXhsThumbnailStrip(project, content.imageIds, { title: content.title, caption: content.caption }), '小红书缩略图排序已保存')}
          disabled={busy !== null}
          className="w-full py-3 rounded-xl bg-xhs text-white text-sm font-medium disabled:opacity-40 transition hover:bg-[#e01f3b] active:scale-[0.98]"
        >
          {busy === 'xhs-thumb' ? '生成中…' : '保存小红书缩略图排序'}
        </button>
      )}

      <button
        onClick={() => run('json', () => exportProjectArchive(project), '工程文件已下载')}
        disabled={busy !== null}
        className="w-full py-3 rounded-xl bg-hover text-primary text-sm font-medium disabled:opacity-40 transition hover:bg-hover active:scale-[0.98]"
      >
        {busy === 'json' ? '打包中…' : '导出工程文件'}
      </button>

      <button
        onClick={() =>
          run('copy', () => copyCaption(project, platform), '文案已复制')
        }
        disabled={!hasCaption || busy !== null}
        className="w-full py-3 rounded-xl bg-hover text-primary text-sm font-medium disabled:opacity-40 transition hover:bg-hover active:scale-[0.98]"
      >
        {busy === 'copy' ? '复制中…' : '复制文案'}
      </button>

      <p className="text-[11px] text-secondary px-1 pt-1">
        导出工程文件为JSON格式，包含全部图片，可导入并二次编辑
      </p>
    </section>
  )
}
