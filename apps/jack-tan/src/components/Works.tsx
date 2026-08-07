import SectionHeader from './SectionHeader'

const WORKS = [
  {
    title: '民用机场安全监察系统',
    desc: '覆盖民用机场安全监管全业务流程的核心系统平台',
    url: 'https://sop.caac.gov.cn',
    domain: 'sop.caac.gov.cn',
    color: 'bg-neutral-200',
    iconColor: 'stroke-neutral-700',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    title: '机场建设管理类行政许可系统',
    desc: '机场建设工程行政许可事项线上办理与监管平台',
    url: 'https://sop.caac.gov.cn',
    domain: 'sop.caac.gov.cn',
    color: 'bg-neutral-100',
    iconColor: 'stroke-neutral-600',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    title: '民航工程建设标准化管理信息系统',
    desc: '民航工程建设行业标准管理与标准化信息平台',
    url: 'https://www.caecs.org.cn/',
    domain: 'caecs.org.cn',
    color: 'bg-neutral-200',
    iconColor: 'stroke-neutral-700',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  },
  {
    title: '民航专业工程招投标管理系统',
    desc: '民航专业工程建设项目招标投标全流程管理平台',
    url: 'https://zbtb.caac.gov.cn/',
    domain: 'zbtb.caac.gov.cn',
    color: 'bg-neutral-100',
    iconColor: 'stroke-neutral-600',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    title: '民用机场专用设备信息管理系统',
    desc: '民用机场专用设备全生命周期信息管理平台',
    url: 'https://adeqpt.caac.gov.cn/',
    domain: 'adeqpt.caac.gov.cn',
    color: 'bg-neutral-200',
    iconColor: 'stroke-neutral-700',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  },
  {
    title: '通用机场信息管理系统',
    desc: '通用机场信息管理与行业监管服务平台',
    url: 'https://gaa.caac.gov.cn/',
    domain: 'gaa.caac.gov.cn',
    color: 'bg-neutral-100',
    iconColor: 'stroke-neutral-600',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: '民航公安综合应用系统',
    desc: '民航公安业务综合管理与情报分析平台',
    internal: true,
    note: '内部系统 · 不对外公开',
    color: 'bg-neutral-200',
    iconColor: 'stroke-neutral-700',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    title: '民航局公安局官方网站',
    desc: '民航公安局官方门户网站，新闻宣传与政务公开平台',
    internal: true,
    note: '政务门户 · 不对外公开',
    color: 'bg-neutral-100',
    iconColor: 'stroke-neutral-600',
    icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
  },
]

function WorkCard({ work }: { work: (typeof WORKS)[0] }) {
  const Wrapper = work.internal ? 'div' : 'a'
  const props = work.internal
    ? {}
    : { href: work.url, target: '_blank', rel: 'noopener' }

  return (
    <Wrapper
      {...props}
      className="card-hover group flex flex-col rounded-2xl border border-neutral-200 bg-white p-5.5 no-underline"
    >
      <div
        className={`mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl ${work.color}`}
      >
        <svg
          className={`h-5 w-5 ${work.iconColor}`}
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={work.icon} />
        </svg>
      </div>
      <h3 className="text-sm font-bold leading-snug text-neutral-900">{work.title}</h3>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-neutral-500">{work.desc}</p>
      <div className="mt-3 flex items-center gap-1 border-t border-neutral-100 pt-2.5 text-[11px] font-medium text-neutral-500">
        {work.internal ? (
          <span>{work.note}</span>
        ) : (
          <>
            <span>{work.domain}</span>
            <span className="text-base leading-none opacity-0 transition-opacity group-hover:opacity-100">
              ↗
            </span>
          </>
        )}
      </div>
    </Wrapper>
  )
}

export default function Works() {
  return (
    <section id="works" className="section-reveal mb-16">
      <SectionHeader title="上线作品" badge="8 Systems Live" />
      <div className="grid gap-3.5 sm:grid-cols-2">
        {WORKS.map((w) => (
          <WorkCard key={w.title} work={w} />
        ))}
      </div>
    </section>
  )
}
