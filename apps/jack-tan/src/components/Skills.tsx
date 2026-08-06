import SectionHeader from './SectionHeader'

const PROFESSIONAL_SKILLS = [
  '安全管理体系 (SMS)', '安保管理体系 (SeMS)', '国际航协 IOSA 审计',
  '民航安全监察', '风险管理', '合规管理',
  '监管数字化', '数据中台建设', '数据治理',
  '系统集成', '无人机监管', '网络与数据安全',
]

const LANGUAGE_SKILLS = [
  '英语（工作语言）', 'CET-6', '普通话二甲',
  '中级工程师', 'IOSA 专项培训',
  '民航安全管理资质', '法定自查初训',
]

const EDUCATION = [
  {
    icon: '🎓',
    school: '中国民航大学',
    degree: '安全工程 · 本科',
    period: '2012.9 - 2016.7',
  },
  {
    icon: '📚',
    school: '中国民航大学',
    degree: '工商管理硕士（MBA）· 2026 级拟录取',
    period: '2026.9 -',
  },
]

export default function Skills() {
  return (
    <>
      {/* Skills */}
      <section id="skills" className="section-reveal mb-16">
        <SectionHeader title="技能与资质" />
        <div className="grid gap-3.5 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              专业能力
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {PROFESSIONAL_SKILLS.map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-px hover:bg-neutral-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              语言与资质
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGE_SKILLS.map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 transition-all duration-200 hover:-translate-y-px hover:bg-neutral-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Education */}
      <section id="education" className="section-reveal mb-16">
        <SectionHeader title="教育背景" />
        <div className="space-y-3">
          {EDUCATION.map((e) => (
            <div
              key={e.period}
              className="card-hover flex flex-col items-center gap-5 rounded-2xl border border-neutral-200 bg-white px-7 py-5.5 sm:flex-row"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-[22px]">
                {e.icon}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-[15px] font-bold text-neutral-900">{e.school}</h3>
                <p className="mt-0.5 text-xs text-neutral-500">{e.degree}</p>
              </div>
              <span className="text-[11px] font-medium text-neutral-500 sm:ml-auto">
                {e.period}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
