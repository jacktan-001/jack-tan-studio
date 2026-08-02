import SectionHeader from './SectionHeader'

const EXPERIENCES = [
  {
    company: '民航行业监管信息化机构',
    role: '安全监管数字化负责人 · 中级工程师',
    period: '2023.10 - 至今',
    highlights: [
      '主导民航机场监管数字化平台建设，整合安全监察、行政执法、工程招投标、专用设备管理等多业务领域系统，搭建统一的机场监管业务中台，实现多源业务数据互通与能力复用',
      '牵头民航公安门户网站建设与运维，负责民航公安综合应用系统开发，保障指挥调度系统稳定运行',
      '推动监管业务数据治理与遗留系统数据迁移，沉淀监管数据资产，支撑管理决策与业务拓展',
      '负责全国监管系统用户的业务培训与落地推广，覆盖各级监管人员与机场运行单位',
    ],
    tags: ['智慧监管', '业务中台', '数据治理', '系统集成', '公安信息化'],
  },
  {
    company: '天津航空有限责任公司',
    role: '安全监察主管',
    period: '2019.11 - 2023.10',
    highlights: [
      '统筹公司安全监察体系全流程管理，主导编制年度监察计划，覆盖 12 个业务部门的日常合规检查与专项安全审核',
      '牵头推进数字化安全监督管理系统建设，实现监察任务下发、跟踪、检查单维护、整改闭环的数字化与自动化',
      '建立「跟踪-验证-闭环」的整改管理机制，依托数字化安全管理系统推动问题落地整改，提升安全管理闭环效率',
      '负责安全管理体系（SMS）日常运行维护与持续优化，开展系统性风险识别与管控',
    ],
    tags: ['SMS', '安全监察', '风险管理', '数字化安全', '闭环管理'],
  },
  {
    company: '海南航空控股股份有限公司',
    role: '航空安保质量主管',
    period: '2017.3 - 2019.11',
    highlights: [
      '统筹境内外机场安保合作协议签署与落地执行，主导航空安保管理体系（SeMS）建设与持续优化',
      '全程负责国际航协运行安全审计（IOSA）安保模块迎审工作，以零不符合项通过审计',
      '建立「制度-执行-评估」的质量管理闭环，推动安保问题整改完成率显著提升',
      '开展机组出境证件需求分析，优化人员调配利用率；统筹国际证照系统建设',
    ],
    tags: ['SeMS', 'IOSA审计', '安保协议', '质量管理', '国际证照'],
  },
  {
    company: '东海航空有限公司',
    role: '航空安保专员',
    period: '2016.7 - 2017.3',
    highlights: [
      '负责对接民航监管机构，保障公司年度安保审计与国际标准审计（IOSA）顺利通过',
      '管理国内各机场安保合作协议的签署与执行，参与公司安保管理体系（SeMS）的搭建与落地',
    ],
    tags: ['SeMS', '安保审计', '合规管理'],
  },
]

export default function Experience() {
  return (
    <section id="experience" className="section-reveal mb-16">
      <SectionHeader title="工作经历" />
      <div className="space-y-3.5">
        {EXPERIENCES.map((exp) => (
          <div
            key={exp.company}
            className="card-hover group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white px-7 py-6"
          >
            {/* Accent bar on hover */}
            <div className="absolute inset-y-0 left-0 w-[3px] bg-neutral-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="mb-2.5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-[15px] font-bold text-neutral-900">{exp.company}</div>
                <div className="mt-0.5 text-xs font-semibold text-neutral-500">{exp.role}</div>
              </div>
              <span className="shrink-0 rounded-md bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500">
                {exp.period}
              </span>
            </div>
            <ul className="mt-2.5 space-y-1">
              {exp.highlights.map((h, i) => (
                <li
                  key={i}
                  className="relative pl-3.5 text-[13px] leading-relaxed text-neutral-600 before:absolute before:left-0 before:top-[11px] before:h-[5px] before:w-[5px] before:rounded-full before:bg-neutral-400"
                >
                  {h}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {exp.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-semibold text-neutral-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
