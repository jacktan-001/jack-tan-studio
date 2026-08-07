import { useScrollSpy } from '../hooks/useScrollSpy'
import { assetUrl } from '../assetBase'

const NAV_ITEMS = [
  { id: 'about', label: '关于我', icon: 'M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z' },
  { id: 'experience', label: '工作经历', icon: 'M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM10 5h4v2h-4V5z' },
  { id: 'projects', label: '核心项目', icon: 'M20 6h-8l-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2z' },
  { id: 'works', label: '上线作品', icon: 'M21 3H3a2 2 0 00-2 2v12a2 2 0 002 2h7v2H8v2h8v-2h-2v-2h7a2 2 0 002-2V5a2 2 0 00-2-2zm0 14H3V5h18v12z' },
  { id: 'patents', label: '专利与荣誉', icon: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z' },
  { id: 'skills', label: '技能与教育', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
]

const SOCIAL_LINKS = [
  { href: 'mailto:jacktan2011@icloud.com', label: 'Email', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 2l-8 5-8-5v2l8 5 8-5V6z', fill: false },
  { href: 'https://www.linkedin.com/in/jacktan2011', label: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', fill: true },
  { href: 'https://www.instagram.com/jacktan2011', label: 'Instagram', icon: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z', fill: true },
  { href: 'https://www.xiaohongshu.com/user/profile/5d004945000000001002a18e', label: '小红书', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14h-9c-.28 0-.5-.22-.5-.5v-9c0-.28.22-.5.5-.5h2V5c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v2h2c.28 0 .5.22.5.5v9c0 .28-.22.5-.5.5zM9 10h6v6H9V10z', fill: true },
  { href: 'https://space.bilibili.com/97733003', label: 'Bilibili', icon: 'M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.659.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .68.124.92.373.25.249.373.551.373.907v4.267c0 .355-.124.657-.373.906-.24.249-.547.373-.92.373s-.68-.124-.92-.373c-.25-.249-.373-.551-.373-.906V12.48c0-.356.124-.659.373-.907.24-.249.547-.373.92-.373zm8 0c.373 0 .68.124.92.373.25.249.373.551.373.907v4.267c0 .355-.124.657-.373.906-.24.249-.547.373-.92.373s-.68-.124-.92-.373c-.25-.249-.373-.551-.373-.906V12.48c0-.356.124-.659.373-.907.24-.249.547-.373.92-.373z', fill: true },
]

// 模块级常量：避免每次渲染都创建新数组，导致 useScrollSpy 的 IntersectionObserver 反复重建（P1-5）
const SECTION_IDS = NAV_ITEMS.map((n) => n.id)

export default function Sidebar() {
  const activeId = useScrollSpy(SECTION_IDS)

  return (
    <aside className="w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md px-6 py-8 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r lg:bg-white lg:px-10 lg:py-12">
      <div className="flex flex-col lg:h-full">
        {/* Avatar + Name row on mobile, stacked on desktop */}
        <div className="flex items-center gap-5 lg:block">
          <div className="mb-0 h-[120px] w-[120px] shrink-0 overflow-hidden rounded-[24px] bg-neutral-100 shadow-[0_8px_32px_rgba(0,0,0,0.08)] sm:h-[140px] sm:w-[140px] lg:mb-6 lg:h-[160px] lg:w-[160px] lg:rounded-[28px]">
            <img
              src={assetUrl('avatar.jpg')}
              alt="Jack Tan"
              width={160}
              height={160}
              className="h-full w-full object-cover"
              style={{ objectPosition: 'center 35%' }}
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-[24px] font-extrabold tracking-tight text-neutral-900 sm:text-[28px] lg:text-[26px]">Jack Tan</h1>
            <p className="mt-0.5 text-sm font-semibold text-neutral-500 lg:mt-1">Personal Portfolio</p>
            <p className="mt-0.5 text-xs font-semibold tracking-tight text-neutral-700 lg:mb-4 lg:mt-1">
              站长主页・职业概览
            </p>
            <p className="hidden text-[13px] leading-relaxed text-neutral-500 lg:mb-7 lg:block">
              专注安全监察体系落地、航空安保质量管理与监管平台数字化建设。持有 2 项国家发明专利，具备国际审计全英文协作能力，推动安全管理效能持续优化。
            </p>
          </div>
        </div>

        {/* Mobile-only short bio */}
        <p className="mb-6 mt-4 text-[13px] leading-relaxed text-neutral-500 lg:hidden">
          专注安全监察体系落地、航空安保质量管理与监管平台数字化建设。持有 2 项国家发明专利，具备国际审计全英文协作能力。
        </p>

        {/* Navigation */}
        <nav aria-label="页面导航" className="mb-6 lg:mb-7">
          <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 lg:block lg:space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 lg:px-3.5 lg:py-1.5 ${
                    activeId === item.id
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                  }`}
                >
                  <svg
                    className="h-4 w-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d={item.icon} />
                  </svg>
                  <span className="truncate">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Social Links */}
        <div className="mt-auto flex flex-wrap gap-2.5 lg:mt-auto">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener"
              title={link.label}
              aria-label={link.label}
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-neutral-200 text-neutral-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-neutral-50 hover:text-neutral-800"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill={link.fill ? 'currentColor' : 'none'} stroke={link.fill ? 'none' : 'currentColor'} strokeWidth={link.fill ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
                <path d={link.icon} />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
