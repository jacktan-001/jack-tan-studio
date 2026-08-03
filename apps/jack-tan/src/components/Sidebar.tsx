import { useScrollSpy } from '../hooks/useScrollSpy'

const NAV_ITEMS = [
  { id: 'about', label: '关于我', icon: 'M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z' },
  { id: 'experience', label: '工作经历', icon: 'M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM10 5h4v2h-4V5z' },
  { id: 'projects', label: '核心项目', icon: 'M20 6h-8l-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2z' },
  { id: 'works', label: '上线作品', icon: 'M21 3H3a2 2 0 00-2 2v12a2 2 0 002 2h7v2H8v2h8v-2h-2v-2h7a2 2 0 002-2V5a2 2 0 00-2-2zm0 14H3V5h18v12z' },
  { id: 'patents', label: '专利与荣誉', icon: 'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z' },
  { id: 'skills', label: '技能与教育', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
]

const SOCIAL_LINKS = [
  { href: 'mailto:jacktan2011@icloud.com', label: 'Email', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 2l-8 5-8-5v2l8 5 8-5V6z' },
  { href: 'https://www.linkedin.com/in/jacktan2011', label: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z', fill: true },
  { href: 'https://www.instagram.com/jacktan2011', label: 'Instagram', icon: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z', fill: true },
  { href: 'https://www.xiaohongshu.com/user/profile/JackTan', label: '小红书', icon: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 17h-9a.75.75 0 01-.75-.75v-8.5A.75.75 0 017.5 7h2.25V5.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V7h2.25a.75.75 0 01.75.75v8.5a.75.75 0 01-.75.75zm-5.625-9.5h2.25V6h-2.25v1.5zM9 8.5v7h6v-7H9zm1.5 1.5h3v1h-3v-1z', fill: true },
]

export default function Sidebar() {
  const sectionIds = NAV_ITEMS.map((n) => n.id)
  const activeId = useScrollSpy(sectionIds)

  return (
    <aside className="sticky top-0 h-screen w-full overflow-y-auto border-b border-neutral-200 bg-white px-7 py-12 lg:border-b-0 lg:border-r lg:px-10">
      <div className="flex h-full flex-col">
        {/* Avatar */}
        <div className="mb-6 h-[88px] w-[88px] overflow-hidden rounded-[20px] bg-neutral-100 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          <img
            src={`${import.meta.env.BASE_URL}avatar.jpg`}
            alt="Jack Tan"
            width={88}
            height={88}
            className="h-full w-full object-cover"
            style={{ objectPosition: 'center 35%' }}
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Name & Bio */}
        <h1 className="text-[26px] font-extrabold tracking-tight text-neutral-900">Jack-Tan</h1>
        <p className="mt-1 text-sm font-semibold text-neutral-500">Personal Portfolio</p>
        <p className="mb-4 mt-1 text-xs font-semibold tracking-tight text-neutral-700">
          站长主页・职业概览
        </p>
        <p className="mb-7 text-[13px] leading-relaxed text-neutral-500">
          专注安全监察体系落地、航空安保质量管理与监管平台数字化建设。持有 2 项国家发明专利，具备国际审计全英文协作能力，推动安全管理效能持续优化。
        </p>

        {/* Navigation */}
        <nav aria-label="页面导航" className="mb-7">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`flex items-center gap-2.5 rounded-lg px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 ${
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
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Social Links */}
        <div className="mt-auto flex gap-2.5">
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
