/**
 * 主页：Apple 风格大标题 + 三个一级入口（彩色图标）
 * - 新建排版项目
 * - 拼长图（直接进入拼图模式）
 * - 导入工程文件
 * 下方列出已有项目。自适应移动端和桌面端。
 * 卡片使用 useTilt 实现 ±6° 3D 透视倾斜跟随光标，spring 弹性缩放入场。
 */
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../stores/projectStore'
import { importProjectArchive } from '../lib/importExport'
import { toast } from 'sonner'
import { useTilt } from '../hooks/useTilt'
import { assetUrl } from '../assetBase'

export function ProjectListPage() {
  const navigate = useNavigate()
  const projects = useProjectStore((s) => s.projects)
  const createProject = useProjectStore((s) => s.createProject)
  const deleteProject = useProjectStore((s) => s.deleteProject)
  const renameProject = useProjectStore((s) => s.renameProject)
  const [title, setTitle] = useState('')
  const [showInput, setShowInput] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)

  // 3D tilt refs for entry cards
  const tiltRef1 = useRef<HTMLButtonElement>(null)
  const tiltRef2 = useRef<HTMLButtonElement>(null)
  const tiltRef3 = useRef<HTMLButtonElement>(null)
  useTilt(tiltRef1)
  useTilt(tiltRef2)
  useTilt(tiltRef3)

  const handleCreate = () => {
    const id = createProject(title)
    setTitle('')
    setShowInput(false)
    navigate(`/p/${id}`)
  }

  const handleImport = async (file: File) => {
    try {
      const newId = await importProjectArchive(file)
      toast.success('工程文件已导入')
      navigate(`/p/${newId}`)
    } catch (e) {
      toast.error((e as Error).message || '导入失败')
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`删除「${title}」及全部图片？此操作不可恢复`)) {
      await deleteProject(id)
      toast.success('已删除')
    }
  }

  const handleRename = (id: string, currentTitle: string) => {
    const newTitle = prompt('输入新的项目标题', currentTitle)
    if (newTitle !== null) {
      renameProject(id, newTitle.trim())
      toast.success('已重命名')
    }
  }

  return (
    <div className="min-h-screen bg-bg text-primary">
      <main
        className="w-full max-w-lg mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16"
        style={{ marginLeft: 'auto', marginRight: 'auto' }}
      >
        {/* Hero */}
        <div className="text-center mb-12 sm:mb-14 pose-pop-in">
          <img
            src={assetUrl('hero-sm.jpg')}
            alt="Jack Pose"
            width={208}
            height={208}
            loading="eager"
            fetchPriority="high"
            className="w-44 h-44 sm:w-52 sm:h-52 mx-auto mb-6 rounded-3xl shadow-lg shadow-black/10"
          />
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter mb-3 text-primary">
            Jack-<span style={{ color: 'var(--color-accent, #ec4899)' }}>Pose</span>
          </h1>
          <p className="text-lg text-tertiary font-medium">
            Photo Layout Tool · 社媒排版・长图导出
          </p>
        </div>

        {/* 三个一级入口 */}
        <div className="space-y-4 mb-16">
          <button
            ref={tiltRef1}
            onClick={() => setShowInput((v) => !v)}
            className={`pose-tilt-card pose-pop-in w-full group relative overflow-hidden rounded-2xl border p-5 text-left transition hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] ${
              showInput
                ? 'bg-accent-bg border-accent/40 text-accent ring-1 ring-accent/20'
                : 'bg-surface border-outline text-primary hover:border-accent/30 hover:bg-[#FFF8EE]'
            }`}
          >
            <div className="relative z-10 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${showInput ? 'bg-accent/10' : 'bg-gradient-to-br from-[#667eea] to-[#764ba2]'} transition`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill={showInput ? '#0071e3' : '#fff'} />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold">新建排版项目</p>
                <p className={`text-sm mt-0.5 ${showInput ? 'text-accent/70' : 'text-tertiary'}`}>
                  朋友圈 / 小红书双平台预览与文案
                </p>
              </div>
            </div>
          </button>

          {showInput && (
            <div className="flex gap-2 px-1">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="项目标题（可留空）"
                className="flex-1 px-4 py-3 rounded-xl bg-surface border border-outline text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              <button
                onClick={handleCreate}
                className="px-6 py-3 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover active:scale-[0.98] transition"
              >
                创建
              </button>
            </div>
          )}

          <button
            ref={tiltRef2}
            onClick={() => navigate('/puzzle')}
            className="pose-tilt-card pose-pop-in-delay-1 w-full group relative overflow-hidden rounded-2xl bg-surface border border-outline text-primary p-5 text-left transition hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] hover:border-accent/30 hover:bg-[#FFF8EE]"
          >
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#f093fb] to-[#f5576c]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#fff" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#fff" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#fff" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#fff" opacity=".6" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold">拼长图</p>
                <p className="text-sm text-tertiary mt-0.5">无需建项目，直接上传多张图片拼接</p>
              </div>
            </div>
          </button>

          <input
            ref={importRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleImport(f)
              if (importRef.current) importRef.current.value = ''
            }}
          />
          <button
            ref={tiltRef3}
            onClick={() => importRef.current?.click()}
            className="pose-tilt-card pose-pop-in-delay-2 w-full group relative overflow-hidden rounded-2xl bg-surface border border-outline text-primary p-5 text-left transition hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] hover:border-accent/30 hover:bg-[#FFF8EE]"
          >
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#4facfe] to-[#00f2fe]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 17V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V17" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold">导入工程文件</p>
                <p className="text-sm text-tertiary mt-0.5">恢复 JSON 工程，继续编辑</p>
              </div>
            </div>
          </button>
        </div>

        {/* 项目列表 */}
        <div>
          <h2 className="text-sm font-semibold text-tertiary uppercase tracking-wide mb-3 px-1">
            最近项目
          </h2>
          {projects.length === 0 ? (
            <div className="text-center py-12 text-tertiary bg-surface rounded-2xl border border-outline">
              <p className="text-sm">还没有项目</p>
              <p className="text-xs mt-1">从上方开始创建或导入</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="bg-surface rounded-2xl p-4 flex items-center justify-between shadow-sm border border-outline"
                >
                  <button
                    onClick={() => navigate(`/p/${p.id}`)}
                    className="flex-1 text-left"
                  >
                    <h3 className="font-medium truncate">{p.title || '未命名项目'}</h3>
                    <p className="text-xs text-tertiary mt-1">
                      {new Date(p.createdAt).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' · '}
                      {p.photos.length} 张图
                    </p>
                  </button>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleRename(p.id, p.title)}
                      className="text-tertiary hover:text-accent text-sm px-2 py-1 rounded-lg hover:bg-hover transition"
                    >
                      重命名
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.title)}
                      className="text-tertiary hover:text-[#ff3b30] text-sm px-2 py-1 rounded-lg hover:bg-[#FFF0EE] transition"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
