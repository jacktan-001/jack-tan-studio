export default function SectionHeader({
  title,
  badge,
}: {
  title: string;
  badge?: string;
}) {
  return (
    <div className="mb-7 flex items-center gap-3.5">
      <span
        aria-hidden="true"
        className="h-5 w-1 rounded-full"
        style={{ background: 'linear-gradient(180deg, var(--accent), var(--accent-2))' }}
      />
      <h2
        className="text-xl font-bold tracking-tight"
        style={{
          background: 'linear-gradient(120deg, var(--color-neutral-900), var(--accent))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {title}
      </h2>
      <div
        className="h-px flex-1"
        style={{ background: 'linear-gradient(90deg, var(--color-neutral-200), transparent)' }}
      />
      {badge && (
        <span
          className="rounded-full px-3 py-0.5 text-[11px] font-semibold"
          style={{
            color: 'var(--accent)',
            background: 'rgba(var(--accent-rgb, 124, 58, 237), 0.08)',
            border: '1px solid rgba(var(--accent-rgb, 124, 58, 237), 0.2)',
          }}
        >
          {badge}
        </span>
      )}
    </div>
  )
}
