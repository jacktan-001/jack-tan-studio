import SectionHeader from './SectionHeader'

const PATENTS = [
  {
    title: '一种无人机适飞空域中位置坐标判断方法',
    desc: '针对无人机飞行监管痛点，发明了一种高效的适飞空域位置坐标判断方法，为低空经济时代的无人机安全监管提供核心技术支撑。',
    number: 'ZL 2024 1 1889392.1',
    date: '授权 2025.08.29',
  },
  {
    title: '一种民航数据中台的异构数据存储方法及系统',
    desc: '针对民航多源异构数据整合难题，发明了高效的数据中台异构数据存储方法，支撑智慧民航建设中的数据互通与共享。',
    number: 'ZL 2025 1 1493541.7',
    date: '授权 2026.01.27',
  },
]

const HONORS = [
  {
    icon: '🏅',
    title: 'USOAP 国际审计迎审',
    desc: '参与国际民航组织 USOAP 审计迎审工作，所在集体获民航局通报表扬',
    source: '突出贡献集体成员',
  },
  {
    icon: '📜',
    title: '行业感谢信',
    desc: '民航专业工程建设项目招标投标管理系统运行保障获中国航空运输协会感谢信',
    source: '中国航空运输协会',
  },
]

export default function Patents() {
  return (
    <>
      {/* Patents */}
      <section id="patents" className="section-reveal mb-16">
        <SectionHeader title="专利成果" badge="2 Patents" />
        <div className="grid gap-3.5 sm:grid-cols-2">
          {PATENTS.map((p) => (
            <div
              key={p.number}
              className="card-hover rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <span className="mb-2.5 inline-block rounded-full bg-neutral-900 px-3 py-0.5 text-[10px] font-semibold text-white">
                国家发明专利
              </span>
              <h4 className="text-[15px] font-bold leading-snug text-neutral-900">{p.title}</h4>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">{p.desc}</p>
              <div className="mt-3.5 flex items-center justify-between border-t border-neutral-100 pt-3 text-[11px] text-neutral-400">
                <span>{p.number}</span>
                <span>{p.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Honors */}
      <section className="section-reveal mb-16">
        <SectionHeader title="荣誉与认可" />
        <div className="grid gap-3.5 sm:grid-cols-2">
          {HONORS.map((h) => (
            <div
              key={h.title}
              className="card-hover rounded-2xl border border-neutral-200 bg-white p-5.5 text-center"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-[22px]">
                {h.icon}
              </div>
              <h4 className="text-sm font-bold text-neutral-900">{h.title}</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{h.desc}</p>
              <div className="mt-2.5 text-[11px] font-semibold text-neutral-700">{h.source}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
