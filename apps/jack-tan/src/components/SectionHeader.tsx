export default function SectionHeader({
  title,
  badge,
}: {
  title: string;
  badge?: string;
}) {
  return (
    <div className="mb-7 flex items-center gap-3.5">
      <h2 className="text-xl font-bold tracking-tight text-neutral-900">{title}</h2>
      <div className="h-px flex-1 bg-neutral-200" />
      {badge && (
        <span className="rounded-full bg-neutral-100 px-3 py-0.5 text-[11px] font-semibold text-neutral-600">
          {badge}
        </span>
      )}
    </div>
  )
}
