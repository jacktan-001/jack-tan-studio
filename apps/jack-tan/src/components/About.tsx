import SectionHeader from './SectionHeader'

const STATS = [
  { num: '9+', label: '年行业经验' },
  { num: '2 项', label: '国家发明专利' },
  { num: '8+', label: '核心系统建设' },
  { num: 'IOSA', label: '零不符合项通过' },
]

export default function About() {
  return (
    <section id="about" className="section-reveal mb-16">
      <SectionHeader title="关于我" badge="Beijing, China" />
      <div className="space-y-4 text-sm leading-[2] text-neutral-600">
        <p>
          现就职于<strong className="font-semibold text-neutral-900">民航行业监管信息化机构</strong>，驻地北京，中级工程师。
        </p>
        <p>
          入行 9 年，我从航空安保质量管理起步，历经安全监察体系建设与审计落地，逐步转向监管场景数字化建设，完成了从<strong className="font-semibold text-neutral-900">业务专家到技术驱动者</strong>的职业转型。
        </p>
        <p>
          我深度参与过国际航协运行安全审计（IOSA）、航空安保审计及国际民航组织 USOAP 审计迎审工作，主导安全管理体系（SMS）与安保管理体系（SeMS）全流程落地，熟悉国内外民航安全监管法规标准。当前聚焦<strong className="font-semibold text-neutral-900">民航智慧监管领域</strong>，主导多个核心监管系统平台建设，持有 2 项国家发明专利，推动机场安全监管场景的数字化升级与业务协同。
        </p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="card-hover rounded-xl border border-neutral-200 bg-white p-4 text-center"
          >
            <div className="text-2xl font-extrabold text-neutral-900">{s.num}</div>
            <div className="mt-0.5 text-[11px] font-medium text-neutral-400">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
