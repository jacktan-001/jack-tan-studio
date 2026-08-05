/**
 * 工作台页：上传 + 预览即编辑 + 导出，单页上下排布，移动端竖屏
 */
import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import { PhotoUploader } from '../components/PhotoUploader'
import { PlatformPreview } from '../components/PlatformPreview'
import { ExportPanel } from '../components/ExportPanel'
import { WeChatLogo, XiaohongshuLogo } from '../components/Logos'
import { PLATFORMS, PLATFORM_LABELS } from '../types'
import type { Platform } from '../types'

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const project = useProjectStore((s) => (id ? s.getProject(id) : undefined))
  const [platform, setPlatform] = useState<Platform>('wechat')

  if (!project) {
    return (
      <div className="min-h-screen bg-hover text-primary flex flex-col items-center justify-center gap-3">
        <p className="text-secondary">项目不存在</p>
        <Link to="/" className="text-accent text-sm">
          返回列表
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-hover text-primary">
      <header className="sticky top-[calc(64px+var(--safe-top))] z-10 bg-surface-2/80 backdrop-blur-xl border-b border-outline-strong">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-hover text-secondary hover:bg-hover transition"
            aria-label="返回"
          >
            ←
          </button>
          <h1 className="flex-1 font-semibold truncate">{project.title}</h1>
          <span className="text-xs text-secondary">
            {project.photos.length} 张
          </span>
        </div>
        <div className="max-w-lg mx-auto px-4 sm:px-6 pb-3">
          <div className="flex rounded-xl bg-surface-2 border border-outline-light p-1">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-1.5 ${
                  platform === p
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-secondary hover:bg-hover'
                }`}
              >
                {p === 'wechat' ? (
                  <WeChatLogo className="w-4 h-4" />
                ) : (
                  <XiaohongshuLogo className="w-4 h-4" />
                )}
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-5 space-y-5 pb-28">
        <PhotoUploader projectId={project.id} platform={platform} />
        <PlatformPreview projectId={project.id} platform={platform} />
        <ExportPanel projectId={project.id} platform={platform} />
      </main>
    </div>
  )
}
