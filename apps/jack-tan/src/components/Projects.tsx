import SectionHeader from './SectionHeader'

const PROJECTS = [
  {
    title: '民航智慧监管数字化建设项目',
    role: '安全监管数字化负责人 · 2023.10 - 至今',
    desc: '面向全国民航监管场景的数字化平台建设工程，覆盖机场安全监管、行政执法、专业工程管理等核心业务领域，服务各级监管人员与全国机场运行单位。',
    highlights: [
      '整合多业务监管模块，构建标准化共享能力组件，提升监管系统的复用性与拓展效率',
      '设计统一的业务数据架构，打通多系统数据壁垒，支撑监管业务协同与数据应用',
      '推进历史业务数据治理与迁移，完成存量数据资产化沉淀，强化决策数据支撑',
      '搭建全国范围的用户培训体系，保障平台落地应用效果，覆盖各级监察员',
    ],
  },
  {
    title: '民航公安局新版门户网站建设',
    role: '项目负责人 · 2023.12 - 2024.06',
    desc: '牵头完成民航公安局新版门户网站建设，重新设计栏目板块，增加工作动态投稿、视频新闻播放、分类统计等功能。采用多层防御安全架构，运行稳定获用户好评。',
    highlights: [
      '重新设计门户栏目架构，优化信息分类与用户体验',
      '采用多层安全防御架构，保障政务系统安全稳定运行',
    ],
  },
  {
    title: '数字化安全监督管理系统（企业端）',
    role: '项目负责人 · 2020.06 - 2020.12',
    desc: '在航空公司任职期间，牵头推进数字化安全平台建设，实现监察审核全流程数字化管理，有效提升安全管理效能。',
    highlights: [
      '推进整改单、监察审核等核心模块落地，实现全流程数字化自动化',
      '建立监察任务下发、跟踪、检查单维护、整改闭环的数字化管理机制',
    ],
  },
]

export default function Projects() {
  return (
    <section id="projects" className="section-reveal mb-16">
      <SectionHeader title="核心项目" />
      <div className="space-y-3.5">
        {PROJECTS.map((p) => (
          <div
            key={p.title}
            className="card-hover rounded-2xl border border-neutral-200 bg-white p-7"
          >
            <h3 className="text-[17px] font-bold text-neutral-900">{p.title}</h3>
            <p className="mt-1 text-xs font-semibold text-neutral-500">{p.role}</p>
            <p className="mt-3.5 text-[14px] leading-[1.9] text-neutral-600">{p.desc}</p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {p.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-xl bg-neutral-50 px-3.5 py-2.5"
                >
                  <span className="mt-2 h-[5px] w-[5px] shrink-0 rounded-full bg-neutral-400" />
                  <span className="text-[13px] leading-relaxed text-neutral-600">{h}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
